'use client';

import * as React from 'react';
import type {
  NavKey,
  TrustedContact,
  ActivityEntry,
  JourneyState,
  SOSState,
  SafetyPlan,
  TransportRecord,
  WearableDevice,
  AppNotification,
  ConnectivityState,
  UserProfile,
} from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth-provider';
import { sosMessageTemplate } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';
import { playAlertTone } from '@/lib/sound';

interface AppContextValue {
  currentPage: NavKey;
  navigate: (page: NavKey) => void;

  onboarded: boolean;
  setOnboarded: (v: boolean) => void;

  discreetMode: boolean;
  setDiscreetMode: (v: boolean) => void;
  pinEnabled: boolean;
  setPinEnabled: (v: boolean) => void;
  discreetPin: string;
  setDiscreetPin: (v: string) => void;

  contacts: TrustedContact[];
  contactsLoading: boolean;
  addContact: (c: Omit<TrustedContact, 'id' | 'initials' | 'avatarColor'>) => Promise<void>;
  updateContact: (id: string, patch: Partial<TrustedContact>) => Promise<void>;
  removeContact: (id: string) => Promise<void>;

  journey: JourneyState;
  startJourney: (origin: string, destination: string) => void;
  pauseJourney: () => void;
  resumeJourney: () => void;
  completeJourney: () => void;
  updateJourneyProgress: (progress: number) => void;
  setJourneyField: (patch: Partial<JourneyState>) => void;

  sos: SOSState;
  activateSOS: (message?: string) => Promise<void>;
  cancelSOS: () => void;
  clearSOS: () => void;

  safetyPlan: SafetyPlan;
  safetyPlanLoading: boolean;
  saveSafetyPlan: (plan: SafetyPlan) => Promise<void>;

  transportRecords: TransportRecord[];
  transportLoading: boolean;
  addTransportRecord: (r: Omit<TransportRecord, 'id' | 'createdAt'>) => Promise<void>;
  removeTransportRecord: (id: string) => Promise<void>;

  wearables: WearableDevice[];
  wearablesLoading: boolean;
  toggleWearableConnection: (id: string) => Promise<void>;

  activities: ActivityEntry[];
  activitiesLoading: boolean;
  addActivity: (a: Omit<ActivityEntry, 'id' | 'timestamp'>) => Promise<void>;

  notifications: AppNotification[];
  notificationsLoading: boolean;
  markNotificationRead: (id: string) => Promise<void>;
  clearNotifications: () => Promise<void>;

  connectivity: ConnectivityState;
  setConnectivity: (patch: Partial<ConnectivityState>) => void;

  locationSharing: boolean;
  locationSharingContacts: string[];
  locationSharingExpiry: number | null;
  startLocationSharing: (contactIds: string[], durationMinutes: number) => Promise<void>;
  stopLocationSharing: () => Promise<void>;

  profile: UserProfile;
  profileLoading: boolean;
  saveProfile: (p: UserProfile) => Promise<boolean>;

  signOut: () => Promise<void>;

  dataReady: boolean;
}

const AppContext = React.createContext<AppContextValue | null>(null);

const avatarColors = [
  'from-teal-400 to-emerald-500',
  'from-blue-400 to-teal-500',
  'from-emerald-400 to-teal-600',
  'from-cyan-400 to-blue-500',
  'from-emerald-500 to-green-600',
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

const initialJourney: JourneyState = {
  status: 'idle',
  origin: '',
  destination: '',
  progress: 0,
  eta: '—',
  startedAt: null,
  checkInFrequency: 15,
  gracePeriod: 5,
  contactsReceivingUpdates: [],
  selectedRoute: 'Recommended',
};

const initialSOS: SOSState = {
  activated: false,
  contactsNotified: [],
  message: sosMessageTemplate,
  deliveryStatus: 'idle',
  timestamp: null,
};

const emptySafetyPlan: SafetyPlan = {
  trustedContacts: [],
  importantDocuments: [],
  preferredOrganisations: [],
  transportArrangements: '',
  safeLocations: [],
  emergencyInfo: '',
  privateNotes: '',
  updatedAt: null,
};

const initialConnectivity: ConnectivityState = {
  online: typeof navigator !== 'undefined' ? navigator.onLine : true,
  gpsAvailable: false,
  batteryLevel: null,
  batteryCharging: false,
  lastSynced: null,
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const { user, signOut: authSignOut } = useAuth();
  const [currentPage, setCurrentPage] = React.useState<NavKey>('dashboard');
  const [onboarded, setOnboardedState] = React.useState(true);
  const [discreetMode, setDiscreetModeState] = React.useState(false);
  const [pinEnabled, setPinEnabledState] = React.useState(false);
  const [discreetPin, setDiscreetPinState] = React.useState('');

  const [contacts, setContacts] = React.useState<TrustedContact[]>([]);
  const [contactsLoading, setContactsLoading] = React.useState(true);
  const [journey, setJourney] = React.useState<JourneyState>(initialJourney);
  const [sos, setSos] = React.useState<SOSState>(initialSOS);
  const [safetyPlan, setSafetyPlan] = React.useState<SafetyPlan>(emptySafetyPlan);
  const [safetyPlanLoading, setSafetyPlanLoading] = React.useState(true);
  const [transportRecords, setTransportRecords] = React.useState<TransportRecord[]>([]);
  const [transportLoading, setTransportLoading] = React.useState(true);
  const [wearables, setWearables] = React.useState<WearableDevice[]>([]);
  const [wearablesLoading, setWearablesLoading] = React.useState(true);
  const [activities, setActivities] = React.useState<ActivityEntry[]>([]);
  const [activitiesLoading, setActivitiesLoading] = React.useState(true);
  const [notifications, setNotifications] = React.useState<AppNotification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = React.useState(true);
  const [connectivity, setConnectivityState] = React.useState<ConnectivityState>(initialConnectivity);

  const [locationSharing, setLocationSharing] = React.useState(false);
  const [locationSharingContacts, setLocationSharingContacts] = React.useState<string[]>([]);
  const [locationSharingExpiry, setLocationSharingExpiry] = React.useState<number | null>(null);

  const [profile, setProfile] = React.useState<UserProfile>({ displayName: '', email: '' });
  const [profileLoading, setProfileLoading] = React.useState(true);

  const dataReady = user
    ? !contactsLoading &&
      !safetyPlanLoading &&
      !transportLoading &&
      !wearablesLoading &&
      !activitiesLoading &&
      !notificationsLoading
    : false;

  const navigate = React.useCallback((page: NavKey) => {
    setCurrentPage(page);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  // --- Activity + Notification helpers (persisted) ---------------------------
  const addActivity = React.useCallback(
    async (a: Omit<ActivityEntry, 'id' | 'timestamp'>) => {
      if (!user) return;
      const { data, error } = await supabase
        .from('activity_logs')
        .insert({
          type: a.type,
          title: a.title,
          description: a.description,
          icon: a.icon,
        })
        .select('id, type, title, description, icon, created_at')
        .maybeSingle();
      if (error || !data) return;
      const entry: ActivityEntry = {
        id: data.id,
        type: data.type as ActivityEntry['type'],
        title: data.title,
        description: data.description,
        timestamp: data.created_at,
        icon: data.icon,
      };
      setActivities((prev) => [entry, ...prev]);
    },
    [user]
  );

  const addNotification = React.useCallback(
    async (n: { title: string; body: string; type: AppNotification['type'] }) => {
      if (!user) return;
      const { data, error } = await supabase
        .from('app_notifications')
        .insert({ title: n.title, body: n.body, type: n.type })
        .select('id, title, body, type, read, created_at')
        .maybeSingle();
      if (error || !data) return;
      const entry: AppNotification = {
        id: data.id,
        title: data.title,
        body: data.body,
        type: data.type as AppNotification['type'],
        read: data.read,
        timestamp: data.created_at,
      };
      setNotifications((prev) => [entry, ...prev]);
    },
    [user]
  );

  // --- Contacts --------------------------------------------------------------
  const loadContacts = React.useCallback(async () => {
    if (!user) return;
    setContactsLoading(true);
    const { data, error } = await supabase
      .from('trusted_contacts')
      .select(
        'id, name, phone, relationship, avatar_color, initials, receives_journey_updates, receives_sos_alerts, receives_location_share, receives_low_battery_alerts, notification_status'
      )
      .order('created_at', { ascending: true });
    if (error) {
      toast({ title: 'Could not load contacts', description: error.message, variant: 'destructive' });
    } else if (data) {
      setContacts(
        data.map((c) => ({
          id: c.id,
          name: c.name,
          phone: c.phone,
          relationship: c.relationship,
          avatarColor: c.avatar_color,
          initials: c.initials,
          receivesJourneyUpdates: c.receives_journey_updates,
          receivesSOSAlerts: c.receives_sos_alerts,
          receivesLocationShare: c.receives_location_share,
          receivesLowBatteryAlerts: c.receives_low_battery_alerts,
          notificationStatus: c.notification_status as TrustedContact['notificationStatus'],
        }))
      );
    }
    setContactsLoading(false);
  }, [user, toast]);

  const addContact = React.useCallback(
    async (c: Omit<TrustedContact, 'id' | 'initials' | 'avatarColor'>) => {
      if (!user) return;
      const colorIndex = contacts.length % avatarColors.length;
      const payload = {
        name: c.name,
        phone: c.phone,
        relationship: c.relationship,
        avatar_color: avatarColors[colorIndex],
        initials: getInitials(c.name),
        receives_journey_updates: c.receivesJourneyUpdates,
        receives_sos_alerts: c.receivesSOSAlerts,
        receives_location_share: c.receivesLocationShare,
        receives_low_battery_alerts: c.receivesLowBatteryAlerts,
        notification_status: c.notificationStatus,
      };
      const { data, error } = await supabase
        .from('trusted_contacts')
        .insert(payload)
        .select(
          'id, name, phone, relationship, avatar_color, initials, receives_journey_updates, receives_sos_alerts, receives_location_share, receives_low_battery_alerts, notification_status'
        )
        .maybeSingle();
      if (error) {
        toast({ title: 'Could not add contact', description: error.message, variant: 'destructive' });
        return;
      }
      if (data) {
        setContacts((prev) => [
          ...prev,
          {
            id: data.id,
            name: data.name,
            phone: data.phone,
            relationship: data.relationship,
            avatarColor: data.avatar_color,
            initials: data.initials,
            receivesJourneyUpdates: data.receives_journey_updates,
            receivesSOSAlerts: data.receives_sos_alerts,
            receivesLocationShare: data.receives_location_share,
            receivesLowBatteryAlerts: data.receives_low_battery_alerts,
            notificationStatus: data.notification_status as TrustedContact['notificationStatus'],
          },
        ]);
      }
      await addActivity({
        type: 'contact-added',
        title: 'Trusted contact added',
        description: `${c.name} added to trusted contacts`,
        icon: 'user-plus',
      });
      await addNotification({
        title: 'Contact added',
        body: `${c.name} can now receive your safety alerts.`,
        type: 'success',
      });
    },
    [user, contacts.length, toast, addActivity, addNotification]
  );

  const updateContact = React.useCallback(
    async (id: string, patch: Partial<TrustedContact>) => {
      const dbPatch: Record<string, unknown> = {};
      if (patch.name !== undefined) dbPatch.name = patch.name;
      if (patch.phone !== undefined) dbPatch.phone = patch.phone;
      if (patch.relationship !== undefined) dbPatch.relationship = patch.relationship;
      if (patch.receivesJourneyUpdates !== undefined) dbPatch.receives_journey_updates = patch.receivesJourneyUpdates;
      if (patch.receivesSOSAlerts !== undefined) dbPatch.receives_sos_alerts = patch.receivesSOSAlerts;
      if (patch.receivesLocationShare !== undefined) dbPatch.receives_location_share = patch.receivesLocationShare;
      if (patch.receivesLowBatteryAlerts !== undefined) dbPatch.receives_low_battery_alerts = patch.receivesLowBatteryAlerts;
      if (patch.notificationStatus !== undefined) dbPatch.notification_status = patch.notificationStatus;

      const { error } = await supabase.from('trusted_contacts').update(dbPatch).eq('id', id);
      if (error) {
        toast({ title: 'Could not update contact', description: error.message, variant: 'destructive' });
        return;
      }
      setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
    },
    [toast]
  );

  const removeContact = React.useCallback(
    async (id: string) => {
      const { error } = await supabase.from('trusted_contacts').delete().eq('id', id);
      if (error) {
        toast({ title: 'Could not remove contact', description: error.message, variant: 'destructive' });
        return;
      }
      setContacts((prev) => prev.filter((c) => c.id !== id));
    },
    [toast]
  );

  // --- Activity log ----------------------------------------------------------
  const loadActivities = React.useCallback(async () => {
    if (!user) return;
    setActivitiesLoading(true);
    const { data, error } = await supabase
      .from('activity_logs')
      .select('id, type, title, description, icon, created_at')
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) {
      toast({ title: 'Could not load activity', description: error.message, variant: 'destructive' });
    } else if (data) {
      setActivities(
        data.map((a) => ({
          id: a.id,
          type: a.type as ActivityEntry['type'],
          title: a.title,
          description: a.description,
          timestamp: a.created_at,
          icon: a.icon,
        }))
      );
    }
    setActivitiesLoading(false);
  }, [user, toast]);

  // --- Notifications ---------------------------------------------------------
  const loadNotifications = React.useCallback(async () => {
    if (!user) return;
    setNotificationsLoading(true);
    const { data, error } = await supabase
      .from('app_notifications')
      .select('id, title, body, type, read, created_at')
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) {
      toast({ title: 'Could not load notifications', description: error.message, variant: 'destructive' });
    } else if (data) {
      setNotifications(
        data.map((n) => ({
          id: n.id,
          title: n.title,
          body: n.body,
          type: n.type as AppNotification['type'],
          read: n.read,
          timestamp: n.created_at,
        }))
      );
    }
    setNotificationsLoading(false);
  }, [user, toast]);

  const markNotificationRead = React.useCallback(
    async (id: string) => {
      const { error } = await supabase.from('app_notifications').update({ read: true }).eq('id', id);
      if (error) return;
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    },
    []
  );

  const clearNotifications = React.useCallback(async () => {
    if (!user) return;
    const { error } = await supabase.from('app_notifications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) {
      toast({ title: 'Could not clear notifications', description: error.message, variant: 'destructive' });
      return;
    }
    setNotifications([]);
  }, [user, toast]);

  // --- Safety plan -----------------------------------------------------------
  const loadSafetyPlan = React.useCallback(async () => {
    if (!user) return;
    setSafetyPlanLoading(true);
    const { data, error } = await supabase
      .from('safety_plans')
      .select('trusted_contact_ids, important_documents, preferred_organisations, transport_arrangements, safe_locations, emergency_info, private_notes, updated_at')
      .eq('user_id', user.id)
      .maybeSingle();
    if (error) {
      toast({ title: 'Could not load safety plan', description: error.message, variant: 'destructive' });
    } else if (data) {
      setSafetyPlan({
        trustedContacts: data.trusted_contact_ids as string[],
        importantDocuments: data.important_documents as string[],
        preferredOrganisations: data.preferred_organisations as string[],
        transportArrangements: data.transport_arrangements,
        safeLocations: data.safe_locations as string[],
        emergencyInfo: data.emergency_info,
        privateNotes: data.private_notes,
        updatedAt: data.updated_at,
      });
    }
    setSafetyPlanLoading(false);
  }, [user, toast]);

  const saveSafetyPlan = React.useCallback(
    async (plan: SafetyPlan) => {
      if (!user) return;
      const payload = {
        user_id: user.id,
        trusted_contact_ids: plan.trustedContacts,
        important_documents: plan.importantDocuments,
        preferred_organisations: plan.preferredOrganisations,
        transport_arrangements: plan.transportArrangements,
        safe_locations: plan.safeLocations,
        emergency_info: plan.emergencyInfo,
        private_notes: plan.privateNotes,
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase.from('safety_plans').upsert(payload);
      if (error) {
        toast({ title: 'Could not save safety plan', description: error.message, variant: 'destructive' });
        return;
      }
      setSafetyPlan({ ...plan, updatedAt: new Date().toISOString() });
      await addActivity({
        type: 'safety-plan-saved',
        title: 'Safety plan saved',
        description: 'Your personal safety plan has been updated',
        icon: 'shield',
      });
      await addNotification({
        title: 'Safety plan saved',
        body: 'Your personal safety plan has been updated.',
        type: 'success',
      });
    },
    [user, toast, addActivity, addNotification]
  );

  // --- Transport records -----------------------------------------------------
  const loadTransportRecords = React.useCallback(async () => {
    if (!user) return;
    setTransportLoading(true);
    const { data, error } = await supabase
      .from('transport_records')
      .select('id, registration, driver_name, driver_id, vehicle_type, trip_details, shared_with, created_at')
      .order('created_at', { ascending: false });
    if (error) {
      toast({ title: 'Could not load transport records', description: error.message, variant: 'destructive' });
    } else if (data) {
      setTransportRecords(
        data.map((r) => ({
          id: r.id,
          registration: r.registration,
          driverName: r.driver_name ?? '',
          driverId: r.driver_id ?? '',
          vehicleType: r.vehicle_type,
          tripDetails: r.trip_details ?? '',
          sharedWith: r.shared_with as string[],
          createdAt: r.created_at,
        }))
      );
    }
    setTransportLoading(false);
  }, [user, toast]);

  const addTransportRecord = React.useCallback(
    async (r: Omit<TransportRecord, 'id' | 'createdAt'>) => {
      if (!user) return;
      const { data, error } = await supabase
        .from('transport_records')
        .insert({
          registration: r.registration,
          driver_name: r.driverName,
          driver_id: r.driverId,
          vehicle_type: r.vehicleType,
          trip_details: r.tripDetails,
          shared_with: r.sharedWith,
        })
        .select('id, registration, driver_name, driver_id, vehicle_type, trip_details, shared_with, created_at')
        .maybeSingle();
      if (error) {
        toast({ title: 'Could not log transport', description: error.message, variant: 'destructive' });
        return;
      }
      if (data) {
        setTransportRecords((prev) => [
          {
            id: data.id,
            registration: data.registration,
            driverName: data.driver_name ?? '',
            driverId: data.driver_id ?? '',
            vehicleType: data.vehicle_type,
            tripDetails: data.trip_details ?? '',
            sharedWith: data.shared_with as string[],
            createdAt: data.created_at,
          },
          ...prev,
        ]);
      }
      await addActivity({
        type: 'transport-logged',
        title: 'Transport details logged',
        description: `Vehicle ${r.registration} recorded`,
        icon: 'car',
      });
      await addNotification({
        title: 'Transport logged',
        body: `Vehicle ${r.registration} details have been saved.`,
        type: 'info',
      });
    },
    [user, toast, addActivity, addNotification]
  );

  const removeTransportRecord = React.useCallback(
    async (id: string) => {
      const { error } = await supabase.from('transport_records').delete().eq('id', id);
      if (error) {
        toast({ title: 'Could not remove record', description: error.message, variant: 'destructive' });
        return;
      }
      setTransportRecords((prev) => prev.filter((r) => r.id !== id));
    },
    [toast]
  );

  // --- Wearables -------------------------------------------------------------
  const loadWearables = React.useCallback(async () => {
    if (!user) return;
    setWearablesLoading(true);
    const { data, error } = await supabase
      .from('wearable_devices')
      .select('id, name, brand, connected, battery, permissions, last_sync')
      .order('created_at', { ascending: true });
    if (error) {
      toast({ title: 'Could not load wearables', description: error.message, variant: 'destructive' });
    } else if (data) {
      setWearables(
        data.map((w) => ({
          id: w.id,
          name: w.name,
          brand: w.brand,
          connected: w.connected,
          battery: w.battery,
          permissions: w.permissions as string[],
          lastSync: w.last_sync,
        }))
      );
    }
    setWearablesLoading(false);
  }, [user, toast]);

  const toggleWearableConnection = React.useCallback(
    async (id: string) => {
      const device = wearables.find((w) => w.id === id);
      if (!device) return;
      const nextConnected = !device.connected;
      const nextBattery = nextConnected ? Math.floor(Math.random() * 40) + 60 : null;
      const nextSync = nextConnected ? new Date().toISOString() : null;
      const { error } = await supabase
        .from('wearable_devices')
        .update({ connected: nextConnected, battery: nextBattery, last_sync: nextSync })
        .eq('id', id);
      if (error) {
        toast({ title: 'Could not update wearable', description: error.message, variant: 'destructive' });
        return;
      }
      setWearables((prev) =>
        prev.map((w) =>
          w.id === id ? { ...w, connected: nextConnected, battery: nextBattery, lastSync: nextSync } : w
        )
      );
      await addActivity({
        type: 'wearable-connected',
        title: nextConnected ? 'Wearable connected' : 'Wearable disconnected',
        description: `${device.name} ${nextConnected ? 'connected' : 'disconnected'}`,
        icon: 'watch',
      });
      if (nextConnected) {
        await addNotification({
          title: 'Wearable synced',
          body: `${device.name} connected and synced successfully.`,
          type: 'success',
        });
      }
    },
    [wearables, toast, addActivity, addNotification]
  );

  // --- Journey (client state; persisted via activity log) --------------------
  const setJourneyField = React.useCallback((patch: Partial<JourneyState>) => {
    setJourney((prev) => ({ ...prev, ...patch }));
  }, []);

  const startJourney = React.useCallback(
    (origin: string, destination: string) => {
      setJourney((prev) => ({
        ...prev,
        status: 'active',
        origin,
        destination,
        progress: 0,
        eta: '18 min',
        startedAt: new Date().toISOString(),
      }));
      void addActivity({
        type: 'journey-started',
        title: 'Journey started',
        description: `Safe Journey from ${origin} to ${destination}`,
        icon: 'navigation',
      });
      void addNotification({
        title: 'Journey started',
        body: `Safe Journey from ${origin} to ${destination} is now active.`,
        type: 'info',
      });
    },
    [addActivity, addNotification]
  );

  const pauseJourney = React.useCallback(() => {
    setJourney((prev) => ({ ...prev, status: 'paused' }));
  }, []);

  const resumeJourney = React.useCallback(() => {
    setJourney((prev) => ({ ...prev, status: 'active' }));
  }, []);

  const completeJourney = React.useCallback(() => {
    setJourney((prev) => ({ ...prev, status: 'completed', progress: 100 }));
    void addActivity({
      type: 'journey-completed',
      title: 'Journey completed',
      description: 'Arrival confirmed',
      icon: 'flag',
    });
    void addNotification({
      title: 'Journey completed',
      body: 'Your safe journey has been marked as complete.',
      type: 'success',
    });
  }, [addActivity, addNotification]);

  const updateJourneyProgress = React.useCallback((progress: number) => {
    setJourney((prev) => ({ ...prev, progress: Math.min(100, Math.max(0, progress)) }));
  }, []);

  // --- SOS -------------------------------------------------------------------
  const activateSOS = React.useCallback(
    async (message?: string) => {
      playAlertTone(880, 0.16, 3);
      const sosContacts = contacts.filter((c) => c.receivesSOSAlerts);
      const notified = sosContacts.map((c) => c.id);
      const alertMessage = message || sos.message;

      setSos((prev) => ({
        ...prev,
        activated: true,
        deliveryStatus: 'pending',
        timestamp: new Date().toISOString(),
        contactsNotified: notified,
        message: alertMessage,
      }));

      // Capture real GPS coordinates
      let latitude: number | undefined;
      let longitude: number | undefined;
      if ('geolocation' in navigator) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 8000,
              maximumAge: 30000,
            });
          });
          latitude = pos.coords.latitude;
          longitude = pos.coords.longitude;
        } catch {
          // GPS unavailable — send without location
        }
      }

      // Call the edge function to send real SMS via Twilio
      const { data: session } = await supabase.auth.getSession();
      const apiUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL || ''}/functions/v1/send-sos`;

      try {
        const res = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.session?.access_token || ''}`,
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          },
          body: JSON.stringify({
            contacts: sosContacts.map((c) => ({ name: c.name, phone: c.phone })),
            message: alertMessage,
            latitude,
            longitude,
            userName: profile.displayName,
          }),
        });

        const result = await res.json();

        if (res.ok && result.success) {
          setSos((prev) => ({
            ...prev,
            deliveryStatus: 'delivered',
          }));
          const failedCount = result.failed || 0;
          await addNotification({
            title: 'SOS alert sent',
            body: `Emergency SMS sent to ${result.delivered} of ${result.totalContacts} contact(s).${failedCount > 0 ? ' Some deliveries failed.' : ''}`,
            type: 'emergency',
          });
        } else {
          setSos((prev) => ({ ...prev, deliveryStatus: 'failed' }));
          const errMsg = result.error === 'SMS service not configured'
            ? 'SMS service (Twilio) is not yet configured. Add Twilio credentials to enable real alerts.'
            : result.detail || result.error || 'Failed to send SOS.';
          toast({ title: 'SOS could not be sent', description: errMsg, variant: 'destructive' });
          await addNotification({
            title: 'SOS delivery failed',
            body: errMsg,
            type: 'emergency',
          });
        }
      } catch (err) {
        setSos((prev) => ({ ...prev, deliveryStatus: 'failed' }));
        toast({ title: 'SOS could not be sent', description: 'Network error. Please call emergency services directly.', variant: 'destructive' });
      }

      // Reload activity + notifications (the edge function also inserts records)
      void loadActivities();
      void loadNotifications();
    },
    [contacts, sos.message, profile.displayName, toast, addNotification, loadActivities, loadNotifications]
  );

  const cancelSOS = React.useCallback(() => {
    setSos((prev) => ({ ...prev, activated: false, deliveryStatus: 'idle' }));
  }, []);

  const clearSOS = React.useCallback(() => {
    setSos(initialSOS);
  }, []);

  // --- Location sharing ------------------------------------------------------
  const startLocationSharing = React.useCallback(
    async (contactIds: string[], durationMinutes: number) => {
      setLocationSharing(true);
      setLocationSharingContacts(contactIds);
      setLocationSharingExpiry(durationMinutes);
      await addActivity({
        type: 'location-started',
        title: 'Location sharing started',
        description: `Sharing live location with ${contactIds.length} contact(s) for ${durationMinutes} minutes`,
        icon: 'map-pin',
      });
      await addNotification({
        title: 'Location sharing active',
        body: `Sharing live location with ${contactIds.length} contact(s) for ${durationMinutes} minutes.`,
        type: 'info',
      });
    },
    [addActivity, addNotification]
  );

  const stopLocationSharing = React.useCallback(async () => {
    setLocationSharing(false);
    setLocationSharingContacts([]);
    setLocationSharingExpiry(null);
    await addActivity({
      type: 'location-ended',
      title: 'Location sharing ended',
      description: 'Live location sharing stopped',
      icon: 'map-pin-off',
    });
    await addNotification({
      title: 'Location sharing ended',
      body: 'Live location sharing has been stopped.',
      type: 'info',
    });
  }, [addActivity, addNotification]);

  // --- Connectivity ----------------------------------------------------------
  const setConnectivity = React.useCallback((patch: Partial<ConnectivityState>) => {
    setConnectivityState((prev) => ({ ...prev, ...patch }));
  }, []);

  // --- Battery low-battery notification --------------------------------------
  const lowBatteryWarnedRef = React.useRef(false);
  React.useEffect(() => {
    if (connectivity.batteryLevel === null) return;
    if (connectivity.batteryLevel <= 20 && !connectivity.batteryCharging && !lowBatteryWarnedRef.current) {
      lowBatteryWarnedRef.current = true;
      void addNotification({
        title: 'Low battery warning',
        body: `Your device battery is at ${connectivity.batteryLevel}%. Consider charging before your next journey.`,
        type: 'warning',
      });
      void addActivity({
        type: 'battery-alert',
        title: 'Low battery alert',
        description: `Device battery at ${connectivity.batteryLevel}%`,
        icon: 'battery',
      });
    }
    if (connectivity.batteryLevel > 25 || connectivity.batteryCharging) {
      lowBatteryWarnedRef.current = false;
    }
  }, [connectivity.batteryLevel, connectivity.batteryCharging, addNotification, addActivity]);

  // --- Profile ---------------------------------------------------------------
  const setOnboarded = React.useCallback((v: boolean) => setOnboardedState(v), []);
  const setDiscreetMode = React.useCallback((v: boolean) => setDiscreetModeState(v), []);
  const setPinEnabled = React.useCallback((v: boolean) => setPinEnabledState(v), []);
  const setDiscreetPin = React.useCallback((v: string) => setDiscreetPinState(v.replace(/\D/g, '').slice(0, 6)), []);

  const saveProfile = React.useCallback(
    async (p: UserProfile): Promise<boolean> => {
      if (!user) return false;
      setProfile(p);
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          display_name: p.displayName,
          email: p.email,
          updated_at: new Date().toISOString(),
        });
      if (error) {
        toast({ title: 'Could not save profile', description: error.message, variant: 'destructive' });
        return false;
      }
      await addActivity({
        type: 'safety-plan-saved',
        title: 'Profile updated',
        description: 'Your profile details were saved',
        icon: 'user',
      });
      return true;
    },
    [user, toast, addActivity]
  );

  const signOut = React.useCallback(async () => {
    await authSignOut();
  }, [authSignOut]);

  // --- Load all user data on sign-in -----------------------------------------
  React.useEffect(() => {
    if (!user) {
      setContacts([]);
      setActivities([]);
      setNotifications([]);
      setSafetyPlan(emptySafetyPlan);
      setTransportRecords([]);
      setWearables([]);
      setProfile({ displayName: '', email: '' });
      setProfileLoading(false);
      return;
    }
    setProfileLoading(true);
    let active = true;
    (async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name, email')
        .eq('id', user.id)
        .maybeSingle();
      if (active && !error && data) {
        setProfile({ displayName: data.display_name, email: data.email });
      } else if (active && !error && !data) {
        const meta = user.user_metadata as { full_name?: string } | null;
        setProfile({
          displayName: meta?.full_name || user.email || '',
          email: user.email ?? '',
        });
      }
      if (active) setProfileLoading(false);
    })();
    void loadContacts();
    void loadActivities();
    void loadNotifications();
    void loadSafetyPlan();
    void loadTransportRecords();
    void loadWearables();
    return () => { active = false; };
  }, [user, loadContacts, loadActivities, loadNotifications, loadSafetyPlan, loadTransportRecords, loadWearables]);

  // Live device connectivity monitoring
  React.useEffect(() => {
    const goOnline = () => setConnectivityState((prev) => ({ ...prev, online: true, lastSynced: new Date().toISOString() }));
    const goOffline = () => setConnectivityState((prev) => ({ ...prev, online: false }));
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  React.useEffect(() => {
    if (!('geolocation' in navigator)) return;
    let watchId: number | null = null;
    const onSuccess = () => setConnectivityState((prev) => ({ ...prev, gpsAvailable: true }));
    const onError = (err: GeolocationPositionError) => {
      if (err.code === err.PERMISSION_DENIED) {
        setConnectivityState((prev) => ({ ...prev, gpsAvailable: false }));
      }
    };
    navigator.geolocation.getCurrentPosition(onSuccess, onError, { timeout: 4000, maximumAge: 60000 });
    watchId = navigator.geolocation.watchPosition(onSuccess, onError, { timeout: 30000, maximumAge: 15000 });
    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  React.useEffect(() => {
    const nav = navigator as Navigator & { getBattery?: () => Promise<any> };
    if (typeof nav.getBattery !== 'function') return;
    let battery: any;
    let cleanup = () => {};
    nav.getBattery().then((b) => {
      battery = b;
      const update = () =>
        setConnectivityState((prev) => ({
          ...prev,
          batteryLevel: Math.round(b.level * 100),
          batteryCharging: b.charging,
        }));
      update();
      const listeners: [string, () => void][] = [
        ['levelchange', update],
        ['chargingchange', update],
      ];
      listeners.forEach(([evt, fn]) => b.addEventListener(evt, fn));
      cleanup = () => listeners.forEach(([evt, fn]) => b.removeEventListener(evt, fn));
    });
    return () => cleanup();
  }, []);

  const value: AppContextValue = {
    currentPage,
    navigate,
    onboarded,
    setOnboarded,
    discreetMode,
    setDiscreetMode,
    pinEnabled,
    setPinEnabled,
    discreetPin,
    setDiscreetPin,
    contacts,
    contactsLoading,
    addContact,
    updateContact,
    removeContact,
    journey,
    startJourney,
    pauseJourney,
    resumeJourney,
    completeJourney,
    updateJourneyProgress,
    setJourneyField,
    sos,
    activateSOS,
    cancelSOS,
    clearSOS,
    safetyPlan,
    safetyPlanLoading,
    saveSafetyPlan,
    transportRecords,
    transportLoading,
    addTransportRecord,
    removeTransportRecord,
    wearables,
    wearablesLoading,
    toggleWearableConnection,
    activities,
    activitiesLoading,
    addActivity,
    notifications,
    notificationsLoading,
    markNotificationRead,
    clearNotifications,
    connectivity,
    setConnectivity,
    locationSharing,
    locationSharingContacts,
    locationSharingExpiry,
    startLocationSharing,
    stopLocationSharing,
    profile,
    profileLoading,
    saveProfile,
    signOut,
    dataReady,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = React.useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
