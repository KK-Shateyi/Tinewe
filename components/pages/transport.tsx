'use client';

import * as React from 'react';
import {
  Car, Camera, Trash2, Share2, Shield, CheckCircle2, Plus, Info,
  User, Hash,
} from 'lucide-react';
import { useApp } from '@/components/app-provider';
import {
  PageContainer, PageHeader, SectionTitle, StaggerContainer, StaggerItem, EmptyState,
} from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

export function TransportPage() {
  const { transportRecords, transportLoading, addTransportRecord, removeTransportRecord, contacts, contactsLoading } = useApp();
  const [form, setForm] = React.useState({
    registration: '',
    driverName: '',
    driverId: '',
    vehicleType: 'Uber',
    tripDetails: '',
    sharedWith: [] as string[],
  });
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const handleSave = async () => {
    if (!form.registration.trim()) return;
    setSaving(true);
    await addTransportRecord(form);
    setSaving(false);
    setForm({ registration: '', driverName: '', driverId: '', vehicleType: 'Uber', tripDetails: '', sharedWith: [] });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleShare = (id: string) => {
    setForm((prev) => ({
      ...prev,
      sharedWith: prev.sharedWith.includes(id)
        ? prev.sharedWith.filter((c) => c !== id)
        : [...prev.sharedWith, id],
    }));
  };

  return (
    <PageContainer>
      <StaggerContainer>
        <StaggerItem>
          <PageHeader
            title="Transport Verification"
            subtitle="Verify and share trip details with trusted contacts"
          />
        </StaggerItem>

        {/* Data handling notice */}
        <StaggerItem>
          <div className="rounded-2xl border border-secondary/20 bg-secondary/5 p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 shrink-0 text-secondary" />
              <div>
                <p className="text-sm font-semibold text-secondary">Data Handling</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Entering a registration number does not automatically prove a driver or vehicle is legitimate. Tinewe collects only the information you choose to provide. You can delete stored transport information at any time.
                </p>
              </div>
            </div>
          </div>
        </StaggerItem>

        <div className="grid gap-4 lg:grid-cols-2">
          {/* Entry form */}
          <StaggerItem>
            <Card className="h-full">
              <CardHeader>
                <SectionTitle title="Log Transport Details" icon={Car} subtitle="Enter trip information" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reg">Vehicle registration number</Label>
                  <Input
                    id="reg"
                    value={form.registration}
                    onChange={(e) => setForm({ ...form, registration: e.target.value.toUpperCase() })}
                    placeholder="e.g. GP 123 ABC"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="driver">Driver name (optional)</Label>
                    <Input
                      id="driver"
                      value={form.driverName}
                      onChange={(e) => setForm({ ...form, driverName: e.target.value })}
                      placeholder="Driver name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="driverId">Driver ID (optional)</Label>
                    <Input
                      id="driverId"
                      value={form.driverId}
                      onChange={(e) => setForm({ ...form, driverId: e.target.value })}
                      placeholder="Driver ID"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Vehicle / service type</Label>
                  <Select value={form.vehicleType} onValueChange={(v) => setForm({ ...form, vehicleType: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Uber">Uber</SelectItem>
                      <SelectItem value="Bolt">Bolt</SelectItem>
                      <SelectItem value="Taxi">Taxi</SelectItem>
                      <SelectItem value="Private">Private vehicle</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="trip">Trip details (optional)</Label>
                  <Textarea
                    id="trip"
                    value={form.tripDetails}
                    onChange={(e) => setForm({ ...form, tripDetails: e.target.value })}
                    rows={2}
                    placeholder="e.g. From Sandton to Rosebank, estimated 18 min"
                    className="resize-none"
                  />
                </div>

                <div>
                  <Label className="mb-2 block">Share with trusted contacts</Label>
                  <div className="flex flex-wrap gap-2">
                    {contactsLoading ? (
                      <p className="text-xs text-muted-foreground">Loading contacts…</p>
                    ) : contacts.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No contacts yet. Add a trusted contact first to share trip details.</p>
                    ) : contacts.map((c) => {
                      const selected = form.sharedWith.includes(c.id);
                      return (
                        <button
                          key={c.id}
                          onClick={() => toggleShare(c.id)}
                          className={cn(
                            'flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
                            selected ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:bg-muted'
                          )}
                        >
                          <div className={cn('flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br text-[8px] font-bold text-white', c.avatarColor)}>
                            {c.initials}
                          </div>
                          {c.name.split(' ')[0]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Button onClick={handleSave} className="w-full gradient-primary text-white" disabled={!form.registration.trim() || saving}>
                  {saving ? 'Saving…' : saved ? <><CheckCircle2 className="mr-2 h-4 w-4" />Saved!</> : <><Plus className="mr-2 h-4 w-4" />Log Transport Details</>}
                </Button>
              </CardContent>
            </Card>
          </StaggerItem>

          {/* Camera / manual entry note + records */}
          <StaggerItem>
            <div className="space-y-4">
              {/* Camera placeholder */}
              <Card>
                <CardHeader>
                  <SectionTitle title="Registration Plate Photo" icon={Camera} subtitle="Capture or attach an image" />
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-8 text-center">
                    <Camera className="h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">Camera access unavailable</p>
                    <p className="text-xs text-muted-foreground">Use manual entry instead</p>
                  </div>
                </CardContent>
              </Card>

              {/* Recent records */}
              <Card>
                <CardHeader>
                  <SectionTitle title="Logged Trips" icon={Car} subtitle={`${transportRecords.length} record(s)`} />
                </CardHeader>
                <CardContent>
                  {transportLoading ? (
                    <div className="space-y-3">
                      {[0, 1].map((i) => (
                        <div key={i} className="h-20 animate-pulse rounded-xl bg-muted/40" />
                      ))}
                    </div>
                  ) : transportRecords.length === 0 ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">No transport records yet</p>
                  ) : (
                    <div className="space-y-3">
                      {transportRecords.map((r) => (
                        <div key={r.id} className="rounded-xl border border-border p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary text-white">
                                <Hash className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold">{r.registration}</p>
                                <p className="text-xs text-muted-foreground">{r.vehicleType}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => setDeleteId(r.id)}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          {r.driverName && (
                            <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                              <User className="h-3 w-3" />
                              {r.driverName}
                            </div>
                          )}
                          {r.tripDetails && (
                            <p className="mt-1 text-xs text-muted-foreground">{r.tripDetails}</p>
                          )}
                          {r.sharedWith.length > 0 && (
                            <div className="mt-2 flex items-center gap-1.5">
                              <Share2 className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">Shared with {r.sharedWith.length} contact(s)</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </StaggerItem>
        </div>
      </StaggerContainer>

      <AlertDialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete transport record?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the stored transport information.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deleteId) void removeTransportRecord(deleteId); setDeleteId(null); }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}
