'use client';

import * as React from 'react';
import { useAuth } from '@/components/auth-provider';
import { AuthPage } from '@/components/pages/auth';
import { useApp } from '@/components/app-provider';
import { AppShell } from '@/components/layout/app-shell';
import { DashboardPage } from '@/components/pages/dashboard';
import { JourneyPage } from '@/components/pages/journey';
import { LocationPage } from '@/components/pages/location';
import { ContactsPage } from '@/components/pages/contacts';
import { CheckInPage } from '@/components/pages/check-in';
import { EmergencyPage } from '@/components/pages/emergency';
import { SupportPage } from '@/components/pages/support';
import { SafetyPlanPage } from '@/components/pages/safety-plan';
import { LocalHelpPage } from '@/components/pages/local-help';
import { TransportPage } from '@/components/pages/transport';
import { WearablesPage } from '@/components/pages/wearables';
import { ActivityPage } from '@/components/pages/activity';
import { SettingsPage } from '@/components/pages/settings';
import { CalculatorDisguise } from '@/components/pages/calculator-disguise';

function FullScreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <img
          src="/Tinewe_Caring_Support_Logo.png"
          alt="Tinewe"
          className="h-12 w-auto object-contain"
        />
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
      </div>
    </div>
  );
}

export default function Home() {
  const { session, loading } = useAuth();
  const { currentPage, discreetMode } = useApp();

  if (loading) return <FullScreenLoader />;
  if (!session) return <AuthPage />;
  if (discreetMode) return <CalculatorDisguise />;

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'journey':
        return <JourneyPage />;
      case 'location':
        return <LocationPage />;
      case 'contacts':
        return <ContactsPage />;
      case 'check-in':
        return <CheckInPage />;
      case 'emergency':
        return <EmergencyPage />;
      case 'support':
        return <SupportPage />;
      case 'safety-plan':
        return <SafetyPlanPage />;
      case 'local-help':
        return <LocalHelpPage />;
      case 'transport':
        return <TransportPage />;
      case 'wearables':
        return <WearablesPage />;
      case 'activity':
        return <ActivityPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return <AppShell>{renderPage()}</AppShell>;
}
