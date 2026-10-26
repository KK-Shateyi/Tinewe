'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  Siren, Phone, MapPin, Send, AlertTriangle, CheckCircle2, X,
  Users, Shield, Clock,
} from 'lucide-react';
import { useApp } from '@/components/app-provider';
import {
  PageContainer, PageHeader, SectionTitle, StaggerContainer, StaggerItem,
} from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { emergencyServices } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

const categoryLabels: Record<string, string> = {
  police: 'Police',
  ambulance: 'Ambulance',
  gbv: 'GBV Support',
  fire: 'Fire',
  other: 'Other',
};

const categoryColors: Record<string, string> = {
  police: 'from-blue-500 to-teal-500',
  ambulance: 'from-red-500 to-rose-500',
  gbv: 'from-emerald-500 to-teal-600',
  fire: 'from-orange-500 to-red-500',
  other: 'from-gray-500 to-gray-600',
};

export function EmergencyPage() {
  const {
    sos, activateSOS, cancelSOS, clearSOS, contacts, connectivity, navigate,
  } = useApp();
  const [confirming, setConfirming] = React.useState(false);
  const [countdown, setCountdown] = React.useState(5);
  const [customMessage, setCustomMessage] = React.useState(sos.message);

  React.useEffect(() => {
    if (!confirming) return;
    if (countdown <= 0) {
      activateSOS();
      setConfirming(false);
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [confirming, countdown, activateSOS]);

  const startConfirm = () => {
    setCountdown(5);
    setConfirming(true);
  };

  const cancelConfirm = () => {
    setConfirming(false);
    setCountdown(5);
  };

  const sosContacts = contacts.filter((c) => c.receivesSOSAlerts);

  return (
    <PageContainer>
      <StaggerContainer>
        <StaggerItem>
          <PageHeader
            title="Emergency Assistance"
            subtitle="SOS alerts and emergency contact directory"
          />
        </StaggerItem>

        {/* SOS Section */}
        <StaggerItem>
          <Card className={cn(
            'overflow-hidden border-2',
            sos.activated ? 'border-destructive/40' : 'border-destructive/20'
          )}>
            <CardContent className="p-6">
              <div className="flex flex-col items-center gap-6">
                {/* SOS Button */}
                <div className="relative flex items-center justify-center">
                  {!sos.activated && confirming && (
                    <div className="pulse-ring absolute inset-0 rounded-full bg-destructive/30" />
                  )}
                  {sos.activated && (
                    <div className="pulse-ring absolute inset-0 rounded-full bg-destructive/30" />
                  )}
                  <button
                    onClick={() => {
                      if (sos.activated) {
                        cancelSOS();
                        clearSOS();
                      } else if (!confirming) {
                        startConfirm();
                      }
                    }}
                    disabled={confirming}
                    className={cn(
                      'relative flex h-40 w-40 flex-col items-center justify-center rounded-full transition-all',
                      sos.activated
                        ? 'gradient-emergency shadow-2xl shadow-destructive/40'
                        : confirming
                        ? 'gradient-emergency shadow-2xl shadow-destructive/40'
                        : 'gradient-emergency shadow-xl shadow-destructive/20 hover:scale-105'
                    )}
                  >
                    {confirming ? (
                      <>
                        <span className="font-display text-4xl font-bold text-white">{countdown}</span>
                        <span className="text-xs text-white/80">Cancel</span>
                      </>
                    ) : sos.activated ? (
                      <>
                        <Siren className="h-10 w-10 text-white" />
                        <span className="mt-1 font-display text-lg font-bold text-white">ACTIVE</span>
                      </>
                    ) : (
                      <>
                        <Siren className="h-10 w-10 text-white" />
                        <span className="mt-1 font-display text-lg font-bold text-white">SOS</span>
                      </>
                    )}
                  </button>
                </div>

                {confirming && (
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">Sending SOS in {countdown} seconds</p>
                    <Button variant="outline" size="sm" className="mt-2" onClick={cancelConfirm}>
                      <X className="mr-1.5 h-3.5 w-3.5" />
                      Cancel
                    </Button>
                  </div>
                )}

                {!confirming && !sos.activated && (
                  <p className="max-w-sm text-center text-xs text-muted-foreground">
                    Press and hold to activate. SOS requires confirmation before sending. Test contacts and simulated alerts are used in this demo.
                  </p>
                )}

                {sos.activated && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md space-y-3"
                  >
                    <div className={cn(
                      'flex items-center gap-3 rounded-xl p-3',
                      sos.deliveryStatus === 'delivered' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                    )}>
                      {sos.deliveryStatus === 'delivered' ? <CheckCircle2 className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                      <div className="flex-1 text-sm">
                        <p className="font-semibold">
                          {sos.deliveryStatus === 'delivered' ? 'Alert delivered' : 'Alert pending'}
                        </p>
                        <p className="text-xs opacity-80">
                          {connectivity.online ? `${sos.contactsNotified.length} contacts notified` : 'No connection — alert queued'}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full" onClick={() => { cancelSOS(); clearSOS(); }}>
                      Clear Alert
                    </Button>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
        </StaggerItem>

        <div className="grid gap-4 lg:grid-cols-3">
          {/* SOS Configuration */}
          <StaggerItem className="lg:col-span-2">
            <Card>
              <CardHeader>
                <SectionTitle title="SOS Configuration" icon={Send} subtitle="Customise your emergency alert" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="mb-2 text-sm font-medium">Emergency message</p>
                  <Textarea
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                </div>

                <div>
                  <p className="mb-2 text-sm font-medium">Contacts to notify ({sosContacts.length})</p>
                  <div className="space-y-2">
                    {sosContacts.map((c) => (
                      <div key={c.id} className="flex items-center gap-3 rounded-lg bg-muted/40 p-2.5">
                        <div className={cn('flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white', c.avatarColor)}>
                          {c.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-medium">{c.name}</p>
                          <p className="text-xs text-muted-foreground">{c.phone}</p>
                        </div>
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      </div>
                    ))}
                    {sosContacts.length === 0 && (
                      <p className="py-3 text-center text-sm text-muted-foreground">
                        No contacts with SOS alerts enabled
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-xl bg-muted/40 p-3">
                  <MapPin className="h-4 w-4 text-secondary" />
                  <span className="text-sm text-muted-foreground">Location will be attached when available</span>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>

          {/* Emergency call shortcut */}
          <StaggerItem>
            <Card className="h-full">
              <CardHeader>
                <SectionTitle title="Quick Emergency Call" icon={Phone} />
              </CardHeader>
              <CardContent className="space-y-2">
                <a
                  href="tel:10111"
                  className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-3 transition-colors hover:bg-destructive/10"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-rose-500 text-white">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">Police Emergency</p>
                    <p className="text-xs text-muted-foreground">10111</p>
                  </div>
                </a>
                <a
                  href="tel:084124"
                  className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-3 transition-colors hover:bg-destructive/10"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-500 text-white">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">ER24 Ambulance</p>
                    <p className="text-xs text-muted-foreground">084 124</p>
                  </div>
                </a>
                <a
                  href="tel:0800428428"
                  className="flex items-center gap-3 rounded-xl border border-secondary/20 bg-secondary/5 p-3 transition-colors hover:bg-secondary/10"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">GBV Command Centre</p>
                    <p className="text-xs text-muted-foreground">0800 428 428</p>
                  </div>
                </a>
                <Button variant="outline" className="w-full" onClick={() => navigate('contacts')}>
                  <Users className="mr-2 h-4 w-4" />
                  Manage ICE Contacts
                </Button>
              </CardContent>
            </Card>
          </StaggerItem>
        </div>

        {/* Emergency Directory */}
        <StaggerItem>
          <Card>
            <CardHeader>
              <SectionTitle
                title="Emergency Services Directory"
                icon={Phone}
                subtitle="Verified emergency contact numbers"
              />
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {emergencyServices.map((service) => (
                  <div
                    key={service.id}
                    className="rounded-2xl border border-border bg-card p-4 transition-all hover:shadow-md"
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white', categoryColors[service.category])}>
                        {service.category === 'police' && <Shield className="h-5 w-5" />}
                        {service.category === 'ambulance' && <Phone className="h-5 w-5" />}
                        {service.category === 'gbv' && <Shield className="h-5 w-5" />}
                        {service.category === 'fire' && <AlertTriangle className="h-5 w-5" />}
                      </div>
                      <Badge variant="outline" className="text-xs">{categoryLabels[service.category]}</Badge>
                    </div>
                    <p className="text-sm font-semibold">{service.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{service.available}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <a
                        href={`tel:${service.phone.replace(/\s/g, '')}`}
                        className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        {service.phone}
                      </a>
                    </div>
                    <div className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Verified: {service.verifiedDate}
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-4 rounded-lg bg-muted/50 p-2.5 text-[11px] text-muted-foreground">
                Emergency numbers are verified South African services. Call buttons open your device's native phone dialer. Tinewe does not automatically place calls without your interaction.
              </p>
            </CardContent>
          </Card>
        </StaggerItem>
      </StaggerContainer>
    </PageContainer>
  );
}
