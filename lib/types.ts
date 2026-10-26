export type NavKey =
  | 'dashboard'
  | 'journey'
  | 'location'
  | 'contacts'
  | 'support'
  | 'emergency'
  | 'safety-plan'
  | 'transport'
  | 'wearables'
  | 'activity'
  | 'settings'
  | 'local-help'
  | 'check-in'
  | 'fake-call'
  | 'onboarding';

export interface TrustedContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  avatarColor: string;
  initials: string;
  receivesJourneyUpdates: boolean;
  receivesSOSAlerts: boolean;
  receivesLocationShare: boolean;
  receivesLowBatteryAlerts: boolean;
  notificationStatus: 'active' | 'paused' | 'pending';
}

export interface ActivityEntry {
  id: string;
  type:
    | 'journey-started'
    | 'journey-completed'
    | 'check-in'
    | 'location-started'
    | 'location-ended'
    | 'sos-sent'
    | 'contact-added'
    | 'contact-notified'
    | 'support-viewed'
    | 'safety-plan-saved'
    | 'transport-logged'
    | 'wearable-connected'
    | 'fake-call'
    | 'battery-alert';
  title: string;
  description: string;
  timestamp: string;
  icon: string;
}

export interface JourneyState {
  status: 'idle' | 'active' | 'paused' | 'completed';
  origin: string;
  destination: string;
  progress: number;
  eta: string;
  startedAt: string | null;
  checkInFrequency: number; // minutes
  gracePeriod: number; // minutes
  contactsReceivingUpdates: string[];
  selectedRoute: string;
}

export interface SOSState {
  activated: boolean;
  contactsNotified: string[];
  message: string;
  deliveryStatus: 'pending' | 'delivered' | 'failed' | 'idle';
  timestamp: string | null;
}

export interface SafetyPlan {
  trustedContacts: string[];
  importantDocuments: string[];
  preferredOrganisations: string[];
  transportArrangements: string;
  safeLocations: string[];
  emergencyInfo: string;
  privateNotes: string;
  updatedAt: string | null;
}

export interface TransportRecord {
  id: string;
  registration: string;
  driverName: string;
  driverId: string;
  vehicleType: string;
  tripDetails: string;
  sharedWith: string[];
  createdAt: string;
}

export interface WearableDevice {
  id: string;
  name: string;
  brand: string;
  connected: boolean;
  battery: number | null;
  permissions: string[];
  lastSync: string | null;
}

export interface EmergencyService {
  id: string;
  name: string;
  category: 'police' | 'ambulance' | 'gbv' | 'fire' | 'other';
  phone: string;
  available: string;
  verified: string;
  verifiedDate: string;
}

export interface SupportService {
  id: string;
  name: string;
  category: 'clinic' | 'counselling' | 'shelter' | 'police' | 'gbv' | 'community';
  phone: string;
  area: string;
  hours: string;
  verifiedDate: string;
  directionsUrl?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'warning' | 'success' | 'emergency';
}

export interface ConnectivityState {
  online: boolean;
  gpsAvailable: boolean;
  batteryLevel: number | null;
  batteryCharging: boolean;
  lastSynced: string;
}

export interface SafetyStatus {
  locationSharing: boolean;
  gpsAvailable: boolean;
  online: boolean;
  batteryLevel: number | null;
  nextCheckIn: string | null;
}
