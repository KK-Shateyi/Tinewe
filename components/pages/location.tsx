'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, MapPinOff, Users, Clock, Play, Square, Shield, Timer,
  CheckCircle2, Satellite,
} from 'lucide-react';
import { useApp } from '@/components/app-provider';
import {
  PageContainer, PageHeader, SectionTitle, StaggerContainer, StaggerItem,
} from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapView } from '@/components/map-view';
import { defaultMapCenter } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

const durations = [
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
  { label: '1 hour', value: 60 },
  { label: '2 hours', value: 120 },
];

export function LocationPage() {
  const {
    contacts, locationSharing, locationSharingContacts, locationSharingExpiry,
    startLocationSharing, stopLocationSharing, connectivity, navigate,
  } = useApp();

  const [selectedContacts, setSelectedContacts] = React.useState<string[]>([]);
  const [selectedDuration, setSelectedDuration] = React.useState(30);
  const [remaining, setRemaining] = React.useState(0);
  const [livePos, setLivePos] = React.useState<[number, number]>(defaultMapCenter);

  React.useEffect(() => {
    if (!('geolocation' in navigator)) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => setLivePos([pos.coords.latitude, pos.coords.longitude]),
      () => {},
      { enableHighAccuracy: true, maximumAge: 15000, timeout: 30000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  React.useEffect(() => {
    if (!locationSharing || !locationSharingExpiry) return;
    setRemaining(locationSharingExpiry);
    const interval = setInterval(() => {
      setRemaining((r) => Math.max(0, r - 1));
    }, 60000);
    return () => clearInterval(interval);
  }, [locationSharing, locationSharingExpiry]);

  const toggleContact = (id: string) => {
    setSelectedContacts((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const authorizedContacts = contacts.filter((c) => locationSharingContacts.includes(c.id));

  return (
    <PageContainer>
      <StaggerContainer>
        <StaggerItem>
          <PageHeader
            title="Live Location Sharing"
            subtitle="Share your location temporarily with trusted contacts"
            action={
              <Badge variant="outline" className="border-warning/30 text-warning">
                Simulation
              </Badge>
            }
          />
        </StaggerItem>

        {/* Map */}
        <StaggerItem>
          <div className="relative overflow-hidden rounded-3xl border border-border">
            <div className="h-[300px] sm:h-[400px]">
              <MapView
                origin={livePos}
                destination={livePos}
                currentPosition={livePos}
                showRoute={false}
                followCurrent={true}
              />
            </div>

            <AnimatePresence>
              {locationSharing && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="glass-strong absolute left-4 right-4 top-4 z-[400] rounded-2xl p-4 sm:left-6 sm:right-auto sm:max-w-sm"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-emergency">
                        <MapPin className="h-4 w-4 text-white" />
                      </div>
                      <span className="font-display text-sm font-bold">Sharing Live</span>
                    </div>
                    <Badge className="bg-success/15 text-success border-success/20">
                      <span className="mr-1 h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
                      Active
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Timer className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">Remaining: </span>
                      <span className="font-semibold text-foreground">{remaining} min</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">Viewers: </span>
                      <span className="font-semibold text-foreground">{authorizedContacts.length}</span>
                    </div>
                  </div>
                  <Button
                    onClick={() => void stopLocationSharing()}
                    variant="destructive"
                    size="sm"
                    className="mt-3 w-full"
                  >
                    <Square className="mr-1.5 h-3.5 w-3.5" />
                    Stop Sharing
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </StaggerItem>

        <div className="grid gap-4 lg:grid-cols-3">
          {/* Sharing controls */}
          <StaggerItem className="lg:col-span-2">
            <Card>
              <CardHeader>
                <SectionTitle
                  title="Share Your Location"
                  icon={MapPin}
                  subtitle="Select contacts and duration"
                />
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <p className="mb-2 text-sm font-medium">Select trusted contacts</p>
                  {contacts.length === 0 ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">No contacts yet. Add trusted contacts to share your location with.</p>
                  ) : (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {contacts.map((c) => {
                      const selected = selectedContacts.includes(c.id);
                      return (
                        <button
                          key={c.id}
                          onClick={() => toggleContact(c.id)}
                          disabled={locationSharing}
                          className={cn(
                            'flex items-center gap-3 rounded-xl border p-3 text-left transition-all disabled:opacity-50',
                            selected ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-border hover:bg-muted/40'
                          )}
                        >
                          <div className={cn('flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white', c.avatarColor)}>
                            {c.initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-sm font-medium">{c.name}</p>
                            <p className="text-xs text-muted-foreground">{c.relationship}</p>
                          </div>
                          {selected && <CheckCircle2 className="h-4 w-4 text-primary" />}
                        </button>
                      );
                    })}
                  </div>
                  )}
                </div>

                <div>
                  <p className="mb-2 text-sm font-medium">Sharing duration</p>
                  <div className="flex gap-2">
                    {durations.map((d) => (
                      <button
                        key={d.value}
                        onClick={() => setSelectedDuration(d.value)}
                        disabled={locationSharing}
                        className={cn(
                          'flex-1 rounded-lg border py-2.5 text-sm font-medium transition-colors disabled:opacity-50',
                          selectedDuration === d.value
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border text-muted-foreground hover:bg-muted'
                        )}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                {!locationSharing ? (
                  <Button
                    onClick={() => void startLocationSharing(selectedContacts, selectedDuration)}
                    disabled={selectedContacts.length === 0}
                    className="w-full gradient-primary text-white"
                    size="lg"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Start Sharing Location
                  </Button>
                ) : (
                  <Button
                    onClick={() => void stopLocationSharing()}
                    variant="destructive"
                    className="w-full"
                    size="lg"
                  >
                    <Square className="mr-2 h-4 w-4" />
                    Stop Sharing
                  </Button>
                )}

                {selectedContacts.length === 0 && !locationSharing && (
                  <p className="text-center text-xs text-muted-foreground">Select at least one contact to start sharing</p>
                )}
              </CardContent>
            </Card>
          </StaggerItem>

          {/* Side panel */}
          <StaggerItem>
            <div className="space-y-4">
              {/* Authorized contacts */}
              <Card>
                <CardHeader className="pb-3">
                  <SectionTitle title="Authorized Viewers" icon={Users} />
                </CardHeader>
                <CardContent>
                  {authorizedContacts.length > 0 ? (
                    <div className="space-y-2">
                      {authorizedContacts.map((c) => (
                        <div key={c.id} className="flex items-center gap-3 rounded-lg bg-muted/40 p-2.5">
                          <div className={cn('flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white', c.avatarColor)}>
                            {c.initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-sm font-medium">{c.name}</p>
                            <p className="text-xs text-muted-foreground">{c.phone}</p>
                          </div>
                          <MapPin className="h-4 w-4 text-success" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="py-6 text-center text-sm text-muted-foreground">No contacts currently authorized</p>
                  )}
                </CardContent>
              </Card>

              {/* Status */}
              <Card>
                <CardHeader className="pb-3">
                  <SectionTitle title="Status" icon={Shield} />
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between rounded-lg bg-muted/40 p-2.5">
                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Satellite className="h-4 w-4" />
                      GPS
                    </span>
                    <span className={cn('text-sm font-medium', connectivity.gpsAvailable ? 'text-success' : 'text-destructive')}>
                      {connectivity.gpsAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-muted/40 p-2.5">
                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      Last synced
                    </span>
                    <span className="text-sm font-medium text-foreground">2 min ago</span>
                  </div>
                </CardContent>
              </Card>

              {/* Privacy notice */}
              <div className="rounded-2xl border border-secondary/20 bg-secondary/5 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-secondary" />
                  <span className="text-sm font-semibold text-secondary">Privacy Protected</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Location sharing is temporary, revocable and limited to selected contacts. You can stop sharing at any time. Location access requires your explicit permission.
                </p>
              </div>
            </div>
          </StaggerItem>
        </div>
      </StaggerContainer>
    </PageContainer>
  );
}
