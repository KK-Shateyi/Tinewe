'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, Mic, MicOff, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { playAlertTone } from '@/lib/sound';
import { supabase } from '@/lib/supabase';

interface FakeCallConfig {
  callerName: string;
  initials: string;
  avatarColor: string;
  delay: number;
  script: string;
}

interface FakeCallState extends FakeCallConfig {
  active: boolean;
  callPhase: 'scheduled' | 'incoming' | 'connected' | 'ended';
  countdown: number;
}

const FakeCallContext = React.createContext<{
  triggerCall: (config: FakeCallConfig) => void;
  cancelScheduled: () => void;
  scheduled: boolean;
  countdown: number;
} | null>(null);

export function useFakeCall() {
  const ctx = React.useContext(FakeCallContext);
  if (!ctx) throw new Error('useFakeCall must be used within FakeCallOverlay');
  return ctx;
}

const BUCKET = 'fake-call-audio';

async function fetchActiveClipUrl(): Promise<string | null> {
  const { data, error } = await supabase
    .from('fake_call_audio')
    .select('storage_path, is_active')
    .eq('is_active', true)
    .maybeSingle();
  if (error || !data) return null;
  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.storage_path);
  return urlData.publicUrl;
}

export function FakeCallOverlay({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<FakeCallState>({
    active: false,
    callerName: '',
    initials: '',
    avatarColor: 'from-teal-400 to-emerald-500',
    delay: 0,
    script: '',
    callPhase: 'incoming',
    countdown: 0,
  });
  const [callDuration, setCallDuration] = React.useState(0);
  const [muted, setMuted] = React.useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const scheduledConfigRef = React.useRef<FakeCallConfig | null>(null);

  const triggerCall = React.useCallback((config: FakeCallConfig) => {
    if (config.delay > 0) {
      setState({
        ...config,
        active: true,
        callPhase: 'scheduled',
        countdown: config.delay,
      });
      scheduledConfigRef.current = config;
      return;
    }
    fireCallNow(config);
  }, []);

  const fireCallNow = React.useCallback((config: FakeCallConfig) => {
    playAlertTone(660, 0.2, 2);
    setState({
      ...config,
      active: true,
      callPhase: 'incoming',
      countdown: 0,
    });
    void fetchActiveClipUrl().then((url) => {
      if (!url) return;
      const audio = new Audio(url);
      audio.loop = true;
      audioRef.current = audio;
    });
  }, []);

  const cancelScheduled = React.useCallback(() => {
    scheduledConfigRef.current = null;
    setState((s) => ({ ...s, active: false, callPhase: 'incoming', countdown: 0 }));
  }, []);

  // Countdown for scheduled calls
  React.useEffect(() => {
    if (state.callPhase !== 'scheduled') return;
    if (state.countdown <= 0) {
      const cfg = scheduledConfigRef.current;
      if (cfg) fireCallNow(cfg);
      return;
    }
    const timer = setTimeout(() => {
      setState((s) => ({ ...s, countdown: s.countdown - 1 }));
    }, 1000);
    return () => clearTimeout(timer);
  }, [state.callPhase, state.countdown, fireCallNow]);

  React.useEffect(() => {
    if (state.callPhase !== 'connected') return;
    const interval = setInterval(() => setCallDuration((d) => d + 1), 1000);
    return () => clearInterval(interval);
  }, [state.callPhase]);

  const acceptCall = () => {
    setState((s) => ({ ...s, callPhase: 'connected' }));
    setCallDuration(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  };

  const endCall = () => {
    setState((s) => ({ ...s, callPhase: 'ended' }));
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setTimeout(() => {
      setState((s) => ({ ...s, active: false }));
      setCallDuration(0);
    }, 1500);
  };

  const scheduled = state.callPhase === 'scheduled' && state.active;

  return (
    <FakeCallContext.Provider value={{ triggerCall, cancelScheduled, scheduled, countdown: state.countdown }}>
      {children}
      <AnimatePresence>
        {state.active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex flex-col items-center justify-between bg-gradient-to-b from-gray-900 via-gray-800 to-black p-6 text-white"
          >
            {/* Scheduled countdown screen */}
            {state.callPhase === 'scheduled' && (
              <div className="flex h-full w-full flex-col items-center justify-center gap-6">
                <div className="relative flex h-32 w-32 items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    className="absolute h-32 w-32 rounded-full border-4 border-white/15 border-t-white/80"
                  />
                  <span className="font-display text-4xl font-bold">{state.countdown}</span>
                </div>
                <div className="text-center">
                  <p className="text-sm text-white/60">Incoming call from</p>
                  <p className="font-display text-xl font-bold">{state.callerName}</p>
                  <p className="mt-1 text-xs text-white/40">in {state.countdown} second{state.countdown === 1 ? '' : 's'}</p>
                </div>
                <button
                  onClick={cancelScheduled}
                  className="flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-sm text-white/80 transition-colors hover:bg-white/20"
                >
                  <PhoneOff className="h-4 w-4" />
                  Cancel
                </button>
              </div>
            )}

            {/* Incoming / connected / ended */}
            {state.callPhase !== 'scheduled' && (
              <>
                {/* Status bar */}
                <div className="mt-8 flex flex-col items-center gap-1">
                  <p className="text-sm text-white/60">
                    {state.callPhase === 'incoming' && 'Incoming call...'}
                    {state.callPhase === 'connected' && 'Connected'}
                    {state.callPhase === 'ended' && 'Call ended'}
                  </p>
                  {state.callPhase === 'connected' && (
                    <p className="text-xs text-white/40">
                      {Math.floor(callDuration / 60)}:{String(callDuration % 60).padStart(2, '0')}
                    </p>
                  )}
                </div>

                {/* Caller info */}
                <div className="flex flex-col items-center gap-4">
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className={cn(
                      'flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br text-4xl font-bold shadow-2xl',
                      state.avatarColor
                    )}
                  >
                    {state.initials}
                  </motion.div>
                  <h2 className="font-display text-3xl font-bold">{state.callerName}</h2>
                  <p className="text-sm text-white/50">Mobile</p>

                  {state.callPhase === 'connected' && (
                    <div className="mt-2 flex gap-3">
                      <button
                        onClick={() => {
                          setMuted((m) => {
                            const next = !m;
                            if (audioRef.current) {
                              audioRef.current.muted = next;
                            }
                            return next;
                          });
                        }}
                        className={cn(
                          'flex h-12 w-12 items-center justify-center rounded-full transition-colors',
                          muted ? 'bg-white/20' : 'bg-white/10 hover:bg-white/20'
                        )}
                      >
                        {muted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                      </button>
                      <button className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 hover:bg-white/20">
                        <Volume2 className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Call controls */}
                <div className="mb-10 flex gap-6">
                  {state.callPhase === 'incoming' && (
                    <>
                      <button
                        onClick={endCall}
                        className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500 shadow-lg transition-transform hover:scale-105"
                      >
                        <PhoneOff className="h-7 w-7 text-white" />
                      </button>
                      <button
                        onClick={acceptCall}
                        className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500 shadow-lg transition-transform hover:scale-105"
                      >
                        <Phone className="h-7 w-7 text-white" />
                      </button>
                    </>
                  )}
                  {state.callPhase === 'connected' && (
                    <button
                      onClick={endCall}
                      className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500 shadow-lg transition-transform hover:scale-105"
                    >
                      <PhoneOff className="h-7 w-7 text-white" />
                    </button>
                  )}
                  {state.callPhase === 'ended' && (
                    <p className="text-sm text-white/40">Hanging up...</p>
                  )}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </FakeCallContext.Provider>
  );
}
