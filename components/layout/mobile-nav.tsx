'use client';

import * as React from 'react';
import { Home, Navigation, Siren, HeartHandshake, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/components/app-provider';
import type { NavKey } from '@/lib/types';
import { cn } from '@/lib/utils';

const bottomNavItems: { key: NavKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'dashboard', label: 'Home', icon: Home },
  { key: 'journey', label: 'Journey', icon: Navigation },
  { key: 'emergency', label: 'SOS', icon: Siren },
  { key: 'support', label: 'Support', icon: HeartHandshake },
  { key: 'settings', label: 'Profile', icon: User },
];

export function MobileNav({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { currentPage, navigate, contacts } = useApp();

  return (
    <>
      {/* Mobile slide-out menu */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => onOpenChange(false)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 z-50 flex h-screen w-72 flex-col border-r border-border bg-card lg:hidden"
            >
              <div className="flex h-16 shrink-0 items-center border-b border-border px-5">
                <img
                  src="/Tinewe_Caring_Support_Logo.png"
                  alt="Tinewe — With you, every step"
                  className="h-11 w-full object-contain object-left"
                />
              </div>
              <nav className="flex flex-col gap-1 overflow-y-auto overscroll-contain p-4">
                {bottomNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.key}
                      onClick={() => {
                        navigate(item.key);
                        onOpenChange(false);
                      }}
                      className={cn(
                        'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                        currentPage === item.key
                          ? 'gradient-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-muted'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </button>
                  );
                })}
                <div className="my-2 h-px bg-border" />
                {[
                  { key: 'location' as NavKey, label: 'Live Location' },
                  { key: 'contacts' as NavKey, label: `Trusted Contacts (${contacts.length})` },
                  { key: 'check-in' as NavKey, label: 'Arrival & Check-in' },
                  { key: 'safety-plan' as NavKey, label: 'Safety Plan' },
                  { key: 'local-help' as NavKey, label: 'Local Help' },
                  { key: 'transport' as NavKey, label: 'Transport Verification' },
                  { key: 'wearables' as NavKey, label: 'Wearables' },
                  { key: 'activity' as NavKey, label: 'Activity' },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => {
                      navigate(item.key);
                      onOpenChange(false);
                    }}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                      currentPage === item.key
                        ? 'gradient-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted'
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom navigation bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-card/90 backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-around px-2 py-2">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.key;
            const isSOS = item.key === 'emergency';

            if (isSOS) {
              return (
                <button
                  key={item.key}
                  onClick={() => navigate(item.key)}
                  className="relative -mt-6 flex flex-col items-center gap-1"
                  aria-label="Emergency SOS"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full gradient-emergency shadow-lg shadow-destructive/30 ring-4 ring-background">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-[10px] font-semibold text-destructive">SOS</span>
                </button>
              );
            }

            return (
              <button
                key={item.key}
                onClick={() => navigate(item.key)}
                className="flex flex-1 flex-col items-center gap-1 py-1"
                aria-label={item.label}
              >
                <Icon
                  className={cn(
                    'h-5 w-5 transition-colors',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )}
                />
                <span
                  className={cn(
                    'text-[10px] font-medium transition-colors',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
