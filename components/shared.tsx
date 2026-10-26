'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function PageContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('mx-auto max-w-7xl space-y-6', className)}>
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h2>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
}

interface GradientCardProps extends React.HTMLAttributes<HTMLDivElement> {
  gradient?: 'primary' | 'secondary' | 'emergency';
  children: React.ReactNode;
}

export function GradientCard({
  gradient = 'primary',
  children,
  className,
  ...props
}: GradientCardProps) {
  const gradients = {
    primary: 'gradient-primary text-white',
    secondary: 'gradient-secondary text-foreground',
    emergency: 'gradient-emergency text-white',
  };
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-3xl p-6 shadow-lg',
        gradients[gradient],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function GlassCard({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('glass rounded-2xl p-5 shadow-sm', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function StaggerContainer({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.08, delayChildren: delay },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 16 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StatBadge({
  label,
  value,
  color = 'default',
}: {
  label: string;
  value: string;
  color?: 'default' | 'success' | 'warning' | 'destructive';
}) {
  const colors = {
    default: 'bg-muted text-foreground',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    destructive: 'bg-destructive/10 text-destructive',
  };
  return (
    <div className={cn('inline-flex flex-col items-center rounded-xl px-3 py-2', colors[color])}>
      <span className="text-lg font-bold leading-tight">{value}</span>
      <span className="text-[10px] uppercase tracking-wide opacity-80">{label}</span>
    </div>
  );
}

export function SectionTitle({
  title,
  subtitle,
  icon: Icon,
  action,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        {Icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary text-white">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <div>
          <h3 className="font-display text-lg font-semibold text-foreground">{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-12 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="font-display text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
