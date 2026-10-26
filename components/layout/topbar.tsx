'use client';

import * as React from 'react';
import {
  Moon,
  Sun,
  Bell,
  Wifi,
  WifiOff,
  Menu,
  ChevronDown,
  LogOut,
  User,
  Settings as SettingsIcon,
  Shield,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/components/app-provider';
import type { NavKey } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const pageTitles: Record<NavKey, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Your safety overview' },
  journey: { title: 'Safe Journey', subtitle: 'Plan and track your journey' },
  location: { title: 'Live Location Sharing', subtitle: 'Share your location with trusted contacts' },
  contacts: { title: 'Trusted Contacts', subtitle: 'Manage your safety network' },
  'check-in': { title: 'Arrival & Check-in', subtitle: 'Smart check-in workflow' },
  emergency: { title: 'Emergency Assistance', subtitle: 'SOS and emergency resources' },
  support: { title: 'Get Support', subtitle: 'Discreet support resources' },
  'safety-plan': { title: 'Safety Plan', subtitle: 'Your personal safety planning' },
  'local-help': { title: 'Local Help Directory', subtitle: 'Find verified support near you' },
  transport: { title: 'Transport Verification', subtitle: 'Verify and share trip details' },
  wearables: { title: 'Wearable Integration', subtitle: 'Connected safety devices' },
  activity: { title: 'Activity & Notifications', subtitle: 'Your safety activity log' },
  settings: { title: 'Settings', subtitle: 'Customise your Tinewe experience' },
  onboarding: { title: 'Welcome', subtitle: 'Getting started with Tinewe' },
  'fake-call': { title: 'Fake Call', subtitle: 'Simulated incoming call' },
};

export function TopBar({ onOpenMobileNav }: { onOpenMobileNav: () => void }) {
  const { currentPage, navigate, notifications, connectivity, contacts, markNotificationRead, clearNotifications } = useApp();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const page = pageTitles[currentPage] || pageTitles.dashboard;
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-border bg-card/60 px-4 backdrop-blur-xl sm:px-6 lg:px-10">
      {/* Mobile menu + page heading */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onOpenMobileNav}
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="font-display text-base font-bold text-foreground sm:text-lg">
            {page.title}
          </h1>
          <p className="hidden text-xs text-muted-foreground sm:block">{page.subtitle}</p>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Connectivity indicator */}
        <div
          className={cn(
            'hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors sm:flex',
            connectivity.online
              ? 'bg-success/10 text-success'
              : 'bg-destructive/10 text-destructive'
          )}
        >
          {connectivity.online ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
          {connectivity.online ? 'Online' : 'Offline'}
        </div>

        {/* Theme toggle */}
        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
            className="rounded-full"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
        )}

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative rounded-full" aria-label="Notifications">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                  {unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="flex items-center justify-between px-2 py-1.5">
              <span className="text-sm font-semibold">Notifications</span>
              {notifications.length > 0 && (
                <button
                  onClick={clearNotifications}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear all
                </button>
              )}
            </div>
            <DropdownMenuSeparator />
            {notifications.length === 0 ? (
              <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                No notifications
              </div>
            ) : (
              notifications.slice(0, 6).map((n) => (
                <DropdownMenuItem
                  key={n.id}
                  onClick={() => markNotificationRead(n.id)}
                  className="flex flex-col items-start gap-1 py-3"
                >
                  <div className="flex w-full items-center gap-2">
                    <div
                      className={cn(
                        'h-2 w-2 rounded-full',
                        n.type === 'emergency' && 'bg-destructive',
                        n.type === 'warning' && 'bg-warning',
                        n.type === 'success' && 'bg-success',
                        n.type === 'info' && 'bg-secondary'
                      )}
                    />
                    <span className="flex-1 text-sm font-medium">{n.title}</span>
                    {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                  </div>
                  <p className="pl-4 text-xs text-muted-foreground">{n.body}</p>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full border border-border p-1 pr-2 transition-colors hover:bg-muted">
              <div className="flex h-8 w-8 items-center justify-center rounded-full gradient-primary text-xs font-bold text-white">
                AM
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-xs font-semibold leading-tight text-foreground">Amahle M.</p>
                <p className="text-[10px] text-muted-foreground">Free plan</p>
              </div>
              <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground sm:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-semibold">Amahle Mahlangu</span>
                <span className="text-xs font-normal text-muted-foreground">amahle@tinewe.app</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('settings')}>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('settings')}>
              <SettingsIcon className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('contacts')}>
              <Shield className="mr-2 h-4 w-4" />
              Trusted contacts ({contacts.length})
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
