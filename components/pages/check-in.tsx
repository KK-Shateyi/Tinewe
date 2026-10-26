'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, CheckCircle2, AlertTriangle, Bell, Users, Plus, Timer,
  Shield, Flag, Navigation, Phone,
} from 'lucide-react';
import { useApp } from '@/components/app-provider';
import {
  PageContainer, PageHeader, SectionTitle, StaggerContainer, StaggerItem,
} from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

const checkInStates = [
  { key: 'active', label: 'Journey Active', color: 'bg-success/15 text-success border-success/20', icon: Navigation },
  { key: 'due', label: 'Check-in Due', color: 'bg-warning/15 text-warning border-warning/20', icon: Clock },
  { key: 'awaiting', label: 'Awaiting Confirmation', color: 'bg-secondary/15 text-secondary border-secondary/20', icon: Timer },
  { key: 'grace', label: 'Grace Period Active', color: 'bg-warning/15 text-warning border-warning/20', icon: AlertTriangle },
  { key: 'pending', label: 'Contact Notification Pending', color: 'bg-warning/15 text-warning border-warning/20', icon: Bell },
  { key: 'notified', label: 'Contact Notified', color: 'bg-destructive/15 text-destructive border-destructive/20', icon: AlertTriangle },
  { key: 'completed', label: 'Journey Completed', color: 'bg-success/15 text-success border-success/20', icon: CheckCircle2 },
];

export function CheckInPage() {
  const { journey, setJourneyField, contacts, completeJourney, addActivity, navigate } = useApp();
  const [currentState, setCurrentState] = React.useState(0);
  const [selectedContacts, setSelectedContacts] = React.useState<string[]>(journey.contactsReceivingUpdates);
  const [expectedArrival, setExpectedArrival] = React.useState('18:00');

  const advanceState = () => {
    if (currentState < checkInStates.length - 1) {
      setCurrentState(currentState + 1);
    }
  };

  const handleArrived = () => {
    completeJourney();
    setCurrentState(checkInStates.length - 1);
    addActivity({
      type: 'check-in',
      title: 'Arrival confirmed',
      description: `Arrived at ${journey.destination}`,
      icon: 'check-circle',
    });
  };

  const handleExtend = () => {
    setJourneyField({ eta: '25 min' });
    setCurrentState(0);
  };

  const toggleContact = (id: string) => {
    setSelectedContacts((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const activeState = checkInStates[currentState];

  return (
    <PageContainer>
      <StaggerContainer>
        <StaggerItem>
          <PageHeader
            title="Arrival & Check-in"
            subtitle="Smart check-in workflow with intelligent delay allowance"
          />
        </StaggerItem>

        {/* Current state card */}
        <StaggerItem>
          <Card className={cn('border-2', activeState.color.split(' ').find(c => c.startsWith('border-')))}>
            <CardContent className="p-6">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className={cn('flex h-16 w-16 items-center justify-center rounded-2xl border-2', activeState.color)}>
                  <activeState.icon className="h-8 w-8" />
                </div>
                <div>
                  <Badge className={cn('mb-2 border', activeState.color)}>{activeState.label}</Badge>
                  <p className="text-sm text-muted-foreground">
                    {currentState === 0 && 'Your journey is active. Check-in reminders will appear at the configured interval.'}
                    {currentState === 1 && 'A check-in is due. Please confirm your arrival.'}
                    {currentState === 2 && 'Awaiting your arrival confirmation.'}
                    {currentState === 3 && 'You are in the grace period. Please check in soon.'}
                    {currentState === 4 && 'Contacts will be notified if check-in is not completed soon.'}
                    {currentState === 5 && 'Your trusted contacts have been notified about the overdue check-in.'}
                    {currentState === 6 && 'Your journey has been completed successfully.'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </StaggerItem>

        <div className="grid gap-4 lg:grid-cols-2">
          {/* Arrival settings */}
          <StaggerItem>
            <Card>
              <CardHeader>
                <SectionTitle title="Arrival Settings" icon={Clock} subtitle="Configure your check-in schedule" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="mb-2 block text-sm font-medium">Expected arrival time</Label>
                  <Input
                    type="time"
                    value={expectedArrival}
                    onChange={(e) => setExpectedArrival(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium">Check-in frequency</p>
                  <div className="flex gap-2">
                    {[5, 10, 15, 30].map((min) => (
                      <button
                        key={min}
                        onClick={() => setJourneyField({ checkInFrequency: min })}
                        className={cn(
                          'flex-1 rounded-lg border py-2 text-sm font-medium transition-colors',
                          journey.checkInFrequency === min ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:bg-muted'
                        )}
                      >
                        {min}m
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium">Grace period</p>
                  <div className="flex gap-2">
                    {[3, 5, 10].map((min) => (
                      <button
                        key={min}
                        onClick={() => setJourneyField({ gracePeriod: min })}
                        className={cn(
                          'flex-1 rounded-lg border py-2 text-sm font-medium transition-colors',
                          journey.gracePeriod === min ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:bg-muted'
                        )}
                      >
                        {min}m
                      </button>
                    ))}
                  </div>
                </div>
                <div className="rounded-lg bg-muted/40 p-3">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Next check-in</span>
                    <span className="font-medium text-foreground">{journey.checkInFrequency} min</span>
                  </div>
                  <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                    <span>Grace period</span>
                    <span className="font-medium text-foreground">{journey.gracePeriod} min</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>

          {/* Contact selection */}
          <StaggerItem>
            <Card>
              <CardHeader>
                <SectionTitle title="Missed Check-in Contacts" icon={Users} subtitle="Who gets notified" />
              </CardHeader>
              <CardContent className="space-y-2">
                {contacts.map((c) => {
                  const selected = selectedContacts.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      onClick={() => toggleContact(c.id)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all',
                        selected ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/40'
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
              </CardContent>
            </Card>
          </StaggerItem>
        </div>

        {/* Actions */}
        <StaggerItem>
          <Card>
            <CardContent className="flex flex-wrap items-center gap-3 pt-6">
              <Button onClick={handleArrived} size="lg" className="gradient-primary text-white">
                <Flag className="mr-2 h-4 w-4" />
                I've Arrived
              </Button>
              <Button onClick={handleExtend} variant="outline" size="lg">
                <Plus className="mr-2 h-4 w-4" />
                Extend Arrival Time
              </Button>
              <Button onClick={advanceState} variant="secondary" size="lg">
                Simulate Next State
              </Button>
            </CardContent>
          </Card>
        </StaggerItem>

        {/* State flow */}
        <StaggerItem>
          <Card>
            <CardHeader>
              <SectionTitle title="Check-in State Flow" icon={Shield} subtitle="How the smart check-in works" />
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {checkInStates.map((state, i) => {
                  const Icon = state.icon;
                  const isCurrent = i === currentState;
                  const isPast = i < currentState;
                  return (
                    <div
                      key={state.key}
                      className={cn(
                        'flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-all',
                        isCurrent && state.color,
                        isPast && 'bg-success/10 text-success border-success/20',
                        !isCurrent && !isPast && 'border-border text-muted-foreground'
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {state.label}
                      {isCurrent && <span className="ml-1 h-1.5 w-1.5 animate-pulse rounded-full bg-current" />}
                    </div>
                  );
                })}
              </div>
              <p className="mt-4 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                A missed check-in is not proof of danger. Notifications use neutral wording such as "Arrival confirmation overdue." Real contact notifications only operate when explicitly enabled and technically available.
              </p>
            </CardContent>
          </Card>
        </StaggerItem>
      </StaggerContainer>
    </PageContainer>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>;
}

function Input({ type, value, onChange, className, placeholder }: { type?: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; className?: string; placeholder?: string }) {
  return <input type={type} value={value} onChange={onChange} className={cn('flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm', className)} placeholder={placeholder} />;
}
