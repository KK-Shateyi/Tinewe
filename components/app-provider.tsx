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
} from '@/lib/types';
import {
  initialContacts,
  initialActivities,
  initialWearables,
  sosMessageTemplate,
} from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';
import { playAlertTone } from '@/lib/sound';

interface AppContextValue {
  // Navigation
  currentPage: NavKey;
  navigate: (page: NavKey) => void;

  // Onboarding
  onboarded: boolean;
  setOnboarded: (v: boolean) => void;

  // Discreet mode
  discreetMode: boolean;
  setDiscreetMode: (v: boolean) => void;
  pinEnabled: boolean;
  setPinEnabled: (v: boolean) => void;
  discreetPin: string;
  setDiscreetPin: (v: string) => void;

  // Contacts
  contacts: TrustedContact[];
  addContact: (c: Omit<TrustedContact, 'id' | 'initials' | 'avatarColor'>) => void;
  updateContact: (id: string, patch: Partial<TrustedContact>) => void;
  removeContact: (id: string) => void;

  // Journey
  journey: JourneyState;
  startJourney: (origin: string, destination: string) => void;
  pauseJourney: () => void;
  resumeJourney: () => void;
  completeJourney: () => void;
  updateJourneyProgress: (progress: number) => void;
  setJourneyField: (patch: Partial<JourneyState>) => void;

  // SOS
  sos: SOSState;
  activateSOS: () => void;
  cancelSOS: () => void;
  clearSOS: () => void;

  // Safety plan
  safetyPlan: SafetyPlan;
  saveSafetyPlan: (plan: SafetyPlan) => void;

  // Transport
  transportRecords: TransportRecord[];
  addTransportRecord: (r: Omit<TransportRecord, 'id' | 'createdAt'>) => void;
  removeTransportRecord: (id: string) => void;

  // Wearables
  wearables: WearableDevice[];
  toggleWearableConnection: (id: string) => void;

  // Activity
  activities: ActivityEntry[];
  addActivity: (a: Omit<ActivityEntry, 'id' | 'timestamp'>) => void;

  // Notifications
  notifications: AppNotification[];
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;

  // Connectivity
  connectivity: ConnectivityState;
  setConnectivity: (patch: Partial<ConnectivityState>) => void;

  // Location sharing
  locationSharing: boolean;
  locationSharingContacts: string[];
  locationSharingExpiry: number | null;
  startLocationSharing: (contactIds: string[], durationMinutes: number) => void;
  stopLocationSharing: () => void;
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
  origin: 'Sandton City, Johannesburg',
  destination: 'Rosebank Mall, Johannesburg',
  progress: 0,
  eta: '—',
  startedAt: null,
  checkInFrequency: 15,
  gracePeriod: 5,
  contactsReceivingUpdates: ['c1', 'c2'],
  selectedRoute: 'Recommended',
};

const initialSOS: SOSState = {
  activated: false,
  contactsNotified: [],
  message: sosMessageTemplate,
  deliveryStatus: 'idle',
  timestamp: null,
};

const initialSafetyPlan: SafetyPlan = {
  trustedContacts: ['c1', 'c2'],
  importantDocuments: ['ID document', 'Medical aid card'],
  preferredOrganisations: ['POWA', 'LifeLine Johannesburg'],
  transportArrangements: 'Use verified Uber/Uber Go only. Share trip details with Thandiwe.',
  safeLocations: ['Thandiwe’s home in Randburg', 'Bramley Police Station'],
  emergencyInfo: 'Allergic to penicillin. Medical aid: Discovery Health 123456789.',
  privateNotes: '',
  updatedAt: null,
};

const initialConnectivity: ConnectivityState = {
  online: true,
  gpsAvailable: true,
  batteryLevel: 67,
  batteryCharging: false,
  lastSynced: '2026-10-24T08:35:00',
};

const initialNotifications: AppNotification[] = [
  {
    id: 'n1',
    title: 'Check-in due soon',
    body: 'Your next check-in for the Rosebank journey is in 5 minutes.',
    timestamp: '2026-10-24T08:25:00',
    read: false,
    type: 'info',
  },
  {
    id: 'n2',
    title: 'Wearable synced',
    body: 'Apple Watch data synced successfully.',
    timestamp: '2026-10-24T08:00:00',
    read: false,
    type: 'success',
  },
  {
    id: 'n3',
    title: 'Battery at 67%',
    body: 'Consider charging your device before your next journey.',
    timestamp: '2026-10-23T22:10:00',
    read: true,
    type: 'warning',
  },
];

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = React.useState<NavKey>('dashboard');
  const [onboarded, setOnboardedState] = React.useState(true);
  const [discreetMode, setDiscreetModeState] = React.useState(false);
  const [pinEnabled, setPinEnabledState] = React.useState(false);
  const [discreetPin, setDiscreetPinState] = React.useState('');

  const [contacts, setContacts] = React.useState<TrustedContact[]>(initialContacts);
  const [journey, setJourney] = React.useState<JourneyState>(initialJourney);
  const [sos, setSos] = React.useState<SOSState>(initialSOS);
  const [safetyPlan, setSafetyPlan] = React.useState<SafetyPlan>(initialSafetyPlan);
  const [transportRecords, setTransportRecords] = React.useState<TransportRecord[]>([]);
  const [wearables, setWearables] = React.useState<WearableDevice[]>(initialWearables);
  const [activities, setActivities] = React.useState<ActivityEntry[]>(initialActivities);
  const [notifications, setNotifications] = React.useState<AppNotification[]>(initialNotifications);
  const [connectivity, setConnectivityState] = React.useState<ConnectivityState>(initialConnectivity);

  const [locationSharing, setLocationSharing] = React.useState(false);
  const [locationSharingContacts, setLocationSharingContacts] = React.useState<string[]>([]);
  const [locationSharingExpiry, setLocationSharingExpiry] = React.useState<number | null>(null);

  const navigate = React.useCallback((page: NavKey) => {
    setCurrentPage(page);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const addActivity = React.useCallback((a: Omit<ActivityEntry, 'id' | 'timestamp'>) => {
    setActivities((prev) => [
      { ...a, id: `a${Date.now()}`, timestamp: new Date().toISOString() },
      ...prev,
    ]);
  }, []);

  const addContact = React.useCallback((c: Omit<TrustedContact, 'id' | 'initials' | 'avatarColor'>) => {
    const id = `c${Date.now()}`;
    const colorIndex = contacts.length % avatarColors.length;
    setContacts((prev) => [
      ...prev,
      { ...c, id, initials: getInitials(c.name), avatarColor: avatarColors[colorIndex] },
    ]);
    addActivity({
      type: 'contact-added',
      title: 'Trusted contact added',
      description: `${c.name} added to trusted contacts`,
      icon: 'user-plus',
    });
  }, [contacts.length, addActivity]);

  const updateContact = React.useCallback((id: string, patch: Partial<TrustedContact>) => {
    setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }, []);

  const removeContact = React.useCallback((id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const setJourneyField = React.useCallback((patch: Partial<JourneyState>) => {
    setJourney((prev) => ({ ...prev, ...patch }));
  }, []);

  const startJourney = React.useCallback((origin: string, destination: string) => {
    setJourney((prev) => ({
      ...prev,
      status: 'active',
      origin,
      destination,
      progress: 0,
      eta: '18 min',
      startedAt: new Date().toISOString(),
    }));
    addActivity({
      type: 'journey-started',
      title: 'Journey started',
      description: `Safe Journey from ${origin} to ${destination}`,
      icon: 'navigation',
    });
  }, [addActivity]);

  const pauseJourney = React.useCallback(() => {
    setJourney((prev) => ({ ...prev, status: 'paused' }));
  }, []);

  const resumeJourney = React.useCallback(() => {
    setJourney((prev) => ({ ...prev, status: 'active' }));
  }, []);

  const completeJourney = React.useCallback(() => {
    setJourney((prev) => ({ ...prev, status: 'completed', progress: 100 }));
    addActivity({
      type: 'journey-completed',
      title: 'Journey completed',
      description: 'Arrival confirmed',
      icon: 'flag',
    });
  }, [addActivity]);

  const updateJourneyProgress = React.useCallback((progress: number) => {
    setJourney((prev) => ({ ...prev, progress: Math.min(100, Math.max(0, progress)) }));
  }, []);

  const activateSOS = React.useCallback(() => {
    playAlertTone(880, 0.16, 3);
    setSos((prev) => ({
      ...prev,
      activated: true,
      deliveryStatus: 'delivered',
      timestamp: new Date().toISOString(),
      contactsNotified: contacts.filter((c) => c.receivesSOSAlerts).map((c) => c.id),
    }));
    addActivity({
      type: 'sos-sent',
      title: 'SOS alert sent',
      description: 'Emergency alert sent to trusted contacts',
      icon: 'siren',
    });
  }, [contacts, addActivity]);

  const cancelSOS = React.useCallback(() => {
    setSos((prev) => ({ ...prev, activated: false, deliveryStatus: 'idle' }));
  }, []);

  const clearSOS = React.useCallback(() => {
    setSos(initialSOS);
  }, []);

  const saveSafetyPlan = React.useCallback((plan: SafetyPlan) => {
    setSafetyPlan({ ...plan, updatedAt: new Date().toISOString() });
    addActivity({
      type: 'safety-plan-saved',
      title: 'Safety plan saved',
      description: 'Your personal safety plan has been updated',
      icon: 'shield',
    });
  }, [addActivity]);

  const addTransportRecord = React.useCallback((r: Omit<TransportRecord, 'id' | 'createdAt'>) => {
    const id = `t${Date.now()}`;
    setTransportRecords((prev) => [
      { ...r, id, createdAt: new Date().toISOString() },
      ...prev,
    ]);
    addActivity({
      type: 'transport-logged',
      title: 'Transport details logged',
      description: `Vehicle ${r.registration} recorded`,
      icon: 'car',
    });
  }, [addActivity]);

  const removeTransportRecord = React.useCallback((id: string) => {
    setTransportRecords((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const toggleWearableConnection = React.useCallback((id: string) => {
    setWearables((prev) =>
      prev.map((w) =>
        w.id === id
          ? {
              ...w,
              connected: !w.connected,
              battery: !w.connected ? Math.floor(Math.random() * 40) + 60 : null,
              lastSync: !w.connected ? new Date().toISOString() : null,
            }
          : w
      )
    );
    const device = wearables.find((w) => w.id === id);
    if (device) {
      addActivity({
        type: 'wearable-connected',
        title: device.connected ? 'Wearable disconnected' : 'Wearable connected',
        description: `${device.name} ${device.connected ? 'disconnected' : 'connected'}`,
        icon: 'watch',
      });
    }
  }, [wearables, addActivity]);

  const markNotificationRead = React.useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const clearNotifications = React.useCallback(() => {
    setNotifications([]);
  }, []);

  const startLocationSharing = React.useCallback((contactIds: string[], durationMinutes: number) => {
    setLocationSharing(true);
    setLocationSharingContacts(contactIds);
    setLocationSharingExpiry(durationMinutes);
    addActivity({
      type: 'location-started',
      title: 'Location sharing started',
      description: `Sharing live location with ${contactIds.length} contact(s) for ${durationMinutes} minutes`,
      icon: 'map-pin',
    });
  }, [addActivity]);

  const stopLocationSharing = React.useCallback(() => {
    setLocationSharing(false);
    setLocationSharingContacts([]);
    setLocationSharingExpiry(null);
    addActivity({
      type: 'location-ended',
      title: 'Location sharing ended',
      description: 'Live location sharing stopped',
      icon: 'map-pin-off',
    });
  }, [addActivity]);

  const setConnectivity = React.useCallback((patch: Partial<ConnectivityState>) => {
    setConnectivityState((prev) => ({ ...prev, ...patch }));
  }, []);

  const setOnboarded = React.useCallback((v: boolean) => setOnboardedState(v), []);
  const setDiscreetMode = React.useCallback((v: boolean) => setDiscreetModeState(v), []);
  const setPinEnabled = React.useCallback((v: boolean) => setPinEnabledState(v), []);
  const setDiscreetPin = React.useCallback((v: string) => setDiscreetPinState(v.replace(/\D/g, '').slice(0, 6)), []);

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
    saveSafetyPlan,
    transportRecords,
    addTransportRecord,
    removeTransportRecord,
    wearables,
    toggleWearableConnection,
    activities,
    addActivity,
    notifications,
    markNotificationRead,
    clearNotifications,
    connectivity,
    setConnectivity,
    locationSharing,
    locationSharingContacts,
    locationSharingExpiry,
    startLocationSharing,
    stopLocationSharing,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = React.useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
