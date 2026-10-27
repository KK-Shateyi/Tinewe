'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Shield, ArrowRight, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type Mode = 'signin' | 'signup';

export function AuthPage() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = React.useState<Mode>('signin');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [fullName, setFullName] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    if (mode === 'signup') {
      const name = fullName.trim();
      if (!name) {
        setError('Please enter your name.');
        setSubmitting(false);
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        setSubmitting(false);
        return;
      }
    }

    const result =
      mode === 'signin'
        ? await signIn(email.trim(), password)
        : await signUp(email.trim(), password, fullName.trim());

    setSubmitting(false);

    if (result.error) {
      setError(humanizeAuthError(result.error));
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Ambient gradients */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gradient-to-br from-secondary/20 to-accent/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-br from-primary/15 to-secondary/15 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-primary/5 to-accent/5 blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-border bg-card/70 shadow-2xl backdrop-blur-xl lg:grid-cols-2">
          {/* Brand / value panel */}
          <div className="relative hidden flex-col justify-between overflow-hidden gradient-primary p-10 text-white lg:flex">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute -right-20 top-10 h-64 w-64 rounded-full bg-white/30 blur-3xl" />
              <div className="absolute -left-10 bottom-10 h-48 w-48 rounded-full bg-white/20 blur-2xl" />
            </div>

            <div className="relative">
              <img
                src="/Tinewe_Caring_Support_Logo.png"
                alt="Tinewe"
                className="h-14 w-auto object-contain"
              />
            </div>

            <div className="relative space-y-6">
              <Shield className="h-10 w-10 opacity-90" />
              <h2 className="font-display text-3xl font-bold leading-tight">
                With you,<br />every step.
              </h2>
              <p className="max-w-sm text-sm leading-relaxed text-white/80">
                Safe journey tracking, live location sharing, discreet support and
                emergency assistance — all in one private, secure app.
              </p>
              <ul className="space-y-2 text-sm text-white/85">
                {['Trusted contact network', 'Discreet calculator disguise', 'SOS & fake call tools'].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <p className="relative text-xs text-white/60">
              Privacy-first personal safety. Your data is encrypted and yours alone.
            </p>
          </div>

          {/* Form panel */}
          <div className="flex flex-col justify-center p-8 sm:p-10">
            {/* Mobile logo */}
            <div className="mb-8 flex items-center justify-center lg:hidden">
              <img
                src="/Tinewe_Caring_Support_Logo.png"
                alt="Tinewe"
                className="h-12 w-auto object-contain"
              />
            </div>

            <div className="mb-8">
              <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {mode === 'signin' ? 'Welcome back' : 'Create your account'}
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {mode === 'signin'
                  ? 'Sign in to access your safety dashboard.'
                  : 'Join Tinewe and start your safe journey today.'}
              </p>
            </div>

            {/* Mode toggle */}
            <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-muted/60 p-1">
              {(['signin', 'signup'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setMode(m);
                    setError(null);
                  }}
                  className={cn(
                    'relative rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                    mode === m
                      ? 'text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {mode === m && (
                    <motion.div
                      layoutId="auth-mode-pill"
                      className="absolute inset-0 rounded-lg gradient-primary"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10">
                    {m === 'signin' ? 'Sign in' : 'Sign up'}
                  </span>
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence initial={false} mode="popLayout">
                {mode === 'signup' && (
                  <motion.div
                    key="fullname"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-1.5 pb-4">
                      <Label htmlFor="fullName" className="flex items-center gap-1.5 text-sm font-medium">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        Full name
                      </Label>
                      <Input
                        id="fullName"
                        placeholder="Amahle Mahlangu"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        autoComplete="name"
                        disabled={submitting}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="flex items-center gap-1.5 text-sm font-medium">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  disabled={submitting}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="flex items-center gap-1.5 text-sm font-medium">
                  <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={mode === 'signup' ? 'At least 6 characters' : '••••••••'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                    required
                    disabled={submitting}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    disabled={submitting}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-0 top-0 flex h-full w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === 'signin' ? 'Sign in' : 'Create account'}
                {!submitting && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </form>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              By continuing you agree to keep your account secure. Your safety data
              is private and only visible to you.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function humanizeAuthError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes('invalid login credentials')) return 'Incorrect email or password.';
  if (m.includes('user already registered')) return 'An account with this email already exists. Try signing in.';
  if (m.includes('password should be at least')) return 'Password must be at least 6 characters.';
  if (m.includes('email')) return 'Please enter a valid email address.';
  if (m.includes('rate limit') || m.includes('too many')) return 'Too many attempts. Please wait a moment and try again.';
  if (m.includes('network') || m.includes('fetch')) return 'Network error. Check your connection and try again.';
  return msg;
}
