'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  Navigation,
  MapPin,
  HeartHandshake,
  PhoneCall,
  Siren,
  Shield,
  Battery,
  BatteryLow,
  Wifi,
  WifiOff,
  Satellite,
  Clock,
  Users,
  CheckCircle2,
  Activity,
  ArrowRight,
  Phone,
  AlertTriangle,
  MapPinOff,
  Bell,
  Sparkles,
  Calculator,
} from 'lucide-react';
import { useApp } from '@/components/app-provider';
import { useFakeCall } from '@/components/features/fake-call-overlay';
import { useFakeCallConfig, initialsFromName, gradientFromName } from '@/hooks/use-fake-call-config';
import { DiscreetModeGuard } from '@/components/features/discreet-mode-guard';
import {
  PageContainer,
  PageHeader,
  GradientCard,
  GlassCard,
  StaggerContainer,
  StaggerItem,
  SectionTitle,
} from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const quickActions = [
  {
    key: 'journey',
    title: 'Start Safe Journey',
    description: 'Plan and track your trip',
    icon: Navigation,
    gradient: 'from-teal-500 to-emerald-500',
  },
  {
    key: 'location',
    title: 'Share My Location',
    description: 'Let trusted contacts see you',
    icon: MapPin,
    gradient: 'from-blue-500 to-teal-500',
  },
  {
    key: 'support',
    title: 'Get Support',
    description: 'Discreet help and resources',
    icon: HeartHandshake,
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    key: 'fake-call',
    title: 'Fake Call',
    description: 'Simulate an incoming call',
    icon: PhoneCall,
    gradient: 'from-teal-400 to-cyan-500',
  },
];

export function DashboardPage() {
  const {
    journey,
    contacts,
    activities,
    connectivity,
    locationSharing,
    navigate,
    startJourney,
    resumeJourney,
    pauseJourney,
  } = useApp();
  const { triggerCall } = useFakeCall();
  const { config } = useFakeCallConfig();
  const [discreetGuardOpen, setDiscreetGuardOpen] = React.useState(false);

  const trustedContactsWithStatus = contacts.slice(0, 4);
  const recentActivities = activities.slice(0, 5);

  const handleFakeCall = () => {
    const callerName = config.callerName.trim() || 'Dr. Naidoo';
    triggerCall({
      callerName,
      initials: initialsFromName(callerName),
      avatarColor: gradientFromName(callerName),
      delay: config.delaySeconds,
      script: '',
    });
  };

  const safetyStatusItems = [
    {
      label: 'Location sharing',
      value: locationSharing ? 'Active' : 'Off',
      active: locationSharing,
      icon: MapPin,
    },
    {
      label: 'GPS',
      value: connectivity.gpsAvailable ? 'Available' : 'Unavailable',
      active: connectivity.gpsAvailable,
      icon: Satellite,
    },
    {
      label: 'Internet',
      value: connectivity.online ? 'Connected' : 'Offline',
      active: connectivity.online,
      icon: connectivity.online ? Wifi : WifiOff,
    },
    ...(connectivity.batteryLevel !== null
      ? [
          {
            label: 'Battery',
            value: `${connectivity.batteryLevel}%`,
            active: connectivity.batteryLevel > 20,
            icon: connectivity.batteryLevel <= 20 ? BatteryLow : Battery,
          },
        ]
      : []),
  ];

  return (
    <PageContainer>
      <StaggerContainer>
        {/* Hero card */}
        <StaggerItem>
          <GradientCard gradient="primary" className="overflow-hidden">
            <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-lg">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">
                  <Sparkles className="h-3 w-3" />
                  Welcome back, Amahle
                </div>
                <h1 className="font-display text-3xl font-bold leading-tight text-white sm:text-4xl">
                  We're with you, every step.
                </h1>
                <p className="mt-2 text-sm text-white/80 sm:text-base">
                  Your safety, your journey, your support — all in one place.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Button
                    onClick={() => navigate('journey')}
                    className="bg-white text-primary hover:bg-white/90"
                    size="lg"
                  >
                    <Navigation className="mr-2 h-4 w-4" />
                    {journey.status === 'active' ? 'Resume Journey' : 'Start Safe Journey'}
                  </Button>
                  <Button
                    onClick={() => navigate('emergency')}
                    variant="outline"
                    className="border-white/30 bg-white/10 text-white hover:bg-white/20"
                    size="lg"
                  >
                    <Siren className="mr-2 h-4 w-4" />
                    Emergency
                  </Button>
                  <Button
                    onClick={() => setDiscreetGuardOpen(true)}
                    variant="outline"
                    className="border-white/30 bg-white/10 text-white hover:bg-white/20"
                    size="lg"
                  >
                    <Calculator className="mr-2 h-4 w-4" />
                    Discreet Mode
                  </Button>
                </div>
              </div>
              {/* Abstract protection illustration */}
              <div className="relative hidden h-48 w-48 shrink-0 sm:block">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="absolute h-40 w-40 rounded-full border-2 border-white/20" />
                  <div className="absolute h-28 w-28 rounded-full border-2 border-white/30" />
                  <div className="absolute h-16 w-16 rounded-full border-2 border-white/40" />
                  <motion.div
                    animate={{ scale: [1, 1.12, 1] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Shield className="h-12 w-12 text-white" />
                  </motion.div>
                </div>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0"
                >
                  <div className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 rounded-full bg-white/70" />
                  <div className="absolute bottom-0 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-white/40" />
                </motion.div>
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 26, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0"
                >
                  <div className="absolute left-0 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-white/30" />
                  <div className="absolute right-0 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-white/50" />
                </motion.div>
              </div>
            </div>
          </GradientCard>
        </StaggerItem>

        {/* Journey overview */}
        <StaggerItem>
          <Card className="overflow-hidden border-border/60">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <SectionTitle
                title="Journey Overview"
                icon={Navigation}
                subtitle="Current journey status and details"
              />
              <Badge
                variant={journey.status === 'active' ? 'default' : 'secondary'}
                className={cn(
                  journey.status === 'active' && 'bg-success/15 text-success border-success/20',
                  journey.status === 'idle' && 'bg-muted text-muted-foreground',
                  journey.status === 'completed' && 'bg-secondary/15 text-secondary border-secondary/20'
                )}
              >
                {journey.status === 'active' && 'Active'}
                {journey.status === 'idle' && 'Not started'}
                {journey.status === 'paused' && 'Paused'}
                {journey.status === 'completed' && 'Completed'}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">From</p>
                  <p className="mt-0.5 truncate text-sm font-semibold text-foreground">{journey.origin}</p>
                </div>
                <div className="rounded-xl bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">To</p>
                  <p className="mt-0.5 truncate text-sm font-semibold text-foreground">{journey.destination}</p>
                </div>
                <div className="rounded-xl bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">ETA</p>
                  <p className="mt-0.5 text-sm font-semibold text-foreground">{journey.eta}</p>
                </div>
                <div className="rounded-xl bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Next check-in</p>
                  <p className="mt-0.5 text-sm font-semibold text-foreground">
                    {journey.status === 'active' ? `${journey.checkInFrequency} min` : '—'}
                  </p>
                </div>
              </div>

              {journey.status !== 'idle' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Journey progress</span>
                    <span>{journey.progress}%</span>
                  </div>
                  <Progress value={journey.progress} className="h-2" />
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {journey.contactsReceivingUpdates.length} contact(s) receiving updates
                  </span>
                </div>
                <div className="flex gap-2">
                  {journey.status === 'idle' && (
                    <Button size="sm" onClick={() => startJourney(journey.origin, journey.destination)}>
                      <Navigation className="mr-1.5 h-3.5 w-3.5" />
                      Start Journey
                    </Button>
                  )}
                  {journey.status === 'active' && (
                    <Button size="sm" variant="outline" onClick={pauseJourney}>
                      Pause
                    </Button>
                  )}
                  {journey.status === 'paused' && (
                    <Button size="sm" onClick={resumeJourney}>
                      Resume
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => navigate('journey')}>
                    Details
                    <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </StaggerItem>

        {/* Quick actions */}
        <StaggerItem>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              const handleClick = () => {
                if (action.key === 'fake-call') {
                  handleFakeCall();
                } else {
                  navigate(action.key as any);
                }
              };
              return (
                <button
                  key={action.key}
                  onClick={handleClick}
                  className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4 text-left transition-all hover:shadow-lg hover:-translate-y-0.5"
                >
                  <div
                    className={cn(
                      'mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm transition-transform group-hover:scale-110',
                      action.gradient
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">{action.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{action.description}</p>
                </button>
              );
            })}
          </div>
        </StaggerItem>

        {/* Emergency + Safety Status */}
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Emergency assistance */}
          <StaggerItem className="lg:col-span-1">
            <Card className="h-full border-destructive/20">
              <CardHeader className="pb-3">
                <SectionTitle
                  title="Emergency Assistance"
                  icon={Siren}
                  subtitle="Quick access in urgent situations"
                />
              </CardHeader>
              <CardContent className="space-y-3">
                <button
                  onClick={() => navigate('emergency')}
                  className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl gradient-emergency p-4 text-white shadow-lg shadow-destructive/20 transition-transform hover:scale-[1.02]"
                >
                  <div className="pulse-ring absolute inset-0 rounded-2xl bg-white/20" />
                  <Siren className="relative h-6 w-6" />
                  <span className="relative font-display text-lg font-bold">Activate SOS</span>
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-destructive/30 text-destructive hover:bg-destructive/5"
                    onClick={() => navigate('emergency')}
                  >
                    <Phone className="mr-1.5 h-3.5 w-3.5" />
                    Emergency Call
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('contacts')}
                  >
                    <Users className="mr-1.5 h-3.5 w-3.5" />
                    ICE Contacts
                  </Button>
                </div>
                <p className="rounded-lg bg-muted/50 p-2 text-center text-[10px] text-muted-foreground">
                  SOS requires confirmation before sending. Test contacts are used in this demo.
                </p>
              </CardContent>
            </Card>
          </StaggerItem>

          {/* Safety status */}
          <StaggerItem className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader className="pb-3">
                <SectionTitle
                  title="Safety Status"
                  icon={Shield}
                  subtitle="Your device and connectivity status"
                />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {safetyStatusItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.label}
                        className={cn(
                          'flex flex-col items-center gap-2 rounded-xl border p-3 text-center transition-colors',
                          item.active
                            ? 'border-success/20 bg-success/5'
                            : 'border-destructive/20 bg-destructive/5'
                        )}
                      >
                        <Icon
                          className={cn(
                            'h-5 w-5',
                            item.active ? 'text-success' : 'text-destructive'
                          )}
                        />
                        <div>
                          <p className="text-xs text-muted-foreground">{item.label}</p>
                          <p
                            className={cn(
                              'text-sm font-semibold',
                              item.active ? 'text-success' : 'text-destructive'
                            )}
                          >
                            {item.value}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-muted/40 p-2.5 text-center">
                  <AlertTriangle className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-[11px] text-muted-foreground">
                    Status indicators reflect device sensors only and do not confirm personal safety.
                  </p>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
        </div>

        {/* Trusted Contacts + Recent Activity */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Trusted contacts */}
          <StaggerItem>
            <Card className="h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <SectionTitle
                    title="Trusted Contacts"
                    icon={Users}
                    subtitle="Your safety network"
                  />
                  <Button size="sm" variant="ghost" onClick={() => navigate('contacts')}>
                    Manage
                    <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {trustedContactsWithStatus.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-center gap-3 rounded-xl bg-muted/40 p-3"
                  >
                    <div
                      className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white',
                        contact.avatarColor
                      )}
                    >
                      {contact.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">{contact.name}</p>
                      <p className="text-xs text-muted-foreground">{contact.relationship}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        'shrink-0',
                        contact.notificationStatus === 'active' && 'border-success/30 text-success',
                        contact.notificationStatus === 'paused' && 'border-muted-foreground/30 text-muted-foreground',
                        contact.notificationStatus === 'pending' && 'border-warning/30 text-warning'
                      )}
                    >
                      {contact.notificationStatus}
                    </Badge>
                  </div>
                ))}
                {contacts.length === 0 && (
                  <div className="rounded-xl border border-dashed border-border py-6 text-center text-sm text-muted-foreground">
                    No trusted contacts yet
                  </div>
                )}
              </CardContent>
            </Card>
          </StaggerItem>

          {/* Recent activity */}
          <StaggerItem>
            <Card className="h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <SectionTitle
                    title="Recent Activity"
                    icon={Activity}
                    subtitle="Privacy-conscious activity log"
                  />
                  <Button size="sm" variant="ghost" onClick={() => navigate('activity')}>
                    View all
                    <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                {recentActivities.map((activity) => (
                  <ActivityRow key={activity.id} activity={activity} />
                ))}
              </CardContent>
            </Card>
          </StaggerItem>
        </div>
      </StaggerContainer>
      <DiscreetModeGuard open={discreetGuardOpen} onOpenChange={setDiscreetGuardOpen} />
    </PageContainer>
  );
}

function ActivityRow({ activity }: { activity: import('@/lib/types').ActivityEntry }) {
  const time = new Date(activity.timestamp).toLocaleString('en-ZA', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
  return (
    <div className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/40">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
        <CheckCircle2 className="h-4 w-4 text-secondary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium text-foreground">{activity.title}</p>
        <p className="truncate text-xs text-muted-foreground">{activity.description}</p>
      </div>
      <span className="shrink-0 text-[10px] text-muted-foreground">{time}</span>
    </div>
  );
}
