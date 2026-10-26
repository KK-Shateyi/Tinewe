'use client';

import * as React from 'react';
import { PhoneCall, Clock, User, ShieldAlert, Phone, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { SectionTitle } from '@/components/shared';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useFakeCallConfig, initialsFromName, gradientFromName, buildE164 } from '@/hooks/use-fake-call-config';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const DELAY_OPTIONS = [
  { label: 'Immediately', value: '0' },
  { label: '5 seconds', value: '5' },
  { label: '10 seconds', value: '10' },
  { label: '30 seconds', value: '30' },
  { label: '1 minute', value: '60' },
  { label: '5 minutes', value: '300' },
  { label: '10 minutes', value: '600' },
];

const COUNTRY_CODES = [
  { code: '+27', label: '🇿🇦 South Africa (+27)', country: 'South Africa' },
  { code: '+1', label: '🇺🇸 / 🇨🇦 USA / Canada (+1)', country: 'North America' },
  { code: '+44', label: '🇬🇧 United Kingdom (+44)', country: 'United Kingdom' },
  { code: '+263', label: '🇿🇼 Zimbabwe (+263)', country: 'Zimbabwe' },
  { code: '+254', label: '🇰🇪 Kenya (+254)', country: 'Kenya' },
  { code: '+234', label: '🇳🇬 Nigeria (+234)', country: 'Nigeria' },
  { code: '+267', label: '🇧🇼 Botswana (+267)', country: 'Botswana' },
  { code: '+264', label: '🇳🇦 Namibia (+264)', country: 'Namibia' },
  { code: 'custom', label: '🌐 Custom Area Code', country: 'Other' },
];

export function FakeCallSetupCard() {
  const { config, save, loaded } = useFakeCallConfig();
  const { toast } = useToast();

  const [name, setName] = React.useState(config.callerName);
  const [delay, setDelay] = React.useState(String(config.delaySeconds));
  const [selectedCode, setSelectedCode] = React.useState(config.countryCode || '+27');
  const [customCode, setCustomCode] = React.useState('');
  const [isCustom, setIsCustom] = React.useState(false);
  const [phoneNumber, setPhoneNumber] = React.useState(config.phoneNumber || '');
  const [savedSuccess, setSavedSuccess] = React.useState(false);

  React.useEffect(() => {
    if (loaded) {
      setName(config.callerName);
      setDelay(String(config.delaySeconds));
      const code = config.countryCode || '+27';
      const isPreset = COUNTRY_CODES.some((c) => c.code === code && c.code !== 'custom');
      if (isPreset) {
        setSelectedCode(code);
        setIsCustom(false);
      } else {
        setSelectedCode('custom');
        setCustomCode(code);
        setIsCustom(true);
      }
      setPhoneNumber(config.phoneNumber || '');
    }
  }, [loaded, config.callerName, config.delaySeconds, config.countryCode, config.phoneNumber]);

  const activeCountryCode = isCustom ? (customCode.startsWith('+') ? customCode : `+${customCode}`) : selectedCode;
  const computedE164 = buildE164(activeCountryCode, phoneNumber);

  const handleCountryCodeChange = (val: string) => {
    if (val === 'custom') {
      setIsCustom(true);
      if (!customCode) setCustomCode('+');
    } else {
      setIsCustom(false);
      setSelectedCode(val);
    }
  };

  const handleSave = () => {
    const trimmedName = name.trim() || 'Unknown Caller';
    const seconds = parseInt(delay, 10) || 0;
    const finalCode = isCustom
      ? (customCode.trim().startsWith('+') ? customCode.trim() : `+${customCode.trim() || '27'}`)
      : selectedCode;

    save({
      callerName: trimmedName,
      delaySeconds: seconds,
      countryCode: finalCode,
      phoneNumber: phoneNumber.trim(),
      fullEmergencyPhone: buildE164(finalCode, phoneNumber),
    });

    setSavedSuccess(true);
    toast({
      title: 'Settings Saved',
      description: computedE164
        ? `Linked emergency number ${computedE164} for ICE alerts & authorities dispatch.`
        : 'Fake call preferences saved successfully.',
    });
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader>
        <SectionTitle
          title="Fake Call & Emergency Dispatch Settings"
          icon={PhoneCall}
          subtitle="Configure simulation triggers, custom caller profile, and your verified emergency phone number"
        />
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Preview */}
        <div className="flex items-center gap-4 rounded-xl bg-muted/40 p-4 border border-border/40">
          <div
            className={cn(
              'flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-lg font-bold text-white shadow-md',
              gradientFromName(name || 'Unknown')
            )}
          >
            {initialsFromName(name || 'Unknown')}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {name.trim() || 'Unknown Caller'}
            </p>
            <p className="text-xs text-muted-foreground">
              {delay === '0'
                ? 'Rings immediately when triggered'
                : `Rings after ${formatDelay(parseInt(delay, 10))}`}
            </p>
            {computedE164 && (
              <p className="text-[11px] font-mono text-primary font-medium mt-1">
                Emergency ID: {computedE164}
              </p>
            )}
          </div>
        </div>

        {/* Caller Name */}
        <div className="space-y-2">
          <Label htmlFor="caller-name" className="flex items-center gap-1.5 text-sm font-medium">
            <User className="h-3.5 w-3.5 text-muted-foreground" />
            Caller Name
          </Label>
          <Input
            id="caller-name"
            placeholder="e.g. Dr. Naidoo, Mom, Work"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
          />
          <p className="text-xs text-muted-foreground">
            This name appears on the simulated incoming call screen.
          </p>
        </div>

        {/* Delay */}
        <div className="space-y-2">
          <Label className="flex items-center gap-1.5 text-sm font-medium">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            Call Delay
          </Label>
          <Select value={delay} onValueChange={setDelay}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DELAY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Delay duration before the fake call activates.
          </p>
        </div>

        <Separator />

        {/* Emergency Dispatch Phone Number Section */}
        <div className="space-y-4 rounded-xl bg-primary/5 p-4 border border-primary/20">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-primary" />
              <h4 className="text-sm font-semibold text-foreground">
                Emergency Callback & Dispatch Phone Number
              </h4>
            </div>
            <Badge variant="outline" className="border-primary/40 text-primary text-[10px]">
              Required for ICE & Authorities
            </Badge>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            Enter your mobile phone number. This number is used to identify you when alerting the
            authorities (Police SAPS 10111 / ER24) and is included in emergency SMS text messages sent to
            your In Case of Emergency (ICE) contacts with your live GPS location.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Country / Area Code */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground">
                Area / Country Code
              </Label>
              <Select value={isCustom ? 'custom' : selectedCode} onValueChange={handleCountryCodeChange}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRY_CODES.map((item) => (
                    <SelectItem key={item.code} value={item.code} className="text-xs">
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Custom Area Code Input if selected */}
            {isCustom && (
              <div className="space-y-1.5">
                <Label htmlFor="custom-code" className="text-xs font-medium text-foreground">
                  Custom Code (e.g. +27)
                </Label>
                <Input
                  id="custom-code"
                  placeholder="+27"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value)}
                  className="h-9 text-xs font-mono"
                  maxLength={6}
                />
              </div>
            )}

            {/* Mobile Phone Number */}
            <div className={cn('space-y-1.5', isCustom ? 'sm:col-span-1' : 'sm:col-span-2')}>
              <Label htmlFor="emergency-phone" className="text-xs font-medium text-foreground flex items-center gap-1">
                <Phone className="h-3 w-3 text-muted-foreground" />
                Phone Number
              </Label>
              <Input
                id="emergency-phone"
                type="tel"
                placeholder="e.g. 082 123 4567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="h-9 text-xs font-mono"
              />
            </div>
          </div>

          {/* Verification Badge */}
          {computedE164 ? (
            <div className="flex items-center gap-2 rounded-lg bg-success/10 border border-success/30 px-3 py-2 text-xs text-success">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
              <span>
                Verified International Format: <strong className="font-mono">{computedE164}</strong>
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-lg bg-warning/10 border border-warning/30 px-3 py-2 text-xs text-warning">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Please enter your phone number to enable live text alerts and authority calling.</span>
            </div>
          )}
        </div>

        <Button onClick={handleSave} className="w-full flex items-center justify-center gap-2">
          {savedSuccess && <CheckCircle2 className="h-4 w-4" />}
          {savedSuccess ? 'Settings Saved' : 'Save Fake Call & Phone Settings'}
        </Button>
      </CardContent>
    </Card>
  );
}

function formatDelay(seconds: number): string {
  if (seconds < 60) return `${seconds} seconds`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (secs === 0) return `${mins} minute${mins > 1 ? 's' : ''}`;
  return `${mins}m ${secs}s`;
}
