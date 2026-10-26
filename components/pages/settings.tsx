'use client';

import * as React from 'react';
import {
  Moon, Sun, User, Shield, MapPin, Bell, Eye, Trash2, Watch,
  Calculator, Lock, Wifi, Battery, Accessibility, ChevronRight,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useApp } from '@/components/app-provider';
import { DiscreetModeGuard } from '@/components/features/discreet-mode-guard';
import { FakeCallAudioCard } from '@/components/features/fake-call-audio-card';
import { FakeCallSetupCard } from '@/components/features/fake-call-setup-card';
import {
  PageContainer, PageHeader, SectionTitle, StaggerContainer, StaggerItem,
} from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const {
    discreetMode, setDiscreetMode, pinEnabled, setPinEnabled, discreetPin, setDiscreetPin,
    connectivity, setConnectivity, navigate, wearables, toggleWearableConnection,
    profile, profileLoading, saveProfile, signOut,
  } = useApp();
  const { toast } = useToast();
  const [showDelete, setShowDelete] = React.useState(false);
  const [discreetGuardOpen, setDiscreetGuardOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [nameDraft, setNameDraft] = React.useState(profile.displayName);
  const [emailDraft, setEmailDraft] = React.useState(profile.email);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => setMounted(true), []);
  React.useEffect(() => {
    setNameDraft(profile.displayName);
    setEmailDraft(profile.email);
  }, [profile.displayName, profile.email]);

  const handleSaveProfile = async () => {
    const name = nameDraft.trim();
    const email = emailDraft.trim();
    if (!name) {
      toast({ title: 'Name required', description: 'Please enter a display name.', variant: 'destructive' });
      return;
    }
    if (!email) {
      toast({ title: 'Email required', description: 'Please enter an email address.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const ok = await saveProfile({ displayName: name, email });
    setSaving(false);
    if (ok) {
      toast({ title: 'Profile saved', description: 'Your details have been updated.' });
    }
  };

  return (
    <PageContainer>
      <StaggerContainer>
        <StaggerItem>
          <PageHeader title="Settings" subtitle="Customise your Tinewe experience" />
        </StaggerItem>

        {/* Appearance */}
        <StaggerItem>
          <Card>
            <CardHeader>
              <SectionTitle title="Appearance" icon={mounted && theme === 'dark' ? Moon : Sun} subtitle="Theme and display" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Dark mode</p>
                  <p className="text-xs text-muted-foreground">Switch between light and dark themes</p>
                </div>
                <Switch
                  checked={mounted ? theme === 'dark' : false}
                  onCheckedChange={(v) => setTheme(v ? 'dark' : 'light')}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Reduced motion</p>
                  <p className="text-xs text-muted-foreground">Minimise animations and transitions</p>
                </div>
                <Switch defaultChecked={false} />
              </div>
            </CardContent>
          </Card>
        </StaggerItem>

        {/* Profile */}
        <StaggerItem>
          <Card>
            <CardHeader>
              <SectionTitle title="Profile" icon={User} subtitle="Your account information" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary text-xl font-bold text-white">
                  {profileLoading ? '··' : profile.displayName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-display text-base font-semibold">{profileLoading ? 'Loading…' : profile.displayName}</p>
                  <p className="text-sm text-muted-foreground">{profileLoading ? '…' : profile.email}</p>
                  <Badge variant="outline" className="mt-1">Free plan</Badge>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Display name</Label>
                  <Input id="name" value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} disabled={profileLoading || saving} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={emailDraft} onChange={(e) => setEmailDraft(e.target.value)} disabled={profileLoading || saving} />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveProfile} disabled={profileLoading || saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </StaggerItem>

        {/* Privacy & Permissions */}
        <StaggerItem>
          <Card>
            <CardHeader>
              <SectionTitle title="Privacy & Permissions" icon={Shield} subtitle="Control your data and access" />
            </CardHeader>
            <CardContent className="space-y-4">
              <SettingToggle
                icon={MapPin}
                title="Location services"
                description="Allow GPS access for journey tracking"
                checked={connectivity.gpsAvailable}
                onChange={(v) => setConnectivity({ gpsAvailable: v })}
              />
              <Separator />
              <SettingToggle
                icon={Wifi}
                title="Connectivity monitoring"
                description="Check internet connection status"
                checked={connectivity.online}
                onChange={(v) => setConnectivity({ online: v })}
              />
              <Separator />
              <SettingToggle
                icon={Battery}
                title="Battery status"
                description="Monitor device battery level"
                checked={connectivity.batteryLevel !== null}
                onChange={(v) => setConnectivity({ batteryLevel: v ? 67 : null })}
              />
            </CardContent>
          </Card>
        </StaggerItem>

        {/* Notifications */}
        <StaggerItem>
          <Card>
            <CardHeader>
              <SectionTitle title="Notification Preferences" icon={Bell} subtitle="Choose what alerts you receive" />
            </CardHeader>
            <CardContent className="space-y-4">
              <SettingToggle icon={Bell} title="Journey check-in reminders" description="Get notified when a check-in is due" defaultChecked />
              <Separator />
              <SettingToggle icon={Bell} title="SOS delivery confirmations" description="Confirm when alerts are delivered" defaultChecked />
              <Separator />
              <SettingToggle icon={Bell} title="Contact activity" description="When contacts accept location shares" defaultChecked />
              <Separator />
              <SettingToggle icon={Battery} title="Low battery warnings" description="Alert when battery drops below threshold" defaultChecked />
            </CardContent>
          </Card>
        </StaggerItem>

        {/* Discreet Access */}
        <StaggerItem>
          <Card>
            <CardHeader>
              <SectionTitle title="Discreet Access" icon={Calculator} subtitle="Calculator disguise mode" />
            </CardHeader>
            <CardContent className="space-y-4">
              <SettingToggle
                icon={Calculator}
                title="Enable disguise mode"
                description="App appears as a calculator when locked"
                checked={discreetMode}
                onChange={(v) => {
                  if (v && (!pinEnabled || !discreetPin)) {
                    setDiscreetGuardOpen(true);
                  } else {
                    setDiscreetMode(v);
                  }
                }}
              />
              <Separator />
              <SettingToggle
                icon={Lock}
                title="PIN protection"
                description="Require a PIN to access Tinewe"
                checked={pinEnabled}
                onChange={setPinEnabled}
              />
              {pinEnabled && (
                <div className="space-y-2 rounded-xl bg-muted/40 p-3">
                  <Label htmlFor="pin">Set your PIN (4-6 digits)</Label>
                  <Input
                    id="pin"
                    type="password"
                    maxLength={6}
                    placeholder="••••"
                    inputMode="numeric"
                    value={discreetPin}
                    onChange={(event) => setDiscreetPin(event.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Use 4–6 digits to unlock the protected interface. A disguised appearance cannot guarantee the app's presence will be hidden from someone with device access.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </StaggerItem>

        {/* Fake Call Setup */}
        <StaggerItem>
          <FakeCallSetupCard />
        </StaggerItem>

        {/* Fake Call Audio */}
        <StaggerItem>
          <FakeCallAudioCard />
        </StaggerItem>

        {/* Accessibility */}
        <StaggerItem>
          <Card>
            <CardHeader>
              <SectionTitle title="Accessibility" icon={Accessibility} subtitle="Display and interaction preferences" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="mb-2 block">Text size</Label>
                <Select defaultValue="medium">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <SettingToggle icon={Eye} title="High contrast mode" description="Increase visual contrast for readability" defaultChecked={false} />
              <Separator />
              <SettingToggle icon={Accessibility} title="Screen reader hints" description="Additional labels for assistive technology" defaultChecked />
            </CardContent>
          </Card>
        </StaggerItem>

        {/* Connected Devices */}
        <StaggerItem>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <SectionTitle title="Connected Wearables" icon={Watch} subtitle={`${wearables.filter(w => w.connected).length} device(s) connected`} />
                <Button variant="ghost" size="sm" onClick={() => navigate('wearables')}>
                  Manage
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {wearables.map((w) => (
                <div key={w.id} className="flex items-center gap-3 rounded-lg bg-muted/40 p-3">
                  <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', w.connected ? 'gradient-primary text-white' : 'bg-muted text-muted-foreground')}>
                    <Watch className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{w.name}</p>
                    <p className="text-xs text-muted-foreground">{w.connected ? `Connected${w.battery !== null ? ` • ${w.battery}%` : ''}` : 'Disconnected'}</p>
                  </div>
                  <Switch checked={w.connected} onCheckedChange={() => toggleWearableConnection(w.id)} />
                </div>
              ))}
            </CardContent>
          </Card>
        </StaggerItem>

        {/* Data Deletion */}
        <StaggerItem>
          <Card className="border-destructive/20">
            <CardHeader>
              <SectionTitle title="Data Management" icon={Trash2} subtitle="Delete your data permanently" />
            </CardHeader>
            <CardContent>
              <p className="mb-3 text-sm text-muted-foreground">
                Permanently delete all your safety plans, activity history, trusted contacts and transport records. This action cannot be undone.
              </p>
              <Button variant="destructive" onClick={() => setShowDelete(true)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete All Data
              </Button>
            </CardContent>
          </Card>
        </StaggerItem>

        {/* About */}
        <StaggerItem>
          <div className="rounded-2xl border border-border bg-muted/20 p-6 text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl gradient-primary">
              <span className="font-display text-lg font-bold text-white">T</span>
            </div>
            <p className="font-display text-lg font-bold">Tinewe</p>
            <p className="text-xs text-muted-foreground">With you, every step.</p>
            <p className="mt-2 text-xs text-muted-foreground">Version 1.0.0 — Hackathon MVP</p>
            <p className="text-xs text-muted-foreground">Developed by Special Devs for FNB AOTY 2026</p>
            <Button variant="outline" className="mt-4 w-full" onClick={() => void signOut()}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>
        </StaggerItem>
      </StaggerContainer>

      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete all your data?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove all safety plans, activity history, trusted contacts and transport records. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => setShowDelete(false)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <DiscreetModeGuard open={discreetGuardOpen} onOpenChange={setDiscreetGuardOpen} />
    </PageContainer>
  );
}

function SettingToggle({
  icon: Icon,
  title,
  description,
  checked,
  defaultChecked,
  onChange,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (v: boolean) => void;
}) {
  const [internal, setInternal] = React.useState(defaultChecked ?? false);
  const isControlled = checked !== undefined;
  const value = isControlled ? checked! : internal;

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch
        checked={value}
        onCheckedChange={(v) => {
          if (!isControlled) setInternal(v);
          onChange?.(v);
        }}
      />
    </div>
  );
}
