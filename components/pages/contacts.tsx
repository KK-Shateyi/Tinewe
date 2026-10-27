'use client';

import * as React from 'react';
import {
  Users, UserPlus, Phone, Trash2, Bell, MapPin, Siren, Battery,
  Shield, X, Check, Edit,
} from 'lucide-react';
import { useApp } from '@/components/app-provider';
import {
  PageContainer, PageHeader, SectionTitle, StaggerContainer, StaggerItem, EmptyState,
} from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { TrustedContact } from '@/lib/types';

const eventConfig = [
  { key: 'receivesJourneyUpdates' as const, label: 'Journey Updates', icon: MapPin },
  { key: 'receivesSOSAlerts' as const, label: 'SOS Alerts', icon: Siren },
  { key: 'receivesLocationShare' as const, label: 'Location Share', icon: Shield },
  { key: 'receivesLowBatteryAlerts' as const, label: 'Low Battery', icon: Battery },
];

export function ContactsPage() {
  const { contacts, contactsLoading, addContact, updateContact, removeContact } = useApp();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState<{
    name: string;
    phone: string;
    relationship: string;
    receivesJourneyUpdates: boolean;
    receivesSOSAlerts: boolean;
    receivesLocationShare: boolean;
    receivesLowBatteryAlerts: boolean;
    notificationStatus: TrustedContact['notificationStatus'];
  }>({
    name: '',
    phone: '',
    relationship: 'Family',
    receivesJourneyUpdates: true,
    receivesSOSAlerts: true,
    receivesLocationShare: false,
    receivesLowBatteryAlerts: false,
    notificationStatus: 'active',
  });

  const resetForm = () => {
    setForm({
      name: '', phone: '', relationship: 'Family',
      receivesJourneyUpdates: true, receivesSOSAlerts: true,
      receivesLocationShare: false, receivesLowBatteryAlerts: false,
      notificationStatus: 'active',
    });
    setEditingId(null);
  };

  const openAdd = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (contact: TrustedContact) => {
    setForm({
      name: contact.name,
      phone: contact.phone,
      relationship: contact.relationship,
      receivesJourneyUpdates: contact.receivesJourneyUpdates,
      receivesSOSAlerts: contact.receivesSOSAlerts,
      receivesLocationShare: contact.receivesLocationShare,
      receivesLowBatteryAlerts: contact.receivesLowBatteryAlerts,
      notificationStatus: contact.notificationStatus,
    });
    setEditingId(contact.id);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.phone.trim()) return;
    setSaving(true);
    if (editingId) {
      await updateContact(editingId, form);
    } else {
      await addContact(form);
    }
    setSaving(false);
    setDialogOpen(false);
    resetForm();
  };

  const handleDelete = async () => {
    if (deleteId) {
      await removeContact(deleteId);
      setDeleteId(null);
    }
  };

  const activeCount = contacts.filter((c) => c.notificationStatus === 'active').length;
  const pausedCount = contacts.filter((c) => c.notificationStatus === 'paused').length;

  return (
    <PageContainer>
      <StaggerContainer>
        <StaggerItem>
          <PageHeader
            title="Trusted Contacts"
            subtitle="Manage your safety network and notification preferences"
            action={
              <Button onClick={openAdd} className="gradient-primary text-white">
                <UserPlus className="mr-2 h-4 w-4" />
                Add Contact
              </Button>
            }
          />
        </StaggerItem>

        {/* Stats */}
        <StaggerItem>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total Contacts', value: contactsLoading ? '—' : contacts.length, color: 'text-primary' },
              { label: 'Active', value: contactsLoading ? '—' : activeCount, color: 'text-success' },
              { label: 'Paused', value: contactsLoading ? '—' : pausedCount, color: 'text-muted-foreground' },
            ].map((stat) => (
              <Card key={stat.label} className="text-center">
                <CardContent className="pt-4 pb-4">
                  <p className={cn('text-2xl font-bold', stat.color)}>{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </StaggerItem>

        {/* Contact cards */}
        {contactsLoading ? (
          <StaggerItem>
            <div className="grid gap-4 md:grid-cols-2">
              {[0, 1, 2, 3].map((i) => (
                <Card key={i} className="h-48 animate-pulse bg-muted/40" />
              ))}
            </div>
          </StaggerItem>
        ) : contacts.length === 0 ? (
          <StaggerItem>
            <EmptyState
              icon={Users}
              title="No trusted contacts yet"
              description="Add trusted contacts who will receive your journey updates and SOS alerts."
              action={
                <Button onClick={openAdd} className="gradient-primary text-white">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Your First Contact
                </Button>
              }
            />
          </StaggerItem>
        ) : (
          <StaggerItem>
            <div className="grid gap-4 md:grid-cols-2">
              {contacts.map((contact) => (
                <Card key={contact.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn('flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-sm font-bold text-white', contact.avatarColor)}>
                          {contact.initials}
                        </div>
                        <div>
                          <p className="font-display text-base font-semibold">{contact.name}</p>
                          <p className="text-xs text-muted-foreground">{contact.relationship}</p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          contact.notificationStatus === 'active' && 'border-success/30 text-success',
                          contact.notificationStatus === 'paused' && 'border-muted-foreground/30 text-muted-foreground',
                          contact.notificationStatus === 'pending' && 'border-warning/30 text-warning',
                        )}
                      >
                        {contact.notificationStatus}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-3.5 w-3.5" />
                      <a href={`tel:${contact.phone}`} className="hover:text-foreground">{contact.phone}</a>
                    </div>

                    <div className="space-y-2 rounded-xl bg-muted/30 p-3">
                      {eventConfig.map((event) => {
                        const Icon = event.icon;
                        return (
                          <div key={event.key} className="flex items-center justify-between">
                            <span className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Icon className="h-3.5 w-3.5" />
                              {event.label}
                            </span>
                            <Switch
                              checked={contact[event.key]}
                              onCheckedChange={(v) => updateContact(contact.id, { [event.key]: v })}
                            />
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(contact)}>
                        <Edit className="mr-1.5 h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-destructive/30 text-destructive hover:bg-destructive/5"
                        onClick={() => setDeleteId(contact.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </StaggerItem>
        )}
      </StaggerContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(v) => { setDialogOpen(v); if (!v) resetForm(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Contact' : 'Add Trusted Contact'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone number</Label>
              <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+27 82 123 4567" />
            </div>
            <div className="space-y-2">
              <Label>Relationship</Label>
              <Select value={form.relationship} onValueChange={(v) => setForm({ ...form, relationship: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Family">Family</SelectItem>
                  <SelectItem value="Friend">Friend</SelectItem>
                  <SelectItem value="Partner">Partner</SelectItem>
                  <SelectItem value="Colleague">Colleague</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 rounded-xl bg-muted/30 p-3">
              <p className="text-sm font-medium">Notification events</p>
              {eventConfig.map((event) => {
                const Icon = event.icon;
                return (
                  <div key={event.key} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Icon className="h-3.5 w-3.5" />
                      {event.label}
                    </span>
                    <Switch
                      checked={form[event.key]}
                      onCheckedChange={(v) => setForm({ ...form, [event.key]: v })}
                    />
                  </div>
                );
              })}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }} disabled={saving}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="gradient-primary text-white">
              {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Add Contact'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove trusted contact?</AlertDialogTitle>
            <AlertDialogDescription>
              This contact will no longer receive journey updates, SOS alerts or location shares. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}
