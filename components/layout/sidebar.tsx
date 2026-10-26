'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Navigation,
  MapPin,
  Users,
  HeartHandshake,
  Siren,
  Shield,
  Car,
  Watch,
  Bell,
  Settings,
  ChevronLeft,
} from 'lucide-react';
import { useApp } from '@/components/app-provider';
import type { NavKey } from '@/lib/types';
import { cn } from '@/lib/utils';

interface NavItem {
  key: NavKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  group: 'main' | 'safety' | 'support' | 'system';
}

const navItems: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'main' },
  { key: 'journey', label: 'Safe Journey', icon: Navigation, group: 'safety' },
  { key: 'location', label: 'Live Location Sharing', icon: MapPin, group: 'safety' },
  { key: 'contacts', label: 'Trusted Contacts', icon: Users, group: 'safety' },
  { key: 'check-in', label: 'Arrival & Check-in', icon: Shield, group: 'safety' },
  { key: 'emergency', label: 'Emergency Assistance', icon: Siren, group: 'safety' },
  { key: 'support', label: 'Get Support', icon: HeartHandshake, group: 'support' },
  { key: 'safety-plan', label: 'Safety Plan', icon: Shield, group: 'support' },
  { key: 'local-help', label: 'Local Help Directory', icon: MapPin, group: 'support' },
  { key: 'transport', label: 'Transport Verification', icon: Car, group: 'support' },
  { key: 'wearables', label: 'Wearable Integration', icon: Watch, group: 'support' },
  { key: 'activity', label: 'Activity & Notifications', icon: Bell, group: 'system' },
  { key: 'settings', label: 'Settings', icon: Settings, group: 'system' },
];

const groupLabels: Record<string, string> = {
  main: '',
  safety: 'Safe Journey',
  support: 'Get Support',
  system: 'System',
};

export function Sidebar({
  collapsed,
  onCollapsedChange,
}: {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}) {
  const { currentPage, navigate } = useApp();

  const groups = ['main', 'safety', 'support', 'system'] as const;

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-30 hidden h-screen flex-col border-r border-border bg-card/80 backdrop-blur-xl transition-all duration-300 lg:flex',
        collapsed ? 'w-20' : 'w-72'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-border px-5">
        <Link href="/" className="flex items-center gap-3 overflow-hidden">
          {collapsed ? (
            <TineweLogo className="h-9 w-9 shrink-0" />
          ) : (
            <img
              src="/Tinewe_Caring_Support_Logo.png"
              alt="Tinewe — With you, every step"
              className="h-11 w-full object-contain object-left"
            />
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-hide">
        {groups.map((group) => {
          const items = navItems.filter((i) => i.group === group);
          if (items.length === 0) return null;
          return (
            <div key={group} className="mb-4">
              {!collapsed && groupLabels[group] && (
                <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {groupLabels[group]}
                </p>
              )}
              <div className="space-y-1">
                {items.map((item) => {
                  const isActive = currentPage === item.key;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.key}
                      onClick={() => navigate(item.key)}
                      className={cn(
                        'group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                        isActive
                          ? 'text-primary-foreground'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="sidebar-active"
                          className="absolute inset-0 rounded-xl gradient-primary"
                          transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                        />
                      )}
                      <Icon className="relative z-10 h-5 w-5 shrink-0" />
                      {!collapsed && <span className="relative z-10 truncate">{item.label}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-border p-3">
        <button
          onClick={() => onCollapsedChange(!collapsed)}
          className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ChevronLeft
            className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')}
          />
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}

export function TineweLogo({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative flex items-center justify-center rounded-2xl gradient-primary shadow-lg',
        className
      )}
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-1/2 w-1/2 text-white">
        {/* Embracing figures symbol */}
        <path
          d="M12 3c-1.5 0-2.8.8-3.5 2-.4-.2-.8-.3-1.3-.3C5.6 4.7 4.5 6 4.5 7.5c0 .8.3 1.5.8 2-.8.5-1.3 1.4-1.3 2.4 0 1.5 1.1 2.8 2.7 3.1-.2.4-.3.8-.3 1.3 0 1.5 1.3 2.8 2.8 2.8.5 0 1-.1 1.4-.4.4.3.9.4 1.4.4s1-.1 1.4-.4c.4.3.9.4 1.4.4 1.5 0 2.8-1.3 2.8-2.8 0-.5-.1-.9-.3-1.3 1.6-.3 2.7-1.6 2.7-3.1 0-1-.5-1.9-1.3-2.4.5-.5.8-1.2.8-2 0-1.5-1.1-2.8-2.7-2.8-.5 0-.9.1-1.3.3-.7-1.2-2-2-3.5-2z"
          fill="currentColor"
          fillOpacity="0.2"
        />
        <circle cx="8" cy="8" r="1.5" fill="currentColor" />
        <circle cx="16" cy="8" r="1.5" fill="currentColor" />
        <path
          d="M7 14c0-2.5 2-4.5 5-4.5s5 2 5 4.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M9 18c0-1.5 1.5-3 3-3s3 1.5 3 3"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
