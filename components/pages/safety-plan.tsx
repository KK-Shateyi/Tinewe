'use client';

import * as React from 'react';
import {
  Shield, Users, FileText, HeartHandshake, Car, MapPin, Phone,
  Save, Trash2, Plus, Lock, StickyNote, CheckCircle2,
} from 'lucide-react';
import { useApp } from '@/components/app-provider';
import {
  PageContainer, PageHeader, SectionTitle, StaggerContainer, StaggerItem,
} from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import type { SafetyPlan as SafetyPlanType } from '@/lib/types';

export function SafetyPlanPage() {
  const { safetyPlan, safetyPlanLoading, saveSafetyPlan, contacts, contactsLoading, navigate } = useApp();
  const [plan, setPlan] = React.useState<SafetyPlanType>(safetyPlan);
  const [newDoc, setNewDoc] = React.useState('');
  const [newOrg, setNewOrg] = React.useState('');
  const [newLocation, setNewLocation] = React.useState('');
  const [showDelete, setShowDelete] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    setPlan(safetyPlan);
  }, [safetyPlan]);

  const handleSave = async () => {
    setSaving(true);
    await saveSafetyPlan(plan);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const addDoc = () => {
    if (!newDoc.trim()) return;
    setPlan({ ...plan, importantDocuments: [...plan.importantDocuments, newDoc] });
    setNewDoc('');
  };
  const addOrg = () => {
    if (!newOrg.trim()) return;
    setPlan({ ...plan, preferredOrganisations: [...plan.preferredOrganisations, newOrg] });
    setNewOrg('');
  };
  const addLocation = () => {
    if (!newLocation.trim()) return;
    setPlan({ ...plan, safeLocations: [...plan.safeLocations, newLocation] });
    setNewLocation('');
  };

  const removeDoc = (i: number) => setPlan({ ...plan, importantDocuments: plan.importantDocuments.filter((_, idx) => idx !== i) });
  const removeOrg = (i: number) => setPlan({ ...plan, preferredOrganisations: plan.preferredOrganisations.filter((_, idx) => idx !== i) });
  const removeLocation = (i: number) => setPlan({ ...plan, safeLocations: plan.safeLocations.filter((_, idx) => idx !== i) });

  const handleDelete = () => {
    setPlan({
      trustedContacts: [], importantDocuments: [], preferredOrganisations: [],
      transportArrangements: '', safeLocations: [], emergencyInfo: '',
      privateNotes: '', updatedAt: null,
    });
    setShowDelete(false);
  };

  return (
    <PageContainer>
      <StaggerContainer>
        <StaggerItem>
          <PageHeader
            title="Personal Safety Plan"
            subtitle="Create and manage your private safety planning"
            action={
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowDelete(true)} className="border-destructive/30 text-destructive hover:bg-destructive/5">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Plan
                </Button>
                <Button onClick={handleSave} disabled={saving || safetyPlanLoading} className="gradient-primary text-white">
                  {saving ? 'Saving…' : saved ? <><CheckCircle2 className="mr-2 h-4 w-4" />Saved!</> : <><Save className="mr-2 h-4 w-4" />Save Plan</>}
                </Button>
              </div>
            }
          />
        </StaggerItem>

        {safetyPlan.updatedAt && (
          <StaggerItem>
            <div className="flex items-center gap-2 rounded-xl bg-muted/40 p-3 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-success" />
              Last saved: {new Date(safetyPlan.updatedAt).toLocaleString('en-ZA', { dateStyle: 'medium', timeStyle: 'short' })}
            </div>
          </StaggerItem>
        )}

        {/* Privacy notice */}
        <StaggerItem>
          <div className="rounded-2xl border border-secondary/20 bg-secondary/5 p-4">
            <div className="flex items-start gap-3">
              <Lock className="h-5 w-5 shrink-0 text-secondary" />
              <div>
                <p className="text-sm font-semibold text-secondary">Your plan is private</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Your safety plan is stored locally and protected. We minimise data collection and protect any stored information. Avoid unnecessary personal-data exposure through previews or notifications.
                </p>
              </div>
            </div>
          </div>
        </StaggerItem>

        <div className="grid gap-4 lg:grid-cols-2">
          {/* Trusted contacts */}
          <StaggerItem>
            <Card className="h-full">
              <CardHeader>
                <SectionTitle title="Trusted Contacts" icon={Users} subtitle="Your safety network" />
              </CardHeader>
              <CardContent className="space-y-2">
                {contactsLoading ? (
                  <p className="py-4 text-center text-sm text-muted-foreground">Loading contacts…</p>
                ) : contacts.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border py-6 text-center text-sm text-muted-foreground">
                    No contacts yet. Add a trusted contact first.
                  </div>
                ) : (
                contacts.map((c) => {
                  const selected = plan.trustedContacts.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      onClick={() => {
                        setPlan({
                          ...plan,
                          trustedContacts: selected
                            ? plan.trustedContacts.filter((id) => id !== c.id)
                            : [...plan.trustedContacts, c.id],
                        });
                      }}
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
                })
                )}
                <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('contacts')}>
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Add new contact
                </Button>
              </CardContent>
            </Card>
          </StaggerItem>

          {/* Important documents */}
          <StaggerItem>
            <Card className="h-full">
              <CardHeader>
                <SectionTitle title="Important Documents" icon={FileText} subtitle="Reminders for essential documents" />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input value={newDoc} onChange={(e) => setNewDoc(e.target.value)} placeholder="e.g. ID document, medical aid card" onKeyDown={(e) => e.key === 'Enter' && addDoc()} />
                  <Button size="icon" onClick={addDoc}><Plus className="h-4 w-4" /></Button>
                </div>
                <div className="space-y-1.5">
                  {plan.importantDocuments.map((doc, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-lg bg-muted/40 p-2.5">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="flex-1 text-sm">{doc}</span>
                      <button onClick={() => removeDoc(i)} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </StaggerItem>

          {/* Preferred organisations */}
          <StaggerItem>
            <Card className="h-full">
              <CardHeader>
                <SectionTitle title="Preferred Support Organisations" icon={HeartHandshake} subtitle="Organisations you trust" />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input value={newOrg} onChange={(e) => setNewOrg(e.target.value)} placeholder="e.g. POWA, LifeLine" onKeyDown={(e) => e.key === 'Enter' && addOrg()} />
                  <Button size="icon" onClick={addOrg}><Plus className="h-4 w-4" /></Button>
                </div>
                <div className="space-y-1.5">
                  {plan.preferredOrganisations.map((org, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-lg bg-muted/40 p-2.5">
                      <HeartHandshake className="h-4 w-4 text-muted-foreground" />
                      <span className="flex-1 text-sm">{org}</span>
                      <button onClick={() => removeOrg(i)} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </StaggerItem>

          {/* Safe locations */}
          <StaggerItem>
            <Card className="h-full">
              <CardHeader>
                <SectionTitle title="Safe Locations" icon={MapPin} subtitle="Places you feel safe" />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input value={newLocation} onChange={(e) => setNewLocation(e.target.value)} placeholder="e.g. Sister's home, police station" onKeyDown={(e) => e.key === 'Enter' && addLocation()} />
                  <Button size="icon" onClick={addLocation}><Plus className="h-4 w-4" /></Button>
                </div>
                <div className="space-y-1.5">
                  {plan.safeLocations.map((loc, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-lg bg-muted/40 p-2.5">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="flex-1 text-sm">{loc}</span>
                      <button onClick={() => removeLocation(i)} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
        </div>

        {/* Transport + Emergency Info */}
        <div className="grid gap-4 lg:grid-cols-2">
          <StaggerItem>
            <Card>
              <CardHeader>
                <SectionTitle title="Transport Arrangements" icon={Car} subtitle="Your safe travel preferences" />
              </CardHeader>
              <CardContent>
                <Textarea
                  value={plan.transportArrangements}
                  onChange={(e) => setPlan({ ...plan, transportArrangements: e.target.value })}
                  rows={4}
                  placeholder="e.g. Use verified Uber only. Share trip details with Thandiwe."
                />
              </CardContent>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card>
              <CardHeader>
                <SectionTitle title="Emergency Information" icon={Phone} subtitle="Critical info for emergencies" />
              </CardHeader>
              <CardContent>
                <Textarea
                  value={plan.emergencyInfo}
                  onChange={(e) => setPlan({ ...plan, emergencyInfo: e.target.value })}
                  rows={4}
                  placeholder="e.g. Allergies, medical aid details, blood type"
                />
              </CardContent>
            </Card>
          </StaggerItem>
        </div>

        {/* Private notes */}
        <StaggerItem>
          <Card>
            <CardHeader>
              <SectionTitle title="Private Notes" icon={StickyNote} subtitle="Encrypted personal notes" />
            </CardHeader>
            <CardContent>
              <Textarea
                value={plan.privateNotes}
                onChange={(e) => setPlan({ ...plan, privateNotes: e.target.value })}
                rows={4}
                placeholder="Any additional private notes for your safety planning..."
                className="resize-none"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Private notes are stored locally and are not displayed in previews or notifications.
              </p>
            </CardContent>
          </Card>
        </StaggerItem>
      </StaggerContainer>

      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your safety plan?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove all safety plan data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Plan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}
