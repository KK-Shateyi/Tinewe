'use client';

import * as React from 'react';
import { LockKeyhole, ShieldCheck } from 'lucide-react';
import { useApp } from '@/components/app-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function DiscreetModeGuard({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { discreetPin, pinEnabled, setDiscreetPin, setPinEnabled, setDiscreetMode, navigate } = useApp();
  const [step, setStep] = React.useState<'setup' | 'confirm'>('setup');
  const [firstPin, setFirstPin] = React.useState('');
  const [confirmPin, setConfirmPin] = React.useState('');
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    if (!open) {
      setStep('setup');
      setFirstPin('');
      setConfirmPin('');
      setError('');
    }
  }, [open]);

  if (!open) return null;

  const requiresSetup = !pinEnabled || !discreetPin;

  const confirmSetup = () => {
    if (firstPin.length < 4) {
      setError('PIN must be at least 4 digits.');
      return;
    }
    if (firstPin !== confirmPin) {
      setError('PINs do not match. Please try again.');
      return;
    }
    setDiscreetPin(firstPin);
    setPinEnabled(true);
    setError('');
    onOpenChange(false);
    setDiscreetMode(true);
  };

  const enterDiscreet = () => {
    onOpenChange(false);
    setDiscreetMode(true);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl bg-card p-6 shadow-2xl">
        {requiresSetup ? (
          <>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h1 className="font-semibold text-foreground">Set up discreet access</h1>
                <p className="text-xs text-muted-foreground">A PIN is required to leave disguise mode.</p>
              </div>
            </div>

            {step === 'setup' ? (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="first-pin">Create a PIN (4–6 digits)</Label>
                  <Input
                    id="first-pin"
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    autoFocus
                    value={firstPin}
                    onChange={(e) => {
                      setFirstPin(e.target.value.replace(/\D/g, '').slice(0, 6));
                      setError('');
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && firstPin.length >= 4 && setStep('confirm')}
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button
                  className="w-full"
                  disabled={firstPin.length < 4}
                  onClick={() => setStep('confirm')}
                >
                  Continue
                </Button>
                <Button variant="ghost" className="w-full" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="confirm-pin">Confirm your PIN</Label>
                  <Input
                    id="confirm-pin"
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    autoFocus
                    value={confirmPin}
                    onChange={(e) => {
                      setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6));
                      setError('');
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && confirmSetup()}
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button className="w-full" onClick={confirmSetup}>
                  Save PIN & enter discreet mode
                </Button>
                <Button variant="ghost" className="w-full" onClick={() => setStep('setup')}>
                  Back
                </Button>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <LockKeyhole className="h-5 w-5" />
              </div>
              <div>
                <h1 className="font-semibold text-foreground">Enter discreet mode?</h1>
                <p className="text-xs text-muted-foreground">
                  The app will hide as a calculator. Enter your PIN and press = to return.
                </p>
              </div>
            </div>
            <p className="mb-4 rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground">
              Your PIN is already set. You can change it anytime in Settings.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={enterDiscreet}>
                Enter Discreet Mode
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
