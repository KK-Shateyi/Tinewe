'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/components/app-provider';
import { Sidebar } from '@/components/layout/sidebar';
import { TopBar } from '@/components/layout/topbar';
import { MobileNav } from '@/components/layout/mobile-nav';
import { SOSOverlay } from '@/components/features/sos-overlay';
import { FakeCallOverlay } from '@/components/features/fake-call-overlay';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { currentPage, sos } = useApp();
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  return (
    <FakeCallOverlay>
      <div className="min-h-screen bg-background theme-transition">
        {/* Ambient gradient background */}
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gradient-to-br from-secondary/10 to-accent/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 blur-3xl" />
        </div>

        <div className="relative z-10 flex">
          <Sidebar collapsed={sidebarCollapsed} onCollapsedChange={setSidebarCollapsed} />
          <div
            className={`flex min-h-screen min-w-0 flex-1 flex-col transition-[margin] duration-300 ${
              sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'
            }`}
          >
            <TopBar onOpenMobileNav={() => setMobileNavOpen(true)} />
            <main className="flex-1 px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:pb-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPage}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </main>
          </div>
        </div>

        <MobileNav open={mobileNavOpen} onOpenChange={setMobileNavOpen} />

        <AnimatePresence>{sos.activated && <SOSOverlay />}</AnimatePresence>
      </div>
    </FakeCallOverlay>
  );
}
