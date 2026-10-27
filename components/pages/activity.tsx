'use client';

import * as React from 'react';
import {
  Activity, Bell, CheckCircle2, Navigation, MapPin, MapPinOff, Siren,
  UserPlus, Shield, Car, Watch, PhoneCall, Battery, HeartHandshake,
  Trash2, X,
} from 'lucide-react';
import { useApp } from '@/components/app-provider';
import {
  PageContainer, PageHeader, SectionTitle, StaggerContainer, StaggerItem,
} from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import type { ActivityEntry } from '@/lib/types';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'check-circle': CheckCircle2,
  navigation: Navigation,
  'map-pin': MapPin,
  'map-pin-off': MapPinOff,
  siren: Siren,
  'user-plus': UserPlus,
  shield: Shield,
  car: Car,
  watch: Watch,
  'phone-call': PhoneCall,
  battery: Battery,
  'heart-handshake': HeartHandshake,
  flag: Navigation,
};

const typeColors: Record<string, string> = {
  'journey-started': 'text-secondary',
  'journey-completed': 'text-success',
  'check-in': 'text-success',
  'location-started': 'text-secondary',
  'location-ended': 'text-muted-foreground',
  'sos-sent': 'text-destructive',
  'contact-added': 'text-primary',
  'contact-notified': 'text-warning',
  'support-viewed': 'text-accent',
  'safety-plan-saved': 'text-secondary',
  'transport-logged': 'text-primary',
  'wearable-connected': 'text-secondary',
  'fake-call': 'text-muted-foreground',
  'battery-alert': 'text-warning',
};

export function ActivityPage() {
  const { activities, activitiesLoading, notifications, notificationsLoading, markNotificationRead, clearNotifications } = useApp();

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-ZA', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <PageContainer>
      <StaggerContainer>
        <StaggerItem>
          <PageHeader
            title="Activity & Notifications"
            subtitle="Your privacy-conscious safety activity log"
          />
        </StaggerItem>

        <Tabs defaultValue="activity" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="activity">
              <Activity className="mr-2 h-4 w-4" />
              Activity Log
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="mr-2 h-4 w-4" />
              Notifications
              {notifications.filter((n) => !n.read).length > 0 && (
                <Badge className="ml-1.5 h-4 min-w-4 px-1 text-[10px]">{notifications.filter((n) => !n.read).length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Activity log */}
          <TabsContent value="activity" className="space-y-3">
            <Card>
              <CardContent className="pt-6">
                <p className="mb-4 text-xs text-muted-foreground">
                  Activity entries are privacy-conscious and avoid displaying sensitive information unnecessarily.
                </p>
                {activitiesLoading ? (
                  <div className="space-y-2">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className="h-12 animate-pulse rounded-lg bg-muted/40" />
                    ))}
                  </div>
                ) : activities.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Activity className="mb-3 h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No activity yet. Your safety actions will appear here.</p>
                  </div>
                ) : (
                <div className="space-y-1">
                  {activities.map((activity) => {
                    const Icon = iconMap[activity.icon] || Activity;
                    return (
                      <div
                        key={activity.id}
                        className="flex items-center gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-muted/40"
                      >
                        <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted/60', typeColors[activity.type] || 'text-muted-foreground')}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">{activity.title}</p>
                          <p className="truncate text-xs text-muted-foreground">{activity.description}</p>
                        </div>
                        <span className="shrink-0 text-[10px] text-muted-foreground">{formatTime(activity.timestamp)}</span>
                      </div>
                    );
                  })}
                </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="space-y-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <SectionTitle title="Notifications" icon={Bell} />
                  {notifications.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearNotifications}>
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                      Clear all
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {notificationsLoading ? (
                  <div className="space-y-2">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="h-16 animate-pulse rounded-xl bg-muted/40" />
                    ))}
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Bell className="mb-3 h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No notifications</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={cn(
                          'flex items-start gap-3 rounded-xl border p-3 transition-colors',
                          n.read ? 'border-border bg-transparent' : 'border-primary/20 bg-primary/5'
                        )}
                      >
                        <div className={cn(
                          'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                          n.type === 'emergency' && 'bg-destructive/10 text-destructive',
                          n.type === 'warning' && 'bg-warning/10 text-warning',
                          n.type === 'success' && 'bg-success/10 text-success',
                          n.type === 'info' && 'bg-secondary/10 text-secondary'
                        )}>
                          <Bell className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-foreground">{n.title}</p>
                            {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                          </div>
                          <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>
                          <p className="mt-1 text-[10px] text-muted-foreground">{formatTime(n.timestamp)}</p>
                        </div>
                        {!n.read && (
                          <button
                            onClick={() => markNotificationRead(n.id)}
                            className="shrink-0 text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </StaggerContainer>
    </PageContainer>
  );
}
