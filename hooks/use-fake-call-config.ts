'use client';

import * as React from 'react';

export interface FakeCallConfig {
  callerName: string;
  delaySeconds: number;
  countryCode: string;
  phoneNumber: string;
  fullEmergencyPhone: string;
}

const STORAGE_KEY = 'tinewe-fake-call-config';
const DEFAULT_CONFIG: FakeCallConfig = {
  callerName: 'Dr. Naidoo',
  delaySeconds: 0,
  countryCode: '+27',
  phoneNumber: '',
  fullEmergencyPhone: '',
};

export function buildE164(code: string, phone: string): string {
  const cleanCode = code.trim().startsWith('+') ? code.trim() : `+${code.trim()}`;
  let cleanNumber = phone.replace(/[^\d]/g, '');
  if (cleanNumber.startsWith('0')) {
    cleanNumber = cleanNumber.slice(1);
  }
  if (!cleanNumber) return '';
  return `${cleanCode}${cleanNumber}`;
}

export function useFakeCallConfig() {
  const [config, setConfig] = React.useState<FakeCallConfig>(DEFAULT_CONFIG);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<FakeCallConfig>;
        const code = parsed.countryCode?.trim() || DEFAULT_CONFIG.countryCode;
        const num = parsed.phoneNumber?.trim() || '';
        const full = buildE164(code, num);

        setConfig({
          callerName: parsed.callerName?.trim() || DEFAULT_CONFIG.callerName,
          delaySeconds:
            typeof parsed.delaySeconds === 'number' && parsed.delaySeconds >= 0
              ? parsed.delaySeconds
              : DEFAULT_CONFIG.delaySeconds,
          countryCode: code,
          phoneNumber: num,
          fullEmergencyPhone: full,
        });
      }
    } catch {
      // ignore corrupt storage
    }
    setLoaded(true);
  }, []);

  const save = React.useCallback((next: FakeCallConfig) => {
    const full = buildE164(next.countryCode, next.phoneNumber);
    const updated = { ...next, fullEmergencyPhone: full };
    setConfig(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // storage may be unavailable; state still updates in-memory
    }
  }, []);

  return { config, save, loaded };
}

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const AVATAR_GRADIENTS = [
  'from-teal-400 to-blue-500',
  'from-emerald-400 to-teal-500',
  'from-blue-400 to-indigo-500',
  'from-rose-400 to-pink-500',
  'from-amber-400 to-orange-500',
  'from-violet-400 to-purple-500',
];

export function gradientFromName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}
