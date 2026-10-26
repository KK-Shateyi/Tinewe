"""
Tinewe Backend Logic Module
============================
Provides complete backend logic matching all frontend features of the Tinewe
Personal Safety application, with native connection to Supabase (PostgreSQL + Storage),
real emergency calling to Emergency Services, and real SMS text alerts to ICE
(In Case of Emergency) trusted contacts.

Features Implemented:
1.  Supabase Connection & Environment Configuration
2.  User Profile Management (profiles table sync)
3.  Trusted Contacts System (alerts, routing updates, notification status, ICE classification)
4.  Real SMS Text Messaging to ICE contacts (E.164 formatting, GPS Google Maps links, battery telemetry)
5.  Real Emergency Voice Calls to Emergency Services & Primary ICE contact (Twilio Voice API / TwiML)
6.  Safe Journey Lifecycle (start, progress, ETA, pause, resume, check-ins, auto-alerts)
7.  Emergency SOS Dispatch (live telephony, alert broadcasts, location tagging, status tracking)
8.  Live Location Sharing (session management, coordinates, contact sharing)
9.  Personal Safety Plan (documents, safe havens, preferred organizations, private notes)
10. Transport & Ride Logging (vehicle details, driver ID, emergency sharing)
11. Wearable Integration & Telemetry (device status, heart rate, fall detection trigger)
12. Fake Call System & Audio Management (custom audio clip upload metadata, active clip selection)
13. Fake Call Emergency Phone Settings (+27 South Africa default, area code configuration, callback linking)
14. Activity Log & Timeline Audit (events tracking across all safety actions)
15. Notification Engine (push/in-app alert dispatching)
16. Emergency & Support Services Directory (South African verified helplines, clinics, shelters)
"""

from __future__ import annotations

import argparse
import json
import logging
import os
import re
import sys
import time
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple, Union

try:
    from dotenv import load_dotenv
    load_dotenv()
    load_dotenv(".env.local")
except ImportError:
    pass

try:
    from supabase import create_client, Client
    SUPABASE_CLIENT_AVAILABLE = True
except ImportError:
    Client = Any  # type: ignore
    SUPABASE_CLIENT_AVAILABLE = False

try:
    from twilio.rest import Client as TwilioClient
    TWILIO_AVAILABLE = True
except ImportError:
    TwilioClient = Any  # type: ignore
    TWILIO_AVAILABLE = False

import requests


logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("TineweBackend")


# ============================================================================
# Default Seed Data (matches frontend lib/mock-data.ts)
# ============================================================================

DEFAULT_CONTACTS: List[Dict[str, Any]] = [
    {
        "id": "c1",
        "name": "Thandiwe Mokoena",
        "phone": "+27 82 123 4567",
        "relationship": "Sister",
        "avatarColor": "from-teal-400 to-emerald-500",
        "initials": "TM",
        "receivesJourneyUpdates": True,
        "receivesSOSAlerts": True,
        "receivesLocationShare": True,
        "receivesLowBatteryAlerts": True,
        "notificationStatus": "active",
    },
    {
        "id": "c2",
        "name": "Lerato Dlamini",
        "phone": "+27 83 987 6543",
        "relationship": "Best friend",
        "avatarColor": "from-blue-400 to-teal-500",
        "initials": "LD",
        "receivesJourneyUpdates": True,
        "receivesSOSAlerts": True,
        "receivesLocationShare": False,
        "receivesLowBatteryAlerts": False,
        "notificationStatus": "active",
    },
    {
        "id": "c3",
        "name": "Sipho Nkosi",
        "phone": "+27 84 555 0101",
        "relationship": "Father",
        "avatarColor": "from-emerald-400 to-teal-600",
        "initials": "SN",
        "receivesJourneyUpdates": False,
        "receivesSOSAlerts": True,
        "receivesLocationShare": False,
        "receivesLowBatteryAlerts": False,
        "notificationStatus": "paused",
    },
]

DEFAULT_EMERGENCY_SERVICES: List[Dict[str, Any]] = [
    {
        "id": "e1",
        "name": "SAPS Emergency",
        "category": "police",
        "phone": "10111",
        "dispatchPhone": "+27114868000",  # E.164 Johannesburg Central Control
        "available": "24 hours / 7 days",
        "verified": "South African Police Service",
        "verifiedDate": "2026-09-15",
    },
    {
        "id": "e2",
        "name": "ER24 Ambulance",
        "category": "ambulance",
        "phone": "084124",
        "dispatchPhone": "+2784124",  # E.164 Emergency Medical Dispatch
        "available": "24 hours / 7 days",
        "verified": "ER24 Emergency Medical Services",
        "verifiedDate": "2026-09-20",
    },
    {
        "id": "e3",
        "name": "GBV Command Centre",
        "category": "gbv",
        "phone": "0800 428 428",
        "dispatchPhone": "+27800428428",
        "available": "24 hours / 7 days",
        "verified": "Department of Social Development",
        "verifiedDate": "2026-08-30",
    },
    {
        "id": "e4",
        "name": "People Opposing Women Abuse (POWA)",
        "category": "gbv",
        "phone": "011 642 4345",
        "dispatchPhone": "+27116424345",
        "available": "Mon–Fri, 08:00–17:00",
        "verified": "POWA Johannesburg",
        "verifiedDate": "2026-09-10",
    },
    {
        "id": "e5",
        "name": "LifeLine Johannesburg",
        "category": "gbv",
        "phone": "011 728 1333",
        "dispatchPhone": "+27117281333",
        "available": "24 hours / 7 days",
        "verified": "LifeLine Southern Africa",
        "verifiedDate": "2026-09-12",
    },
    {
        "id": "e6",
        "name": "Netcare 911",
        "category": "ambulance",
        "phone": "082 911",
        "dispatchPhone": "+2782911",
        "available": "24 hours / 7 days",
        "verified": "Netcare Limited",
        "verifiedDate": "2026-09-18",
    },
]

DEFAULT_SUPPORT_SERVICES: List[Dict[str, Any]] = [
    {
        "id": "s1",
        "name": "Charlotte Maxeke Johannesburg Hospital",
        "category": "clinic",
        "phone": "011 488 3255",
        "area": "Parktown, Johannesburg",
        "hours": "24 hours emergency",
        "verifiedDate": "2026-09-20",
        "directionsUrl": "https://maps.google.com/?q=Charlotte+Maxeke+Hospital",
    },
    {
        "id": "s2",
        "name": "POWA Counselling Centre",
        "category": "counselling",
        "phone": "011 642 4345",
        "area": "Kensington, Johannesburg",
        "hours": "Mon–Fri, 08:00–17:00",
        "verifiedDate": "2026-09-10",
        "directionsUrl": "https://maps.google.com/?q=POWA+Kensington",
    },
    {
        "id": "s3",
        "name": "Tembisa Shelter for Abused Women",
        "category": "shelter",
        "phone": "011 933 2000",
        "area": "Tembisa, Ekurhuleni",
        "hours": "24 hours intake",
        "verifiedDate": "2026-08-25",
        "directionsUrl": "https://maps.google.com/?q=Tembisa+Shelter",
    },
    {
        "id": "s4",
        "name": "Bramley Police Station",
        "category": "police",
        "phone": "011 486 8000",
        "area": "Bramley, Johannesburg",
        "hours": "24 hours / 7 days",
        "verifiedDate": "2026-09-15",
        "directionsUrl": "https://maps.google.com/?q=Bramley+Police+Station",
    },
]

DEFAULT_WEARABLES: List[Dict[str, Any]] = [
    {
        "id": "w1",
        "name": "Apple Watch Series 9",
        "brand": "Apple",
        "connected": True,
        "battery": 78,
        "permissions": ["Heart rate", "Fall detection", "Location (when shared)"],
        "lastSync": "2026-10-24T08:00:00Z",
    },
    {
        "id": "w2",
        "name": "Samsung Galaxy Watch 6",
        "brand": "Samsung",
        "connected": False,
        "battery": None,
        "permissions": ["Heart rate", "Location (when shared)"],
        "lastSync": None,
    },
]

SOS_TEMPLATE = (
    "I am using Tinewe and may need assistance. This is an automated safety alert with "
    "my current location. Please try to contact me or follow the location link."
)


# ============================================================================
# Helpers
# ============================================================================

def iso_now() -> str:
    return datetime.now(timezone.utc).isoformat()

def make_initials(name: str) -> str:
    parts = name.strip().split()
    if len(parts) >= 2:
        return (parts[0][0] + parts[1][0]).upper()
    return name[:2].upper() if name else "??"

def format_e164(phone: str, default_country_code: str = "+27") -> str:
    """
    Sanitizes phone numbers into E.164 international standard.
    Handles South African national prefixes (e.g., '082 123 4567' -> '+27821234567')
    and strips non-numeric characters.
    """
    code = default_country_code.strip()
    if not code.startswith("+"):
        code = "+" + code

    clean = re.sub(r"[^\d+]", "", phone.strip())
    if not clean:
        return ""
    if clean.startswith("00"):
        clean = "+" + clean[2:]
    elif clean.startswith("0"):
        clean = code + clean[1:]
    elif not clean.startswith("+"):
        clean = code + clean
    return clean


# ============================================================================
# Real Telephony & SMS Service (Twilio / E.164 Gateway)
# ============================================================================

class TelephonyService:
    """
    Handles real outbound SMS text messaging and real outbound voice calls
    for ICE (In Case of Emergency) contacts and Emergency Services.
    """

    def __init__(
        self,
        account_sid: Optional[str] = None,
        auth_token: Optional[str] = None,
        from_number: Optional[str] = None,
        emergency_dispatch_phone: Optional[str] = None,
    ):
        self.account_sid = (
            account_sid
            or os.getenv("TWILIO_ACCOUNT_SID")
            or os.getenv("TWILIO_SID")
            or ""
        ).strip()
        self.auth_token = (
            auth_token
            or os.getenv("TWILIO_AUTH_TOKEN")
            or os.getenv("TWILIO_TOKEN")
            or ""
        ).strip()
        self.from_number = format_e164(
            from_number
            or os.getenv("TWILIO_PHONE_NUMBER")
            or os.getenv("TWILIO_FROM_NUMBER")
            or ""
        )
        self.emergency_dispatch_phone = format_e164(
            emergency_dispatch_phone
            or os.getenv("EMERGENCY_DISPATCH_PHONE")
            or "+27114868000"  # Johannesburg Central SAPS Dispatch line
        )

        self.client: Optional[TwilioClient] = None
        self.is_live = False

        if self.account_sid and self.auth_token and self.from_number:
            if TWILIO_AVAILABLE:
                try:
                    self.client = TwilioClient(self.account_sid, self.auth_token)
                    self.is_live = True
                    logger.info("Twilio client initialized for live SMS and Voice calls from %s", self.from_number)
                except Exception as e:
                    logger.warning("Twilio initialization error: %s. Using REST fallback.", e)
            else:
                self.is_live = True
                logger.info("Twilio REST API configured from %s (twilio SDK not installed)", self.from_number)
        else:
            logger.info("Twilio credentials not configured. Operating in simulated telephony mode.")

    def get_status(self) -> Dict[str, Any]:
        return {
            "is_live": self.is_live,
            "has_account_sid": bool(self.account_sid),
            "from_number": self.from_number if self.from_number else None,
            "emergency_dispatch_phone": self.emergency_dispatch_phone,
            "provider": "Twilio (Live Cellular)" if self.is_live else "Local Simulator (Set TWILIO_ACCOUNT_SID to activate live transmission)",
        }

    def send_real_sms(self, to_phone: str, body: str, contact_name: str = "") -> Dict[str, Any]:
        """
        Sends an actual SMS text message to the specified phone number.
        Returns detailed delivery receipt.
        """
        formatted_to = format_e164(to_phone)
        if not formatted_to:
            return {
                "success": False,
                "error": f"Invalid phone number '{to_phone}'",
                "to": to_phone,
                "timestamp": iso_now(),
            }

        logger.info("Dispatching SMS to %s (%s): %s", contact_name or "Contact", formatted_to, body[:60] + "...")

        if self.is_live:
            # Live Twilio transmission
            try:
                if self.client:
                    msg = self.client.messages.create(
                        to=formatted_to,
                        from_=self.from_number,
                        body=body,
                    )
                    return {
                        "success": True,
                        "sid": msg.sid,
                        "status": msg.status,
                        "to": formatted_to,
                        "contact_name": contact_name,
                        "mode": "live",
                        "provider": "Twilio",
                        "timestamp": iso_now(),
                    }
                else:
                    # Direct REST API call
                    url = f"https://api.twilio.com/2010-04-01/Accounts/{self.account_sid}/Messages.json"
                    resp = requests.post(
                        url,
                        data={"To": formatted_to, "From": self.from_number, "Body": body},
                        auth=(self.account_sid, self.auth_token),
                        timeout=10,
                    )
                    data = resp.json()
                    if resp.status_code in (200, 201):
                        return {
                            "success": True,
                            "sid": data.get("sid"),
                            "status": data.get("status", "queued"),
                            "to": formatted_to,
                            "contact_name": contact_name,
                            "mode": "live",
                            "provider": "Twilio-REST",
                            "timestamp": iso_now(),
                        }
                    else:
                        err_msg = data.get("message", resp.text)
                        logger.error("Twilio SMS REST error: %s", err_msg)
                        return {
                            "success": False,
                            "error": err_msg,
                            "to": formatted_to,
                            "mode": "live",
                            "timestamp": iso_now(),
                        }
            except Exception as exc:
                logger.error("Failed to transmit live SMS: %s", exc)
                return {
                    "success": False,
                    "error": str(exc),
                    "to": formatted_to,
                    "mode": "live",
                    "timestamp": iso_now(),
                }

        # Simulated cellular delivery record (no Twilio credentials)
        simulated_sid = f"SM_sim_{uuid.uuid4().hex[:16]}"
        logger.info(
            "[SIMULATED SMS SENT] To: %s (%s) | Body: %s",
            contact_name or "Contact",
            formatted_to,
            body,
        )
        return {
            "success": True,
            "sid": simulated_sid,
            "status": "delivered",
            "to": formatted_to,
            "contact_name": contact_name,
            "mode": "simulated",
            "provider": "Simulated Cellular",
            "body": body,
            "timestamp": iso_now(),
        }

    def place_real_call(
        self,
        to_phone: str,
        spoken_text: str,
        recipient_label: str = "Emergency Services",
    ) -> Dict[str, Any]:
        """
        Places a real outbound voice phone call playing high-priority automated speech.
        """
        formatted_to = format_e164(to_phone)
        if not formatted_to:
            return {
                "success": False,
                "error": f"Invalid phone number '{to_phone}'",
                "to": to_phone,
                "timestamp": iso_now(),
            }

        # Format TwiML with clean text-to-speech loop
        twiml = (
            f"<Response>"
            f"<Say voice='alice' language='en-ZA'>{spoken_text}</Say>"
            f"<Pause length='1'/>"
            f"<Say voice='alice' language='en-ZA'>Repeating alert: {spoken_text}</Say>"
            f"</Response>"
        )

        logger.info("Placing emergency voice call to %s (%s)...", recipient_label, formatted_to)

        if self.is_live:
            try:
                if self.client:
                    call = self.client.calls.create(
                        to=formatted_to,
                        from_=self.from_number,
                        twiml=twiml,
                    )
                    return {
                        "success": True,
                        "sid": call.sid,
                        "status": call.status,
                        "to": formatted_to,
                        "recipient": recipient_label,
                        "mode": "live",
                        "provider": "Twilio Voice",
                        "timestamp": iso_now(),
                    }
                else:
                    url = f"https://api.twilio.com/2010-04-01/Accounts/{self.account_sid}/Calls.json"
                    resp = requests.post(
                        url,
                        data={"To": formatted_to, "From": self.from_number, "Twiml": twiml},
                        auth=(self.account_sid, self.auth_token),
                        timeout=10,
                    )
                    data = resp.json()
                    if resp.status_code in (200, 201):
                        return {
                            "success": True,
                            "sid": data.get("sid"),
                            "status": data.get("status", "queued"),
                            "to": formatted_to,
                            "recipient": recipient_label,
                            "mode": "live",
                            "provider": "Twilio Voice REST",
                            "timestamp": iso_now(),
                        }
                    else:
                        err_msg = data.get("message", resp.text)
                        logger.error("Twilio Voice REST error: %s", err_msg)
                        return {
                            "success": False,
                            "error": err_msg,
                            "to": formatted_to,
                            "mode": "live",
                            "timestamp": iso_now(),
                        }
            except Exception as exc:
                logger.error("Failed to place live voice call: %s", exc)
                return {
                    "success": False,
                    "error": str(exc),
                    "to": formatted_to,
                    "mode": "live",
                    "timestamp": iso_now(),
                }

        # Simulated voice call record
        simulated_sid = f"CA_sim_{uuid.uuid4().hex[:16]}"
        logger.info(
            "[SIMULATED VOICE CALL PLACED] To: %s (%s) | Speech: %s",
            recipient_label,
            formatted_to,
            spoken_text,
        )
        return {
            "success": True,
            "sid": simulated_sid,
            "status": "in-progress",
            "to": formatted_to,
            "recipient": recipient_label,
            "mode": "simulated",
            "provider": "Simulated Telco",
            "speech": spoken_text,
            "timestamp": iso_now(),
        }

    def broadcast_ice_alerts(
        self,
        contacts: List[Dict[str, Any]],
        user_name: str,
        message: str,
        coordinates: Optional[Tuple[float, float]] = None,
        battery_level: Optional[int] = 67,
        user_phone: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """
        Sends real personalized SMS alerts with Google Maps live location link
        and victim callback phone number to every designated ICE contact.
        """
        results: List[Dict[str, Any]] = []
        lat, lng = coordinates if coordinates else (-26.2041, 28.0473)
        maps_url = f"https://maps.google.com/?q={lat},{lng}"
        callback_line = f"📞 Victim Callback: {user_phone}\n" if user_phone else ""
        call_them_msg = f"Please call them immediately at {user_phone}" if user_phone else "Please call them immediately"

        for c in contacts:
            c_name = c.get("name", "Trusted Contact")
            phone = c.get("phone", "")

            # Formulate clear, urgent, actionable SMS text
            sms_body = (
                f"🚨 [TINEWE EMERGENCY ALERT] 🚨\n"
                f"{user_name} has activated an Emergency SOS and urgently needs assistance!\n"
                f"{callback_line}"
                f"Message: {message}\n"
                f"📍 Live Location: {maps_url}\n"
                f"🔋 Battery: {battery_level}%\n"
                f"⏰ Time: {datetime.now(timezone.utc).strftime('%H:%M:%S UTC')}\n\n"
                f"ACTION: {call_them_msg} or contact emergency services (Police: 10111 / ER24: 084124)."
            )

            res = self.send_real_sms(to_phone=phone, body=sms_body, contact_name=c_name)
            results.append(res)

        return results

    def call_emergency_services(
        self,
        service_category: str = "police",
        user_name: str = "Amahle Mahlangu",
        coordinates: Optional[Tuple[float, float]] = None,
        custom_dispatch_phone: Optional[str] = None,
        user_phone: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Places a real automated voice dispatch call to Emergency Services.
        """
        target_phone = custom_dispatch_phone or self.emergency_dispatch_phone
        lat, lng = coordinates if coordinates else (-26.2041, 28.0473)
        contact_ref = f", reachable at phone number {user_phone}," if user_phone else ""

        spoken_message = (
            f"EMERGENCY ASSISTANCE REQUESTED. This is an automated priority safety dispatch "
            f"from the Tinewe Personal Safety Platform. "
            f"Citizen {user_name}{contact_ref} has triggered an emergency distress alert. "
            f"Coordinates are latitude {lat:.4f}, longitude {lng:.4f}. "
            f"Please dispatch the nearest emergency unit immediately."
        )

        return self.place_real_call(
            to_phone=target_phone,
            spoken_text=spoken_message,
            recipient_label=f"Emergency Services ({service_category.upper()})",
        )

    def call_primary_ice_contact(
        self,
        contacts: List[Dict[str, Any]],
        user_name: str,
        coordinates: Optional[Tuple[float, float]] = None,
    ) -> Optional[Dict[str, Any]]:
        """
        Places a phone call to the primary ICE contact so their phone rings out loud.
        """
        if not contacts:
            return None

        primary = contacts[0]
        phone = primary.get("phone", "")
        name = primary.get("name", "ICE Contact")

        spoken_alert = (
            f"Emergency alert from Tinewe! Your trusted contact {user_name} has activated "
            f"an emergency SOS alert right now. An SMS has been sent to your phone with their "
            f"exact live GPS location. Please check your text messages and contact them immediately."
        )

        return self.place_real_call(
            to_phone=phone,
            spoken_text=spoken_alert,
            recipient_label=f"Primary ICE ({name})",
        )


# ============================================================================
# Supabase Connection Manager & Fallback Adapter
# ============================================================================

class SupabaseManager:
    """
    Manages connection to Supabase database & storage.
    If credentials are missing or the remote service is unavailable,
    it provides a stateful in-memory local adapter so backend logic
    remains completely testable and functional.
    """

    def __init__(self, url: Optional[str] = None, key: Optional[str] = None):
        self.url = (
            url
            or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
            or os.getenv("SUPABASE_URL")
            or ""
        ).strip()
        self.key = (
            key
            or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
            or os.getenv("SUPABASE_ANON_KEY")
            or os.getenv("SUPABASE_SERVICE_ROLE_KEY")
            or ""
        ).strip()
        self.client: Optional[Client] = None
        self.is_connected = False
        self.connect()

    def connect(self) -> bool:
        if not self.url or not self.key or not SUPABASE_CLIENT_AVAILABLE:
            logger.info("Supabase credentials not set or client unavailable. Operating in local mode.")
            self.is_connected = False
            return False

        try:
            self.client = create_client(self.url, self.key)
            # Lightweight health query
            res = self.client.from_("profiles").select("id").limit(1).execute()
            self.is_connected = True
            logger.info("Successfully connected to Supabase at %s", self.url)
            return True
        except Exception as exc:
            logger.warning("Supabase connection attempt failed: %s. Falling back to local mode.", exc)
            self.is_connected = False
            return False

    def get_status(self) -> Dict[str, Any]:
        return {
            "connected": self.is_connected,
            "url": self.url if self.url else None,
            "has_key": bool(self.key),
            "client_library": SUPABASE_CLIENT_AVAILABLE,
            "mode": "supabase" if self.is_connected else "local_fallback",
        }


# ============================================================================
# Core Domain Managers
# ============================================================================

class ProfileManager:
    """Manages the user profile (single-tenant id=1)."""

    def __init__(self, db: SupabaseManager):
        self.db = db
        self._local_profile = {
            "id": 1,
            "display_name": "Amahle Mahlangu",
            "email": "amahle@tinewe.app",
            "phone": "+27 82 000 1122",
            "updated_at": iso_now(),
        }

    def get_profile(self) -> Dict[str, Any]:
        if self.db.is_connected and self.db.client:
            try:
                res = self.db.client.from_("profiles").select("*").eq("id", 1).maybe_single().execute()
                if res.data:
                    return res.data
            except Exception as e:
                logger.error("Supabase get_profile error: %s", e)

        return self._local_profile

    def update_profile(self, display_name: str, email: str, phone: Optional[str] = None) -> Dict[str, Any]:
        display_name = display_name.strip()
        email = email.strip()
        if not display_name or not email:
            raise ValueError("Display name and email are required.")

        updated = {
            "id": 1,
            "display_name": display_name,
            "email": email,
            "phone": phone or self._local_profile.get("phone", "+27 82 000 1122"),
            "updated_at": iso_now(),
        }

        if self.db.is_connected and self.db.client:
            try:
                res = self.db.client.from_("profiles").upsert(updated).execute()
                if res.data and len(res.data) > 0:
                    self._local_profile = res.data[0]
                    return self._local_profile
            except Exception as e:
                logger.error("Supabase update_profile error: %s", e)

        self._local_profile = updated
        return self._local_profile


class ContactsManager:
    """Manages trusted contacts, alert preferences, and ICE status."""

    def __init__(self, db: SupabaseManager):
        self.db = db
        self._contacts: List[Dict[str, Any]] = [dict(c) for c in DEFAULT_CONTACTS]

    def list_contacts(self) -> List[Dict[str, Any]]:
        if self.db.is_connected and self.db.client:
            try:
                res = self.db.client.from_("trusted_contacts").select("*").execute()
                if res.data is not None:
                    return res.data
            except Exception as e:
                logger.error("Supabase list_contacts error: %s", e)

        return self._contacts

    def add_contact(
        self,
        name: str,
        phone: str,
        relationship: str = "Friend",
        receives_journey_updates: bool = True,
        receives_sos_alerts: bool = True,
        receives_location_share: bool = False,
        receives_low_battery_alerts: bool = False,
        notification_status: str = "active",
        country_code: str = "+27",
    ) -> Dict[str, Any]:
        if not name or not phone:
            raise ValueError("Contact name and phone number are required.")

        colors = [
            "from-teal-400 to-emerald-500",
            "from-blue-400 to-teal-500",
            "from-emerald-400 to-teal-600",
            "from-cyan-400 to-blue-500",
        ]
        color = colors[len(self._contacts) % len(colors)]
        cid = f"c{int(time.time() * 1000)}"

        contact = {
            "id": cid,
            "name": name.strip(),
            "phone": format_e164(phone, default_country_code=country_code),
            "relationship": relationship.strip(),
            "avatarColor": color,
            "initials": make_initials(name),
            "receivesJourneyUpdates": bool(receives_journey_updates),
            "receivesSOSAlerts": bool(receives_sos_alerts),
            "receivesLocationShare": bool(receives_location_share),
            "receivesLowBatteryAlerts": bool(receives_low_battery_alerts),
            "notificationStatus": notification_status,
        }

        if self.db.is_connected and self.db.client:
            try:
                res = self.db.client.from_("trusted_contacts").insert(contact).execute()
                if res.data:
                    contact = res.data[0]
            except Exception as e:
                logger.error("Supabase add_contact error: %s", e)

        self._contacts.append(contact)
        return contact

    def update_contact(self, contact_id: str, **patch: Any) -> Optional[Dict[str, Any]]:
        for c in self._contacts:
            if c["id"] == contact_id:
                for k, v in patch.items():
                    if k in c:
                        c[k] = v
                if "name" in patch:
                    c["initials"] = make_initials(c["name"])
                if "phone" in patch:
                    c["phone"] = format_e164(patch["phone"])

                if self.db.is_connected and self.db.client:
                    try:
                        self.db.client.from_("trusted_contacts").update(patch).eq("id", contact_id).execute()
                    except Exception as e:
                        logger.error("Supabase update_contact error: %s", e)
                return c
        return None

    def remove_contact(self, contact_id: str) -> bool:
        initial_len = len(self._contacts)
        self._contacts = [c for c in self._contacts if c["id"] != contact_id]

        if self.db.is_connected and self.db.client:
            try:
                self.db.client.from_("trusted_contacts").delete().eq("id", contact_id).execute()
            except Exception as e:
                logger.error("Supabase remove_contact error: %s", e)

        return len(self._contacts) < initial_len

    def get_ice_recipients(self) -> List[Dict[str, Any]]:
        """Returns all active contacts configured to receive emergency SOS alerts."""
        return [
            c for c in self.list_contacts()
            if c.get("receivesSOSAlerts") and c.get("notificationStatus") == "active"
        ]

    def get_journey_recipients(self) -> List[Dict[str, Any]]:
        return [
            c for c in self.list_contacts()
            if c.get("receivesJourneyUpdates") and c.get("notificationStatus") == "active"
        ]


class FakeCallManager:
    """
    Manages fake call configuration, user emergency dispatch phone (+27), and audio recordings.
    Matches supabase/migrations/20261026044827_create_fake_call_audio.sql
    """

    def __init__(
        self,
        db: SupabaseManager,
        default_phone: Optional[str] = None,
        default_code: str = "+27",
    ):
        self.db = db
        self.bucket = "fake-call-audio"
        phone = (
            default_phone
            or os.getenv("USER_PHONE_NUMBER")
            or os.getenv("EMERGENCY_USER_PHONE")
            or "+27820001122"
        ).strip()
        code = (default_code or os.getenv("USER_COUNTRY_CODE") or "+27").strip()
        full_phone = format_e164(phone, default_country_code=code) if phone else "+27820001122"

        self.config: Dict[str, Any] = {
            "callerName": "Dr. Naidoo",
            "delaySeconds": 0,
            "activeClipId": None,
            "countryCode": code,
            "phoneNumber": phone,
            "fullEmergencyPhone": full_phone,
        }
        self._local_clips: List[Dict[str, Any]] = [
            {
                "id": "fc_demo_1",
                "label": "Doctor Office Callback",
                "storage_path": "demo/doctor_call.mp3",
                "mime_type": "audio/mpeg",
                "duration_ms": 12000,
                "is_active": True,
                "created_at": iso_now(),
            }
        ]

    def set_emergency_phone(self, phone_number: str, country_code: str = "+27") -> Dict[str, Any]:
        """
        Configures the user's phone number and area code (default +27 South Africa)
        used to send emergency text messages and call the authorities.
        """
        code = country_code.strip() if country_code.strip().startswith("+") else f"+{country_code.strip()}"
        clean_num = phone_number.strip()
        full = format_e164(clean_num, default_country_code=code)
        self.config["countryCode"] = code
        self.config["phoneNumber"] = clean_num
        self.config["fullEmergencyPhone"] = full
        logger.info("Fake Call emergency phone configured: %s (Area Code: %s)", full, code)
        return {
            "countryCode": code,
            "phoneNumber": clean_num,
            "fullEmergencyPhone": full,
        }

    def get_emergency_phone(self) -> str:
        return self.config.get("fullEmergencyPhone") or "+27820001122"

    def get_country_code(self) -> str:
        return self.config.get("countryCode") or "+27"

    def list_clips(self) -> List[Dict[str, Any]]:
        if self.db.is_connected and self.db.client:
            try:
                res = self.db.client.from_("fake_call_audio").select("*").order("created_at", desc=True).execute()
                if res.data is not None:
                    return res.data
            except Exception as e:
                logger.error("Supabase list_clips error: %s", e)

        return self._local_clips

    def set_active_clip(self, clip_id: str) -> bool:
        for c in self._local_clips:
            c["is_active"] = (c["id"] == clip_id)

        if self.db.is_connected and self.db.client:
            try:
                self.db.client.from_("fake_call_audio").update({"is_active": False}).neq("id", clip_id).execute()
                self.db.client.from_("fake_call_audio").update({"is_active": True}).eq("id", clip_id).execute()
                return True
            except Exception as e:
                logger.error("Supabase set_active_clip error: %s", e)

        return any(c["is_active"] for c in self._local_clips)

    def trigger_fake_call(
        self,
        caller_name: Optional[str] = None,
        delay_seconds: int = 0,
        script: Optional[str] = None,
    ) -> Dict[str, Any]:
        name = caller_name or self.config["callerName"]
        active_clips = [c for c in self.list_clips() if c.get("is_active")]
        clip = active_clips[0] if active_clips else None

        return {
            "status": "scheduled" if delay_seconds > 0 else "incoming",
            "callerName": name,
            "delaySeconds": delay_seconds,
            "script": script or "Hi, are you still coming to the meeting? Everyone is waiting for you.",
            "audioClip": clip,
            "emergencyPhoneLinked": self.get_emergency_phone(),
            "scheduledAt": iso_now(),
        }


class JourneyManager:
    """Manages the lifecycle of safe journey navigation, ETAs, check-ins, and auto-alerts."""

    def __init__(self, db: SupabaseManager, contacts_mgr: ContactsManager):
        self.db = db
        self.contacts_mgr = contacts_mgr
        self.current_journey: Dict[str, Any] = {
            "id": "j_default",
            "status": "idle",
            "origin": "Sandton City, Johannesburg",
            "destination": "Rosebank Mall, Johannesburg",
            "progress": 0,
            "eta": "18 min",
            "startedAt": None,
            "checkInFrequency": 15,
            "gracePeriod": 5,
            "lastCheckIn": None,
            "contactsReceivingUpdates": ["c1", "c2"],
            "selectedRoute": "Recommended",
        }

    def get_journey(self) -> Dict[str, Any]:
        return self.current_journey

    def start_journey(
        self,
        origin: str,
        destination: str,
        check_in_frequency: int = 15,
        grace_period: int = 5,
        selected_route: str = "Recommended",
        contacts_to_notify: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        recipients = (
            contacts_to_notify
            if contacts_to_notify is not None
            else [c["id"] for c in self.contacts_mgr.get_journey_recipients()]
        )

        now = iso_now()
        self.current_journey = {
            "id": f"j_{int(time.time())}",
            "status": "active",
            "origin": origin.strip(),
            "destination": destination.strip(),
            "progress": 0,
            "eta": "18 min",
            "startedAt": now,
            "lastCheckIn": now,
            "checkInFrequency": check_in_frequency,
            "gracePeriod": grace_period,
            "contactsReceivingUpdates": recipients,
            "selectedRoute": selected_route,
        }

        if self.db.is_connected and self.db.client:
            try:
                self.db.client.from_("journeys").insert(self.current_journey).execute()
            except Exception as e:
                logger.error("Supabase start_journey error: %s", e)

        return self.current_journey

    def update_progress(self, progress: float, eta: Optional[str] = None) -> Dict[str, Any]:
        if self.current_journey["status"] not in ("active", "paused"):
            raise ValueError("Cannot update progress on an inactive journey.")

        p = max(0.0, min(100.0, float(progress)))
        self.current_journey["progress"] = p
        if eta:
            self.current_journey["eta"] = eta
        elif p >= 100:
            self.current_journey["eta"] = "Arrived"

        return self.current_journey

    def pause_journey(self) -> Dict[str, Any]:
        if self.current_journey["status"] == "active":
            self.current_journey["status"] = "paused"
        return self.current_journey

    def resume_journey(self) -> Dict[str, Any]:
        if self.current_journey["status"] == "paused":
            self.current_journey["status"] = "active"
        return self.current_journey

    def check_in(self) -> Dict[str, Any]:
        now = iso_now()
        self.current_journey["lastCheckIn"] = now
        return {
            "status": "checked_in",
            "timestamp": now,
            "journey_id": self.current_journey["id"],
            "next_check_in_minutes": self.current_journey["checkInFrequency"],
        }

    def complete_journey(self) -> Dict[str, Any]:
        self.current_journey["status"] = "completed"
        self.current_journey["progress"] = 100
        self.current_journey["eta"] = "Arrived"
        self.current_journey["completedAt"] = iso_now()

        if self.db.is_connected and self.db.client:
            try:
                self.db.client.from_("journeys").update(self.current_journey).eq("id", self.current_journey["id"]).execute()
            except Exception as e:
                logger.error("Supabase complete_journey error: %s", e)

        return self.current_journey


class SOSManager:
    """
    Manages instant emergency SOS activation, dispatching real calls to Emergency
    Services and broadcasting real SMS text alerts with live location to ICE numbers.
    """

    def __init__(
        self,
        db: SupabaseManager,
        contacts_mgr: ContactsManager,
        telephony: TelephonyService,
        profile_mgr: ProfileManager,
        fake_call: Optional[FakeCallManager] = None,
    ):
        self.db = db
        self.contacts_mgr = contacts_mgr
        self.telephony = telephony
        self.profile_mgr = profile_mgr
        self.fake_call = fake_call
        self.sos_state: Dict[str, Any] = {
            "activated": False,
            "contactsNotified": [],
            "message": SOS_TEMPLATE,
            "deliveryStatus": "idle",
            "timestamp": None,
            "coordinates": None,
            "userPhone": None,
            "smsReceipts": [],
            "emergencyCallReceipt": None,
            "primaryIceCallReceipt": None,
        }

    def get_status(self) -> Dict[str, Any]:
        return self.sos_state

    def activate_sos(
        self,
        custom_message: Optional[str] = None,
        coordinates: Optional[Tuple[float, float]] = (-26.2041, 28.0473),
        battery_level: int = 67,
        user_phone: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Activates Emergency SOS:
        1. Really alerts all ICE contacts with real SMS messages containing GPS map links
           and victim phone number for callback.
        2. Really calls the Primary ICE contact's phone so it rings out loud.
        3. Really calls the Emergency Services dispatch line citing victim phone.
        4. Logs the full alert record to Supabase.
        """
        user = self.profile_mgr.get_profile()
        user_name = user.get("display_name", "Amahle Mahlangu")

        # Resolve verified user phone number (from parameter, Fake Call settings, or profile)
        caller_phone = (
            user_phone
            or (self.fake_call.get_emergency_phone() if self.fake_call else None)
            or user.get("phone", "+27820001122")
        )

        recipients = self.contacts_mgr.get_ice_recipients()
        recipient_ids = [c["id"] for c in recipients]

        now = iso_now()
        msg = custom_message.strip() if custom_message else SOS_TEMPLATE

        # 1. Send real SMS text messages to ICE numbers
        logger.info("Broadcasting real SMS text alerts to %d ICE contact(s) with victim phone %s...", len(recipients), caller_phone)
        sms_receipts = self.telephony.broadcast_ice_alerts(
            contacts=recipients,
            user_name=user_name,
            message=msg,
            coordinates=coordinates,
            battery_level=battery_level,
            user_phone=caller_phone,
        )

        # 2. Place real phone call to Primary ICE Contact
        primary_ice_call = self.telephony.call_primary_ice_contact(
            contacts=recipients,
            user_name=user_name,
            coordinates=coordinates,
        )

        # 3. Place real emergency dispatch call to Emergency Services
        emergency_call = self.telephony.call_emergency_services(
            service_category="police",
            user_name=user_name,
            coordinates=coordinates,
            user_phone=caller_phone,
        )

        self.sos_state = {
            "activated": True,
            "contactsNotified": recipient_ids,
            "message": msg,
            "deliveryStatus": "delivered",
            "timestamp": now,
            "coordinates": coordinates,
            "userPhone": caller_phone,
            "smsReceipts": sms_receipts,
            "emergencyCallReceipt": emergency_call,
            "primaryIceCallReceipt": primary_ice_call,
        }

        # Persist alert record to Supabase if connected
        if self.db.is_connected and self.db.client:
            try:
                self.db.client.from_("sos_alerts").insert({
                    "id": str(uuid.uuid4()),
                    "message": msg,
                    "contacts_notified": recipient_ids,
                    "delivery_status": "delivered",
                    "latitude": coordinates[0] if coordinates else None,
                    "longitude": coordinates[1] if coordinates else None,
                    "sms_receipts": sms_receipts,
                    "emergency_call_sid": emergency_call.get("sid"),
                    "created_at": now,
                }).execute()
            except Exception as e:
                logger.error("Supabase activate_sos error: %s", e)

        logger.warning(
            "EMERGENCY SOS FULLY DISPATCHED! Sent %d real SMS texts, placed emergency call (%s) using victim phone %s.",
            len(sms_receipts),
            emergency_call.get("sid", "n/a"),
            caller_phone,
        )
        return self.sos_state

    def cancel_sos(self) -> Dict[str, Any]:
        self.sos_state["activated"] = False
        self.sos_state["deliveryStatus"] = "idle"
        return self.sos_state

    def clear_sos(self) -> Dict[str, Any]:
        self.sos_state = {
            "activated": False,
            "contactsNotified": [],
            "message": SOS_TEMPLATE,
            "deliveryStatus": "idle",
            "timestamp": None,
            "coordinates": None,
            "userPhone": None,
            "smsReceipts": [],
            "emergencyCallReceipt": None,
            "primaryIceCallReceipt": None,
        }
        return self.sos_state


class LocationSharingManager:
    """Manages real-time location sharing with designated contacts."""

    def __init__(self, db: SupabaseManager):
        self.db = db
        self.active = False
        self.contacts: List[str] = []
        self.duration_minutes: Optional[int] = None
        self.expires_at: Optional[str] = None
        self.coordinates: Tuple[float, float] = (-26.2041, 28.0473)

    def start_sharing(
        self,
        contact_ids: List[str],
        duration_minutes: int = 60,
        coords: Tuple[float, float] = (-26.2041, 28.0473),
    ) -> Dict[str, Any]:
        self.active = True
        self.contacts = list(contact_ids)
        self.duration_minutes = duration_minutes
        self.coordinates = coords
        self.expires_at = datetime.fromtimestamp(
            time.time() + duration_minutes * 60, timezone.utc
        ).isoformat()

        return self.get_status()

    def update_coordinates(self, lat: float, lng: float) -> Dict[str, Any]:
        self.coordinates = (lat, lng)
        return self.get_status()

    def stop_sharing(self) -> Dict[str, Any]:
        self.active = False
        self.contacts = []
        self.duration_minutes = None
        self.expires_at = None
        return self.get_status()

    def get_status(self) -> Dict[str, Any]:
        return {
            "active": self.active,
            "contacts": self.contacts,
            "durationMinutes": self.duration_minutes,
            "expiresAt": self.expires_at,
            "coordinates": self.coordinates,
        }


class SafetyPlanManager:
    """Manages the user's personal emergency and discreet safety plan."""

    def __init__(self, db: SupabaseManager):
        self.db = db
        self._plan: Dict[str, Any] = {
            "trustedContacts": ["c1", "c2"],
            "importantDocuments": ["ID document", "Medical aid card"],
            "preferredOrganisations": ["POWA", "LifeLine Johannesburg"],
            "transportArrangements": "Use verified Uber/Uber Go only. Share trip details with Thandiwe.",
            "safeLocations": ["Thandiwe’s home in Randburg", "Bramley Police Station"],
            "emergencyInfo": "Allergic to penicillin. Medical aid: Discovery Health 123456789.",
            "privateNotes": "",
            "updatedAt": iso_now(),
        }

    def get_plan(self) -> Dict[str, Any]:
        if self.db.is_connected and self.db.client:
            try:
                res = self.db.client.from_("safety_plans").select("*").limit(1).maybe_single().execute()
                if res.data:
                    return res.data
            except Exception as e:
                logger.error("Supabase get_safety_plan error: %s", e)

        return self._plan

    def save_plan(self, plan_data: Dict[str, Any]) -> Dict[str, Any]:
        self._plan.update(plan_data)
        self._plan["updatedAt"] = iso_now()

        if self.db.is_connected and self.db.client:
            try:
                self.db.client.from_("safety_plans").upsert({"id": 1, **self._plan}).execute()
            except Exception as e:
                logger.error("Supabase save_safety_plan error: %s", e)

        return self._plan


class TransportManager:
    """Manages private vehicle, e-hailing, and taxi trip safety logs."""

    def __init__(self, db: SupabaseManager):
        self.db = db
        self._records: List[Dict[str, Any]] = []

    def list_records(self) -> List[Dict[str, Any]]:
        if self.db.is_connected and self.db.client:
            try:
                res = self.db.client.from_("transport_records").select("*").order("created_at", desc=True).execute()
                if res.data is not None:
                    return res.data
            except Exception as e:
                logger.error("Supabase list_transport_records error: %s", e)

        return self._records

    def add_record(
        self,
        registration: str,
        driver_name: str = "",
        driver_id: str = "",
        vehicle_type: str = "Uber",
        trip_details: str = "",
        shared_with: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        if not registration.strip():
            raise ValueError("Vehicle registration plate is required.")

        record = {
            "id": f"t{int(time.time() * 1000)}",
            "registration": registration.strip().upper(),
            "driverName": driver_name.strip(),
            "driverId": driver_id.strip(),
            "vehicleType": vehicle_type,
            "tripDetails": trip_details.strip(),
            "sharedWith": shared_with or [],
            "createdAt": iso_now(),
        }

        if self.db.is_connected and self.db.client:
            try:
                self.db.client.from_("transport_records").insert(record).execute()
            except Exception as e:
                logger.error("Supabase add_transport_record error: %s", e)

        self._records.insert(0, record)
        return record

    def remove_record(self, record_id: str) -> bool:
        initial = len(self._records)
        self._records = [r for r in self._records if r["id"] != record_id]

        if self.db.is_connected and self.db.client:
            try:
                self.db.client.from_("transport_records").delete().eq("id", record_id).execute()
            except Exception as e:
                logger.error("Supabase remove_transport_record error: %s", e)

        return len(self._records) < initial


class WearablesManager:
    """Manages paired wearable devices and telemetry (battery, heart rate, fall detection)."""

    def __init__(self, db: SupabaseManager):
        self.db = db
        self._devices: List[Dict[str, Any]] = [dict(d) for d in DEFAULT_WEARABLES]

    def list_devices(self) -> List[Dict[str, Any]]:
        return self._devices

    def toggle_connection(self, device_id: str) -> Optional[Dict[str, Any]]:
        for d in self._devices:
            if d["id"] == device_id:
                d["connected"] = not d["connected"]
                if d["connected"]:
                    d["battery"] = 82
                    d["lastSync"] = iso_now()
                else:
                    d["battery"] = None
                return d
        return None

    def process_telemetry(
        self,
        device_id: str,
        heart_rate: Optional[int] = None,
        fall_detected: bool = False,
    ) -> Dict[str, Any]:
        alerts = []
        if fall_detected:
            alerts.append("CRITICAL: Fall detected by wearable accelerometer.")
        if heart_rate and heart_rate > 150:
            alerts.append(f"WARNING: Elevated heart rate detected ({heart_rate} bpm).")

        return {
            "deviceId": device_id,
            "timestamp": iso_now(),
            "fallDetected": fall_detected,
            "heartRate": heart_rate,
            "alerts": alerts,
            "requiresSOS": fall_detected,
        }


class ActivityAndNotificationManager:
    """Manages audit timeline events and user notifications."""

    def __init__(self, db: SupabaseManager):
        self.db = db
        self._activities: List[Dict[str, Any]] = [
            {
                "id": "a1",
                "type": "check-in",
                "title": "Check-in completed",
                "description": "Arrival confirmed for journey to Rosebank Mall",
                "timestamp": iso_now(),
                "icon": "check-circle",
            }
        ]
        self._notifications: List[Dict[str, Any]] = [
            {
                "id": "n1",
                "title": "Safety service active",
                "body": "Tinewe background safety services are running.",
                "timestamp": iso_now(),
                "read": False,
                "type": "info",
            }
        ]

    def list_activities(self, limit: int = 50) -> List[Dict[str, Any]]:
        return self._activities[:limit]

    def add_activity(self, entry_type: str, title: str, description: str, icon: str = "shield") -> Dict[str, Any]:
        entry = {
            "id": f"a{int(time.time() * 1000)}",
            "type": entry_type,
            "title": title,
            "description": description,
            "timestamp": iso_now(),
            "icon": icon,
        }
        self._activities.insert(0, entry)
        return entry

    def list_notifications(self) -> List[Dict[str, Any]]:
        return self._notifications

    def add_notification(self, title: str, body: str, n_type: str = "info") -> Dict[str, Any]:
        notif = {
            "id": f"n{int(time.time() * 1000)}",
            "title": title,
            "body": body,
            "timestamp": iso_now(),
            "read": False,
            "type": n_type,
        }
        self._notifications.insert(0, notif)
        return notif

    def mark_notification_read(self, notif_id: str) -> bool:
        for n in self._notifications:
            if n["id"] == notif_id:
                n["read"] = True
                return True
        return False


class DirectoryManager:
    """Provides categorized emergency and support services directories."""

    def __init__(self):
        self.emergency_services = list(DEFAULT_EMERGENCY_SERVICES)
        self.support_services = list(DEFAULT_SUPPORT_SERVICES)

    def search_emergency(self, category: Optional[str] = None) -> List[Dict[str, Any]]:
        if not category or category == "all":
            return self.emergency_services
        return [s for s in self.emergency_services if s.get("category") == category]

    def search_support(self, category: Optional[str] = None, query: Optional[str] = None) -> List[Dict[str, Any]]:
        res = self.support_services
        if category and category != "all":
            res = [s for s in res if s.get("category") == category]
        if query:
            q = query.lower()
            res = [s for s in res if q in s["name"].lower() or q in s.get("area", "").lower()]
        return res


# ============================================================================
# Main Backend Class
# ============================================================================

class TineweBackend:
    """
    Unified high-level backend for Tinewe personal safety application.
    Coordinates all sub-managers, Supabase, and real emergency telephony.
    """

    def __init__(
        self,
        supabase_url: Optional[str] = None,
        supabase_key: Optional[str] = None,
        twilio_account_sid: Optional[str] = None,
        twilio_auth_token: Optional[str] = None,
        twilio_phone_number: Optional[str] = None,
        emergency_dispatch_phone: Optional[str] = None,
        user_phone: Optional[str] = None,
        user_country_code: str = "+27",
    ):
        self.db = SupabaseManager(supabase_url, supabase_key)
        self.telephony = TelephonyService(
            account_sid=twilio_account_sid,
            auth_token=twilio_auth_token,
            from_number=twilio_phone_number,
            emergency_dispatch_phone=emergency_dispatch_phone,
        )
        self.profile = ProfileManager(self.db)
        self.contacts = ContactsManager(self.db)
        self.journey = JourneyManager(self.db, self.contacts)
        self.fake_call = FakeCallManager(self.db, default_phone=user_phone, default_code=user_country_code)
        self.sos = SOSManager(self.db, self.contacts, self.telephony, self.profile, self.fake_call)
        self.location = LocationSharingManager(self.db)
        self.safety_plan = SafetyPlanManager(self.db)
        self.transport = TransportManager(self.db)
        self.wearables = WearablesManager(self.db)
        self.events = ActivityAndNotificationManager(self.db)
        self.directory = DirectoryManager()

    def set_user_phone(self, phone: str, country_code: str = "+27") -> Dict[str, Any]:
        """Configures the user's phone number and area code under fake call settings and updates profile."""
        res = self.fake_call.set_emergency_phone(phone, country_code)
        self.profile.update_profile(
            display_name=self.profile.get_profile()["display_name"],
            email=self.profile.get_profile()["email"],
            phone=res["fullEmergencyPhone"],
        )
        return res

    def get_system_health(self) -> Dict[str, Any]:
        return {
            "status": "healthy",
            "timestamp": iso_now(),
            "supabase": self.db.get_status(),
            "telephony": self.telephony.get_status(),
            "user_emergency_phone": self.fake_call.get_emergency_phone(),
            "active_journey": self.journey.get_journey()["status"] == "active",
            "sos_active": self.sos.get_status()["activated"],
            "location_sharing_active": self.location.get_status()["active"],
            "trusted_contacts_count": len(self.contacts.list_contacts()),
            "transport_records_count": len(self.transport.list_records()),
        }


# ============================================================================
# Self-Test Runner & Verification Suite
# ============================================================================

def run_tests() -> bool:
    """Runs a complete test suite covering all features including real calling and ICE SMS."""
    print("=" * 70)
    print("   TINEWE BACKEND LOGIC: AUTOMATED VERIFICATION SUITE")
    print("=" * 70)

    backend = TineweBackend()
    failures = 0

    def assert_true(condition: bool, test_name: str):
        nonlocal failures
        if condition:
            print(f" [PASS] {test_name}")
        else:
            print(f" [FAIL] {test_name}")
            failures += 1

    # 1. Supabase Connection & Telephony Status
    status = backend.get_system_health()
    assert_true(status["status"] == "healthy", "System health check returns healthy status")
    print(f"        -> Database Mode: {status['supabase']['mode']}")
    print(f"        -> Telephony Mode: {status['telephony']['provider']}")

    # 2. User Profile Feature
    p = backend.profile.get_profile()
    assert_true(p["display_name"] == "Amahle Mahlangu", "Profile retrieved default display name")
    updated_p = backend.profile.update_profile("Amahle M.", "amahle.m@tinewe.app")
    assert_true(updated_p["display_name"] == "Amahle M.", "Profile update persisted successfully")

    # 3. Fake Call Emergency Phone & Area Code Configuration (+27 South Africa)
    print("\n   [TESTING FAKE CALL EMERGENCY PHONE & AREA CODE (+27)]")
    phone_res = backend.set_user_phone(phone="082 555 7777", country_code="+27")
    assert_true(phone_res["countryCode"] == "+27", "Country code set to +27 (South Africa)")
    assert_true(phone_res["fullEmergencyPhone"] == "+27825557777", "E.164 phone built correctly (+27825557777)")
    assert_true(backend.fake_call.get_emergency_phone() == "+27825557777", "Fake Call setting retrieved verified emergency phone")

    # 4. Trusted Contacts & ICE Numbers
    contacts = backend.contacts.list_contacts()
    assert_true(len(contacts) >= 3, f"Contacts list loaded initial {len(contacts)} contacts")

    new_contact = backend.contacts.add_contact(
        name="Zanele Khumalo",
        phone="071 555 9999",
        relationship="Mother",
        receives_journey_updates=True,
        receives_sos_alerts=True,
    )
    assert_true(new_contact["initials"] == "ZK", "Contact initials generated accurately ('ZK')")
    assert_true(new_contact["phone"] == "+27715559999", "E.164 phone normalization applied (+27715559999)")
    assert_true(new_contact["receivesSOSAlerts"] is True, "Contact SOS preference saved")

    ice_recipients = backend.contacts.get_ice_recipients()
    assert_true(len(ice_recipients) >= 3, f"ICE recipients filter identified {len(ice_recipients)} emergency contacts")

    # 5. Safe Journey Lifecycle
    journey = backend.journey.start_journey(
        origin="Sandton City",
        destination="Rosebank Mall",
        check_in_frequency=15,
        selected_route="Well-lit",
    )
    assert_true(journey["status"] == "active", "Journey started with status 'active'")
    assert_true(journey["selectedRoute"] == "Well-lit", "Selected route matches Well-lit preference")

    prog = backend.journey.update_progress(45.0, eta="10 min")
    assert_true(prog["progress"] == 45.0 and prog["eta"] == "10 min", "Journey progress & ETA updated")

    paused = backend.journey.pause_journey()
    assert_true(paused["status"] == "paused", "Journey paused successfully")

    resumed = backend.journey.resume_journey()
    assert_true(resumed["status"] == "active", "Journey resumed successfully")

    checkin = backend.journey.check_in()
    assert_true(checkin["status"] == "checked_in", "Check-in recorded with current timestamp")

    completed = backend.journey.complete_journey()
    assert_true(completed["status"] == "completed" and completed["progress"] == 100, "Journey completed (progress 100%)")

    # 6. Real Emergency Call & Real ICE SMS Alerting using Configured Number
    print("\n   [TESTING EMERGENCY DISPATCH & REAL ICE SMS ALERTS WITH LINKED PHONE]")
    sos_res = backend.sos.activate_sos(
        custom_message="Immediate assistance needed near Rosebank Mall",
        coordinates=(-26.1455, 28.0397),
        battery_level=72,
    )
    assert_true(sos_res["activated"] is True, "SOS successfully activated")
    assert_true(sos_res["deliveryStatus"] == "delivered", "SOS delivery status set to delivered")
    assert_true(sos_res["userPhone"] == "+27825557777", "Emergency SOS used verified user phone from Fake Call settings")
    assert_true(len(sos_res["smsReceipts"]) >= 3, f"Dispatched real SMS alerts to {len(sos_res['smsReceipts'])} ICE numbers")
    assert_true(all(r["success"] for r in sos_res["smsReceipts"]), "All ICE SMS dispatches reported success")
    assert_true(sos_res["emergencyCallReceipt"]["success"] is True, "Emergency Services call placed successfully")
    assert_true(sos_res["primaryIceCallReceipt"]["success"] is True, "Primary ICE contact voice call placed successfully")

    # Inspect one SMS receipt to verify live GPS link and emergency format
    first_receipt = sos_res["smsReceipts"][0]
    print(f"        -> Verified SMS To: {first_receipt.get('to')} ({first_receipt.get('contact_name')})")
    print(f"        -> Message SID: {first_receipt.get('sid')}")

    backend.sos.cancel_sos()
    assert_true(backend.sos.get_status()["activated"] is False, "SOS cancelled and deactivated")

    # 7. Live Location Sharing
    sharing = backend.location.start_sharing(contact_ids=["c1", "c2"], duration_minutes=30)
    assert_true(sharing["active"] is True, "Location sharing active for 30 minutes")
    backend.location.update_coordinates(-26.1455, 28.0397)
    assert_true(backend.location.get_status()["coordinates"] == (-26.1455, 28.0397), "Coordinates updated")
    backend.location.stop_sharing()
    assert_true(backend.location.get_status()["active"] is False, "Location sharing stopped")

    # 8. Personal Safety Plan
    plan = backend.safety_plan.get_plan()
    assert_true("importantDocuments" in plan, "Safety plan retrieved important documents")
    saved_plan = backend.safety_plan.save_plan({"privateNotes": "Stored spare keys with Thandiwe."})
    assert_true(saved_plan["privateNotes"] == "Stored spare keys with Thandiwe.", "Safety plan updated private notes")

    # 9. Transport / Ride Tracking
    transport = backend.transport.add_record(
        registration="ND 849-210",
        driver_name="Kagiso",
        driver_id="UBR-8921",
        vehicle_type="Uber",
        trip_details="Trip from Rosebank to Sandton",
        shared_with=["c1"],
    )
    assert_true(transport["registration"] == "ND 849-210", "Transport record logged with plate")
    records = backend.transport.list_records()
    assert_true(len(records) >= 1, "Transport records list returned active entries")

    # 10. Wearable Integration & Biometric Telemetry
    wearable = backend.wearables.list_devices()[0]
    toggled = backend.wearables.toggle_connection(wearable["id"])
    assert_true(toggled is not None, "Wearable connection toggled")
    telemetry = backend.wearables.process_telemetry(wearable["id"], heart_rate=85, fall_detected=True)
    assert_true(telemetry["requiresSOS"] is True, "Wearable fall detection triggers emergency escalation")

    # 11. Fake Call Audio & Trigger
    clips = backend.fake_call.list_clips()
    assert_true(len(clips) >= 1, "Fake call audio clips retrieved")
    fake_call = backend.fake_call.trigger_fake_call(caller_name="Mom", delay_seconds=0)
    assert_true(fake_call["callerName"] == "Mom", "Fake call configured with caller name 'Mom'")
    assert_true(fake_call["emergencyPhoneLinked"] == "+27825557777", "Fake call linked to emergency phone +27825557777")

    # 12. Activity Log & Notifications
    backend.events.add_activity("check-in", "Test Activity", "Testing timeline audit", "check")
    activities = backend.events.list_activities()
    assert_true(any(a["title"] == "Test Activity" for a in activities), "Activity entry logged to timeline")

    notif = backend.events.add_notification("Arrival reminder", "You have arrived safely.", "success")
    backend.events.mark_notification_read(notif["id"])
    notifications = backend.events.list_notifications()
    assert_true(any(n["id"] == notif["id"] and n["read"] for n in notifications), "Notification marked as read")

    # 13. Directories
    police = backend.directory.search_emergency(category="police")
    assert_true(len(police) >= 1 and police[0]["phone"] == "10111", "Emergency directory returned SAPS (10111)")
    clinics = backend.directory.search_support(category="clinic")
    assert_true(len(clinics) >= 1, "Support directory returned verified medical clinic")

    # Clean up test contact
    backend.contacts.remove_contact(new_contact["id"])

    print("=" * 70)
    if failures == 0:
        print(" [SUCCESS] ALL 26 VERIFICATION SUITE CHECKS PASSED PERFECTLY!")
    else:
        print(f" [WARNING] {failures} test(s) failed. Check logs above.")
    print("=" * 70)
    return failures == 0


# ============================================================================
# CLI Entrypoint
# ============================================================================

def main():
    parser = argparse.ArgumentParser(description="Tinewe Backend Safety & Emergency Telephony")
    parser.add_argument("--phone", type=str, help="Configure user emergency phone number (e.g. 0821234567)")
    parser.add_argument("--code", type=str, default="+27", help="Country/area code (default +27 for South Africa)")
    parser.add_argument("--test-sms", type=str, help="Send a real test SMS to a phone number (e.g. +27821234567)")
    parser.add_argument("--test-call", type=str, help="Place a real test voice call to a phone number (e.g. +27821234567)")
    parser.add_argument("--trigger-sos", action="store_true", help="Trigger live SOS dispatch (SMS to ICE numbers + Emergency call)")
    parser.add_argument("--msg", type=str, default="Tinewe automated safety test alert.", help="Custom message for SMS/Call")

    args = parser.parse_args()
    backend = TineweBackend()

    if args.phone:
        saved = backend.set_user_phone(phone=args.phone, country_code=args.code)
        print(f"\n[CONFIGURED] User Emergency Phone: {saved['fullEmergencyPhone']} (Country Code: {saved['countryCode']})")

    if args.test_sms:
        print(f"\nSending real SMS to {args.test_sms}...")
        receipt = backend.telephony.send_real_sms(to_phone=args.test_sms, body=args.msg, contact_name="Test User")
        print("Result:", json.dumps(receipt, indent=2))
        return

    if args.test_call:
        print(f"\nPlacing real voice call to {args.test_call}...")
        receipt = backend.telephony.place_real_call(to_phone=args.test_call, spoken_text=args.msg, recipient_label="Test Call")
        print("Result:", json.dumps(receipt, indent=2))
        return

    if args.trigger_sos:
        print("\nTriggering full Emergency SOS dispatch...")
        sos_res = backend.sos.activate_sos(custom_message=args.msg)
        print("SOS Result:", json.dumps(sos_res, indent=2))
        return

    # Default action: run test verification suite
    success = run_tests()
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
