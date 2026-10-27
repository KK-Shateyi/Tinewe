'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { X, Phone, MapPin, CheckCircle2, AlertTriangle, Send } from 'lucide-react';
import { useApp } from '@/components/app-provider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function SOSOverlay() {
  const { sos, cancelSOS, clearSOS, contacts, connectivity } = useApp();
  const [countdown, setCountdown] = React.useState(5);
  const [confirming, setConfirming] = React.useState(true);
  const [timer, setTimer] = React.useState(0);

  React.useEffect(() => {
    if (!confirming) return;
    if (countdown <= 0) {
      setConfirming(false);
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, confirming]);

  React.useEffect(() => {
    if (sos.activated && sos.deliveryStatus === 'delivered') {
      const interval = setInterval(() => setTimer((t) => t + 1), 1000);
      return () => clearInterval(interval);
    }
  }, [sos.activated, sos.deliveryStatus]);

  if (!sos.activated && !confirming) return null;

  const notifiedContacts = contacts.filter((c) => sos.contactsNotified.includes(c.id));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-md overflow-hidden rounded-3xl bg-card shadow-2xl"
      >
        {/* Header */}
        <div className="gradient-emergency px-6 py-8 text-center text-white">
          <div className="relative mx-auto mb-4 flex h-24 w-24 items-center justify-center">
            <div className="pulse-ring absolute inset-0 rounded-full bg-white/30" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white/20">
              <AlertTriangle className="h-10 w-10" />
            </div>
          </div>
          <h2 className="font-display text-2xl font-bold">SOS Alert Active</h2>
          <p className="mt-1 text-sm text-white/80">
            {confirming
              ? `Sending in ${countdown} seconds...`
              : `Active for ${Math.floor(timer / 60)}:${String(timer % 60).padStart(2, '0')}`}
          </p>
        </div>

        {/* Content */}
        <div className="space-y-4 p-6">
          {/* Delivery status */}
          <div
            className={cn(
              'flex items-center gap-3 rounded-xl p-3',
              sos.deliveryStatus === 'delivered'
                ? 'bg-success/10 text-success'
                : sos.deliveryStatus === 'pending'
                ? 'bg-warning/10 text-warning'
                : sos.deliveryStatus === 'failed'
                ? 'bg-destructive/10 text-destructive'
                : 'bg-muted text-muted-foreground'
            )}
          >
            {sos.deliveryStatus === 'delivered' ? (
              <CheckCircle2 className="h-5 w-5 shrink-0" />
            ) : sos.deliveryStatus === 'pending' ? (
              <AlertTriangle className="h-5 w-5 shrink-0 animate-pulse" />
            ) : (
              <AlertTriangle className="h-5 w-5 shrink-0" />
            )}
            <div className="flex-1 text-sm">
              <p className="font-semibold">
                {sos.deliveryStatus === 'delivered'
                  ? 'Alert delivered'
                  : sos.deliveryStatus === 'pending'
                  ? 'Sending alert…'
                  : sos.deliveryStatus === 'failed'
                  ? 'Alert not delivered'
                  : 'Sending alert...'}
              </p>
              <p className="text-xs opacity-80">
                {sos.deliveryStatus === 'pending'
                  ? 'Capturing location and sending SMS…'
                  : `${notifiedContacts.length} contact(s) notified`}
              </p>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-3 rounded-xl bg-muted p-3">
            <MapPin className="h-5 w-5 shrink-0 text-secondary" />
            <div className="flex-1 text-sm">
              <p className="font-medium">Location attached</p>
              <p className="text-xs text-muted-foreground">Your live GPS coordinates are included in the SMS</p>
            </div>
          </div>

          {/* Message preview */}
          <div className="rounded-xl border border-border p-3">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Emergency message
            </p>
            <p className="text-sm text-foreground">{sos.message}</p>
          </div>

          {/* Notified contacts */}
          {notifiedContacts.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Contacts being notified
              </p>
              <div className="flex flex-wrap gap-2">
                {notifiedContacts.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center gap-2 rounded-full bg-muted py-1 pl-1 pr-3"
                  >
                    <div
                      className={cn(
                        'flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br text-[10px] font-bold text-white',
                        c.avatarColor
                      )}
                    >
                      {c.initials}
                    </div>
                    <span className="text-xs font-medium">{c.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                cancelSOS();
                setConfirming(true);
                setCountdown(5);
              }}
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => {
                clearSOS();
                setConfirming(true);
                setCountdown(5);
              }}
            >
              <Send className="mr-2 h-4 w-4" />
              Clear & Close
            </Button>
          </div>

          <a
            href="tel:10111"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 py-3 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10"
          >
            <Phone className="h-4 w-4" />
            Call 10111 (Police)
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
}
