'use client';

import * as React from 'react';
import { supabase } from '@/lib/supabase';

export interface FakeCallAudio {
  id: string;
  label: string | null;
  storage_path: string;
  mime_type: string;
  duration_ms: number | null;
  is_active: boolean;
  created_at: string;
}

const BUCKET = 'fake-call-audio';

/**
 * Manages fake-call audio clips stored in Supabase. The clip flagged `is_active`
 * is the one played when the fake call is triggered.
 */
export function useFakeCallAudio() {
  const [clips, setClips] = React.useState<FakeCallAudio[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: queryError } = await supabase
      .from('fake_call_audio')
      .select('id, label, storage_path, mime_type, duration_ms, is_active, created_at')
      .order('created_at', { ascending: false });
    if (queryError) {
      setError(queryError.message);
    } else {
      setClips((data ?? []) as FakeCallAudio[]);
    }
    setLoading(false);
  }, []);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  const uploadClip = React.useCallback(
    async (file: File, label?: string): Promise<FakeCallAudio | null> => {
      setError(null);
      const ext = file.name.split('.').pop()?.toLowerCase() ?? 'audio';
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;
      const { error: upError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { contentType: file.type || 'audio/mpeg' });
      if (upError) {
        setError(upError.message);
        return null;
      }
      const durationMs = await estimateDurationMs(file).catch(() => null);
      const { data, error: insertError } = await supabase
        .from('fake_call_audio')
        .insert({
          label: label?.trim() || null,
          storage_path: path,
          mime_type: file.type || 'audio/mpeg',
          duration_ms: durationMs,
        })
        .select('id, label, storage_path, mime_type, duration_ms, is_active, created_at')
        .maybeSingle();
      if (insertError || !data) {
        setError(insertError?.message ?? 'Failed to save clip metadata.');
        return null;
      }
      await refresh();
      return data as FakeCallAudio;
    },
    [refresh]
  );

  const setActive = React.useCallback(
    async (id: string) => {
      setError(null);
      // Clear other rows, then set the chosen one. The unique partial index
      // guarantees a single active clip even under a race.
      await supabase.from('fake_call_audio').update({ is_active: false }).neq('id', id);
      const { error: updError } = await supabase
        .from('fake_call_audio')
        .update({ is_active: true })
        .eq('id', id);
      if (updError) {
        setError(updError.message);
        return;
      }
      void refresh();
    },
    [refresh]
  );

  const removeClip = React.useCallback(
    async (id: string) => {
      setError(null);
      const clip = clips.find((c) => c.id === id);
      if (clip) {
        await supabase.storage.from(BUCKET).remove([clip.storage_path]);
      }
      const { error: delError } = await supabase.from('fake_call_audio').delete().eq('id', id);
      if (delError) {
        setError(delError.message);
        return;
      }
      void refresh();
    },
    [clips, refresh]
  );

  const activeClip = React.useMemo(() => clips.find((c) => c.is_active) ?? null, [clips]);

  const getPublicUrl = React.useCallback((path: string) => {
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl;
  }, []);

  return {
    clips,
    activeClip,
    loading,
    error,
    refresh,
    uploadClip,
    setActive,
    removeClip,
    getPublicUrl,
  };
}

async function estimateDurationMs(file: File): Promise<number | null> {
  if (typeof window === 'undefined' || !window.Audio) return null;
  const url = URL.createObjectURL(file);
  try {
    const audio = new Audio();
    audio.src = url;
    await new Promise<void>((resolve, reject) => {
      audio.onloadedmetadata = () => resolve();
      audio.onerror = () => reject(new Error('metadata failed'));
      setTimeout(() => resolve(), 1500);
    });
    return Number.isFinite(audio.duration) && audio.duration > 0
      ? Math.round(audio.duration * 1000)
      : null;
  } finally {
    URL.revokeObjectURL(url);
  }
}
