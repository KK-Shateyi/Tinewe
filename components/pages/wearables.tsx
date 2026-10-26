'use client';

import * as React from 'react';
import {
  Watch, Battery, CheckCircle2, XCircle, Bluetooth, Shield, Siren,
  Heart, MapPin, Plus, Info, Camera, Clock,
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

export function WearablesPage() {
  const { wearables, toggleWearableConnection } = useApp();

  return (
    <PageContainer>
      <StaggerContainer>
        <StaggerItem>
          <PageHeader
            title="Wearable Integration"
            subtitle="Connect safety devices for check-ins and alerts"
          />
        </StaggerItem>

        {/* Device cards */}
        <StaggerItem>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {wearables.map((device) => (
              <Card key={device.id} className={cn('transition-all', device.connected && 'ring-1 ring-success/20')}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'flex h-12 w-12 items-center justify-center rounded-2xl',
                        device.connected ? 'gradient-primary text-white' : 'bg-muted text-muted-foreground'
                      )}>
                        <Watch className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-display text-sm font-semibold">{device.name}</p>
                        <p className="text-xs text-muted-foreground">{device.brand}</p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        device.connected ? 'border-success/30 text-success' : 'border-muted-foreground/30 text-muted-foreground'
                      )}
                    >
                      {device.connected ? 'Connected' : 'Disconnected'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Battery */}
                  {device.battery !== null && (
                    <div>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Battery className="h-3.5 w-3.5" />
                          Battery
                        </span>
                        <span className="font-medium">{device.battery}%</span>
                      </div>
                      <Progress value={device.battery} className="h-1.5" />
                    </div>
                  )}

                  {/* Permissions */}
                  <div>
                    <p className="mb-1.5 text-xs font-medium text-muted-foreground">Permissions</p>
                    <div className="flex flex-wrap gap-1.5">
                      {device.permissions.map((p) => (
                        <span key={p} className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Last sync */}
                  {device.lastSync && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Last synced: {new Date(device.lastSync).toLocaleString('en-ZA', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
                    <Button
                      onClick={() => toggleWearableConnection(device.id)}
                      className={cn('flex-1', device.connected ? '' : 'gradient-primary text-white')}
                      variant={device.connected ? 'outline' : 'default'}
                      size="sm"
                    >
                      {device.connected ? (
                        <><XCircle className="mr-1.5 h-3.5 w-3.5" />Disconnect</>
                      ) : (
                        <><Bluetooth className="mr-1.5 h-3.5 w-3.5" />Connect</>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </StaggerItem>

        {/* Wearable features */}
        <StaggerItem>
          <Card>
            <CardHeader>
              <SectionTitle title="Wearable Features" icon={Shield} subtitle="Safety features available on connected devices" />
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-border p-4">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-success/10 text-success">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-semibold">Quick Check-in</p>
                  <p className="mt-1 text-xs text-muted-foreground">Confirm your safety with a tap on your wrist</p>
                </div>
                <div className="rounded-xl border border-border p-4">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                    <Siren className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-semibold">SOS Shortcut</p>
                  <p className="mt-1 text-xs text-muted-foreground">Trigger emergency alerts from your wearable</p>
                </div>
                <div className="rounded-xl border border-border p-4">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                    <Heart className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-semibold">Heart Rate Monitor</p>
                  <p className="mt-1 text-xs text-muted-foreground">Track wellness metrics during journeys</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </StaggerItem>

        {/* Future innovation */}
        <StaggerItem>
          <Card className="border-dashed border-2 border-border">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-warning/10 text-warning">
                  <Info className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold">Future Innovation: Camera-Based Detection</h3>
                  <Badge variant="outline" className="mt-1 border-warning/30 text-warning">Conceptual — Not Implemented</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                We envision future wearable devices equipped with camera-based detection capabilities that could identify potential threats and automatically trigger safety protocols. This technology is currently conceptual and not available in any existing device.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-muted/40 p-3">
                  <div className="mb-1.5 flex items-center gap-2">
                    <Camera className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Under-display 360° Camera</span>
                  </div>
                  <p className="text-xs text-muted-foreground">A proposed wearable camera that captures surroundings without visible lenses. No existing device currently supports this technology.</p>
                </div>
                <div className="rounded-xl bg-muted/40 p-3">
                  <div className="mb-1.5 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">AI Threat Detection</span>
                  </div>
                  <p className="text-xs text-muted-foreground">On-device AI could analyse visual cues to detect potentially dangerous situations and prompt check-ins.</p>
                </div>
              </div>
              <div className="rounded-lg bg-warning/5 p-3">
                <p className="text-xs text-muted-foreground">
                  Tinewe does not claim partnerships with Apple, Samsung, or any wearable manufacturer. We do not suggest that existing devices support an under-display 360° camera. These features are presented as future concepts for innovation purposes only.
                </p>
              </div>
            </CardContent>
          </Card>
        </StaggerItem>
      </StaggerContainer>
    </PageContainer>
  );
}
