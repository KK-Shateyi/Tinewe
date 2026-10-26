'use client';

import * as React from 'react';
import { PhoneCall, Clock, User, Play, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { SectionTitle } from '@/components/shared';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useFakeCallConfig, initialsFromName, gradientFromName } from '@/hooks/use-fake-call-config';
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

export function FakeCallSetupCard() {
  const { config, save, loaded } = useFakeCallConfig();
  const [name, setName] = React.useState(config.callerName);
  const [delay, setDelay] = React.useState(String(config.delaySeconds));

  React.useEffect(() => {
    if (loaded) {
      setName(config.callerName);
      setDelay(String(config.delaySeconds));
    }
  }, [loaded, config.callerName, config.delaySeconds]);

  const handleSave = () => {
    const trimmed = name.trim() || 'Unknown Caller';
    const seconds = parseInt(delay, 10) || 0;
    save({ callerName: trimmed, delaySeconds: seconds });
  };

  return (
    <Card>
      <CardHeader>
        <SectionTitle
          title="Fake Call Setup"
          icon={PhoneCall}
          subtitle="Set a custom caller name and choose when the call rings"
        />
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Preview */}
        <div className="flex items-center gap-4 rounded-xl bg-muted/40 p-4">
          <div
            className={cn(
              'flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br text-lg font-bold text-white shadow-md',
              gradientFromName(name || 'Unknown')
            )}
          >
            {initialsFromName(name || 'Unknown')}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {name.trim() || 'Unknown Caller'}
            </p>
            <p className="text-xs text-muted-foreground">
              {delay === '0'
                ? 'Rings immediately when triggered'
                : `Rings after ${formatDelay(parseInt(delay, 10))}`}
            </p>
          </div>
        </div>

        {/* Caller name */}
        <div className="space-y-2">
          <Label htmlFor="caller-name" className="flex items-center gap-1.5 text-sm font-medium">
            <User className="h-3.5 w-3.5 text-muted-foreground" />
            Caller name
          </Label>
          <Input
            id="caller-name"
            placeholder="e.g. Dr. Naidoo, Mom, Work"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
          />
          <p className="text-xs text-muted-foreground">
            This name appears on the incoming call screen.
          </p>
        </div>

        {/* Delay */}
        <div className="space-y-2">
          <Label className="flex items-center gap-1.5 text-sm font-medium">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            Call delay
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
            The call will ring this long after you tap the Fake Call button.
          </p>
        </div>

        <Button onClick={handleSave} className="w-full">
          Save settings
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
