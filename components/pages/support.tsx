'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  HeartHandshake, MapPin, Shield, BookOpen, Car, Calculator,
  ArrowRight, Lock, Battery, Watch, Phone, Clock,
} from 'lucide-react';
import { useApp } from '@/components/app-provider';
import {
  PageContainer, PageHeader, GradientCard, StaggerContainer, StaggerItem,
} from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { NavKey } from '@/lib/types';

const supportCards: {
  key: NavKey;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
}[] = [
  {
    key: 'local-help',
    title: 'Find Local Help',
    description: 'Search verified clinics, shelters and support services near you',
    icon: MapPin,
    gradient: 'from-teal-500 to-emerald-500',
  },
  {
    key: 'safety-plan',
    title: 'My Safety Plan',
    description: 'Create and manage your personal safety planning',
    icon: Shield,
    gradient: 'from-blue-500 to-teal-500',
  },
  {
    key: 'emergency',
    title: 'Emergency Resources',
    description: 'SOS alerts and verified emergency contact directory',
    icon: Phone,
    gradient: 'from-red-500 to-rose-500',
  },
  {
    key: 'settings',
    title: 'Discreet Access',
    description: 'Calculator disguise mode with PIN protection',
    icon: Lock,
    gradient: 'from-teal-400 to-cyan-500',
  },
  {
    key: 'transport',
    title: 'Transport Verification',
    description: 'Verify and share trip details with trusted contacts',
    icon: Car,
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    key: 'wearables',
    title: 'Wearable Integration',
    description: 'Connect safety devices for check-ins and alerts',
    icon: Watch,
    gradient: 'from-blue-500 to-cyan-500',
  },
];

export function SupportPage() {
  const { navigate, discreetMode, setDiscreetMode } = useApp();

  return (
    <PageContainer>
      <StaggerContainer>
        <StaggerItem>
          <GradientCard gradient="primary" className="overflow-hidden">
            <div className="relative z-10 max-w-lg">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">
                <HeartHandshake className="h-3 w-3" />
                Get Support
              </div>
              <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">
                You are not alone.
              </h1>
              <p className="mt-2 text-sm text-white/80 sm:text-base">
                Discreet, professional support resources are available whenever you need them. Access help without disclosing personal circumstances.
              </p>
            </div>
          </GradientCard>
        </StaggerItem>

        {/* Support feature cards */}
        <StaggerItem>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {supportCards.map((card) => {
              const Icon = card.icon;
              return (
                <button
                  key={card.key}
                  onClick={() => navigate(card.key)}
                  className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-6 text-left transition-all hover:shadow-lg hover:-translate-y-0.5"
                >
                  <div className={cn('mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-sm transition-transform group-hover:scale-110', card.gradient)}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground">{card.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{card.description}</p>
                  <div className="mt-3 flex items-center text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    Open
                    <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </div>
                </button>
              );
            })}
          </div>
        </StaggerItem>

        {/* Quick info cards */}
        <div className="grid gap-4 lg:grid-cols-3">
          <StaggerItem>
            <Card className="h-full">
              <CardContent className="pt-6">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                  <Shield className="h-5 w-5" />
                </div>
                <h3 className="font-display text-base font-semibold">Privacy First</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your support activity is private. We do not require you to disclose personal circumstances to access general support information.
                </p>
              </CardContent>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card className="h-full">
              <CardContent className="pt-6">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <Clock className="h-5 w-5" />
                </div>
                <h3 className="font-display text-base font-semibold">24/7 Available</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Emergency resources and support services are available around the clock. Access the directory anytime, even offline with cached data.
                </p>
              </CardContent>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card className="h-full">
              <CardContent className="pt-6">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Lock className="h-5 w-5" />
                </div>
                <h3 className="font-display text-base font-semibold">Discreet Access</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Enable calculator disguise mode to access Tinewe discreetly. A PIN opens the protected interface.
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-3 px-0 text-primary"
                  onClick={() => setDiscreetMode(!discreetMode)}
                >
                  {discreetMode ? 'Disable disguise' : 'Enable disguise'}
                  <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </CardContent>
            </Card>
          </StaggerItem>
        </div>
      </StaggerContainer>
    </PageContainer>
  );
}
