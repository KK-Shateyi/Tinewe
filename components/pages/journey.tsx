'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  Navigation, MapPin, Clock, Route, TrafficCone, Search, Play, Pause,
  Flag, ArrowRight, Car, Footprints, Bike, Bus, Circle, CheckCircle2,
} from 'lucide-react';
import { useApp } from '@/components/app-provider';
import {
  PageContainer, PageHeader, SectionTitle, StaggerContainer, StaggerItem,
} from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { MapView } from '@/components/map-view';
import { sandtonCoords, rosebankCoords } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

const routeOptions = [
  { id: 'Recommended', label: 'Recommended', time: '18 min', distance: '12.4 km', icon: Route, attrs: ['Balanced route', 'Moderate traffic'] },
  { id: 'Fastest', label: 'Fastest', time: '15 min', distance: '13.8 km', icon: Car, attrs: ['Highway route', 'Toll road'] },
  { id: 'Well-lit', label: 'Well-lit', time: '22 min', distance: '11.2 km', icon: MapPin, attrs: ['Main roads', 'Better lighting'] },
];

const trafficInfo = {
  congestion: 'Moderate',
  closures: 'None reported on route',
  originalEta: '18 min',
  updatedEta: '20 min',
  delay: '+2 min',
};

export function JourneyPage() {
  const {
    journey, startJourney, pauseJourney, resumeJourney, completeJourney,
    updateJourneyProgress, setJourneyField, contacts, navigate,
  } = useApp();

  const [origin, setOrigin] = React.useState(journey.origin);
  const [destination, setDestination] = React.useState(journey.destination);

  const currentPos: [number, number] = React.useMemo(() => {
    const t = journey.progress / 100;
    return [
      sandtonCoords[0] + (rosebankCoords[0] - sandtonCoords[0]) * t,
      sandtonCoords[1] + (rosebankCoords[1] - sandtonCoords[1]) * t,
    ];
  }, [journey.progress]);

  const handleStart = () => {
    startJourney(origin, destination);
  };

  const handleSimulateProgress = () => {
    updateJourneyProgress(Math.min(100, journey.progress + 15));
  };

  return (
    <PageContainer>
      <StaggerContainer>
        <StaggerItem>
          <PageHeader
            title="Safe Journey"
            subtitle="Plan, track and stay connected on every journey"
            action={
              <Badge variant="outline" className="border-warning/30 text-warning">
                <Circle className="mr-1.5 h-2 w-2 fill-warning text-warning" />
                Simulation
              </Badge>
            }
          />
        </StaggerItem>

        {/* Map with floating status card */}
        <StaggerItem>
          <div className="relative overflow-hidden rounded-3xl border border-border">
            <div className="h-[400px] sm:h-[500px]">
              <MapView
                origin={sandtonCoords}
                destination={rosebankCoords}
                currentPosition={currentPos}
                showRoute={true}
                followCurrent={journey.status === 'active'}
              />
            </div>

            {/* Floating status card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-strong absolute left-4 right-4 top-4 z-[400] rounded-2xl p-4 sm:left-6 sm:right-auto sm:top-6 sm:max-w-sm"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
                    <Navigation className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-display text-sm font-bold">Journey Status</span>
                </div>
                <Badge
                  className={cn(
                    journey.status === 'active' && 'bg-success/15 text-success border-success/20',
                    journey.status === 'idle' && 'bg-muted text-muted-foreground',
                    journey.status === 'paused' && 'bg-warning/15 text-warning border-warning/20',
                    journey.status === 'completed' && 'bg-secondary/15 text-secondary border-secondary/20',
                  )}
                >
                  {journey.status === 'active' && 'Active'}
                  {journey.status === 'idle' && 'Not started'}
                  {journey.status === 'paused' && 'Paused'}
                  {journey.status === 'completed' && 'Completed'}
                </Badge>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-secondary" />
                  <span className="truncate text-muted-foreground">{journey.origin}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Navigation className="h-3.5 w-3.5 shrink-0 text-accent" />
                  <span className="truncate font-medium text-foreground">{journey.destination}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="text-muted-foreground">ETA: <span className="font-medium text-foreground">{journey.eta}</span></span>
                </div>
              </div>

              {journey.status !== 'idle' && (
                <div className="mt-3 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{journey.progress}%</span>
                  </div>
                  <Progress value={journey.progress} className="h-1.5" />
                </div>
              )}

              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-secondary" />
                {journey.contactsReceivingUpdates.length} contacts receiving updates
              </div>
            </motion.div>
          </div>
        </StaggerItem>

        {/* Journey controls */}
        <StaggerItem>
          <Card>
            <CardContent className="flex flex-wrap items-center gap-3 pt-6">
              {journey.status === 'idle' && (
                <Button onClick={handleStart} size="lg" className="gradient-primary text-white">
                  <Play className="mr-2 h-4 w-4" />
                  Start Journey
                </Button>
              )}
              {journey.status === 'active' && (
                <>
                  <Button onClick={pauseJourney} variant="outline" size="lg">
                    <Pause className="mr-2 h-4 w-4" />
                    Pause
                  </Button>
                  <Button onClick={handleSimulateProgress} variant="secondary" size="lg">
                    Simulate Movement
                  </Button>
                  <Button onClick={completeJourney} size="lg" className="gradient-primary text-white">
                    <Flag className="mr-2 h-4 w-4" />
                    I've Arrived
                  </Button>
                </>
              )}
              {journey.status === 'paused' && (
                <>
                  <Button onClick={resumeJourney} size="lg" className="gradient-primary text-white">
                    <Play className="mr-2 h-4 w-4" />
                    Resume Journey
                  </Button>
                  <Button onClick={completeJourney} variant="outline" size="lg">
                    <Flag className="mr-2 h-4 w-4" />
                    Complete
                  </Button>
                </>
              )}
              {journey.status === 'completed' && (
                <Button onClick={() => setJourneyField({ status: 'idle', progress: 0, startedAt: null })} size="lg">
                  Plan New Journey
                </Button>
              )}
              <Button variant="ghost" onClick={() => navigate('check-in')}>
                Check-in Settings
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </StaggerItem>

        {/* Route planning + settings */}
        <div className="grid gap-4 lg:grid-cols-2">
          <StaggerItem>
            <Card>
              <CardHeader>
                <SectionTitle title="Plan Your Route" icon={Search} subtitle="Enter your journey details" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="origin">Starting location</Label>
                  <Input id="origin" value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="Enter starting point" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="destination">Destination</Label>
                  <Input id="destination" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Search destination" />
                </div>
                <Button onClick={handleStart} className="w-full gradient-primary text-white" disabled={journey.status === 'active'}>
                  <Navigation className="mr-2 h-4 w-4" />
                  Start Safe Journey
                </Button>
              </CardContent>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card>
              <CardHeader>
                <SectionTitle title="Check-in Settings" icon={Clock} subtitle="Configure your safety check-ins" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="mb-2 block">Check-in frequency</Label>
                  <div className="flex gap-2">
                    {[5, 10, 15, 30].map((min) => (
                      <button
                        key={min}
                        onClick={() => setJourneyField({ checkInFrequency: min })}
                        className={cn(
                          'flex-1 rounded-lg border py-2 text-sm font-medium transition-colors',
                          journey.checkInFrequency === min
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border text-muted-foreground hover:bg-muted'
                        )}
                      >
                        {min}m
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="mb-2 block">Grace period</Label>
                  <div className="flex gap-2">
                    {[3, 5, 10].map((min) => (
                      <button
                        key={min}
                        onClick={() => setJourneyField({ gracePeriod: min })}
                        className={cn(
                          'flex-1 rounded-lg border py-2 text-sm font-medium transition-colors',
                          journey.gracePeriod === min
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border text-muted-foreground hover:bg-muted'
                        )}
                      >
                        {min}m
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="mb-2 block">Contacts for journey updates</Label>
                  <div className="space-y-2">
                    {contacts.map((c) => {
                      const checked = journey.contactsReceivingUpdates.includes(c.id);
                      return (
                        <div key={c.id} className="flex items-center gap-3 rounded-lg bg-muted/40 p-2">
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(v) => {
                              const list = v
                                ? [...journey.contactsReceivingUpdates, c.id]
                                : journey.contactsReceivingUpdates.filter((id) => id !== c.id);
                              setJourneyField({ contactsReceivingUpdates: list });
                            }}
                          />
                          <div className={cn('flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white', c.avatarColor)}>
                            {c.initials}
                          </div>
                          <span className="text-sm">{c.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
        </div>

        {/* Route alternatives + Traffic */}
        <div className="grid gap-4 lg:grid-cols-2">
          <StaggerItem>
            <Card>
              <CardHeader>
                <SectionTitle title="Route Alternatives" icon={Route} subtitle="Choose your preferred route" />
              </CardHeader>
              <CardContent className="space-y-3">
                {routeOptions.map((route) => {
                  const Icon = route.icon;
                  const isSelected = journey.selectedRoute === route.id;
                  return (
                    <button
                      key={route.id}
                      onClick={() => setJourneyField({ selectedRoute: route.id })}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all',
                        isSelected ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-border hover:bg-muted/40'
                      )}
                    >
                      <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', isSelected ? 'gradient-primary text-white' : 'bg-muted text-muted-foreground')}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold">{route.label}</p>
                          <div className="flex gap-3 text-xs text-muted-foreground">
                            <span>{route.time}</span>
                            <span>{route.distance}</span>
                          </div>
                        </div>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {route.attrs.map((attr) => (
                            <span key={attr} className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                              {attr}
                            </span>
                          ))}
                        </div>
                      </div>
                    </button>
                  );
                })}
                <p className="rounded-lg bg-muted/50 p-2.5 text-[11px] text-muted-foreground">
                  Route attributes are shown only when available. Tinewe does not label routes as "guaranteed safe" and does not fabricate safety scores.
                </p>
              </CardContent>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card>
              <CardHeader>
                <SectionTitle title="Traffic Monitoring" icon={TrafficCone} subtitle="Live traffic information" />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-muted/40 p-3">
                    <p className="text-xs text-muted-foreground">Congestion</p>
                    <p className="mt-0.5 text-sm font-semibold text-warning">{trafficInfo.congestion}</p>
                  </div>
                  <div className="rounded-xl bg-muted/40 p-3">
                    <p className="text-xs text-muted-foreground">Road closures</p>
                    <p className="mt-0.5 text-sm font-semibold text-foreground">{trafficInfo.closures}</p>
                  </div>
                  <div className="rounded-xl bg-muted/40 p-3">
                    <p className="text-xs text-muted-foreground">Original ETA</p>
                    <p className="mt-0.5 text-sm font-semibold text-foreground">{trafficInfo.originalEta}</p>
                  </div>
                  <div className="rounded-xl bg-muted/40 p-3">
                    <p className="text-xs text-muted-foreground">Updated ETA</p>
                    <p className="mt-0.5 text-sm font-semibold text-foreground">{trafficInfo.updatedEta}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-warning/10 p-3">
                  <Clock className="h-4 w-4 text-warning" />
                  <span className="text-sm text-warning">Estimated delay: {trafficInfo.delay}</span>
                </div>
                <p className="rounded-lg bg-muted/50 p-2.5 text-[11px] text-muted-foreground">
                  Traffic data is simulated for this demonstration. Real traffic updates require a live data source.
                </p>
              </CardContent>
            </Card>
          </StaggerItem>
        </div>
      </StaggerContainer>
    </PageContainer>
  );
}
