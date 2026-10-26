'use client';

import * as React from 'react';
import {
  Mic, Square, Upload, Play, Pause, Trash2, CheckCircle2, Loader2, AlertCircle, FileAudio,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { SectionTitle } from '@/components/shared';
import { useFakeCallAudio } from '@/hooks/use-fake-call-audio';
import { useRecorder } from '@/hooks/use-recorder';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

function formatDuration(ms: number | null): string {
  if (!ms) return '—';
  const totalSeconds = Math.round(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function FakeCallAudioCard() {
  const { clips, activeClip, loading, error, uploadClip, setActive, removeClip, getPublicUrl } =
    useFakeCallAudio();
  const recorder = useRecorder();
  const { toast } = useToast();
  const [label, setLabel] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const previewRef = React.useRef<HTMLAudioElement | null>(null);
  const [playingId, setPlayingId] = React.useState<string | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('audio/')) {
      toast({ title: 'Please choose an audio file', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const saved = await uploadClip(file, label);
    setSaving(false);
    if (saved) {
      toast({ title: 'Audio clip uploaded', description: 'Tap "Use" to make it play on fake calls.' });
      setLabel('');
    } else {
      toast({ title: 'Upload failed', variant: 'destructive' });
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSaveRecording = async () => {
    if (!recorder.audioBlob) return;
    setSaving(true);
    const ext = recorder.audioBlob.type.includes('webm')
      ? 'webm'
      : recorder.audioBlob.type.includes('mp4')
        ? 'm4a'
        : 'ogg';
    const file = new File(
      [recorder.audioBlob],
      `recording-${Date.now()}.${ext}`,
      { type: recorder.audioBlob.type || 'audio/webm' }
    );
    const saved = await uploadClip(file, label);
    setSaving(false);
    if (saved) {
      toast({ title: 'Recording saved', description: 'Tap "Use" to make it play on fake calls.' });
      setLabel('');
      recorder.reset();
    } else {
      toast({ title: 'Could not save recording', variant: 'destructive' });
    }
  };

  const togglePreview = (id: string, url: string) => {
    if (previewRef.current) {
      previewRef.current.pause();
    }
    if (playingId === id) {
      setPlayingId(null);
      return;
    }
    const audio = new Audio(url);
    previewRef.current = audio;
    audio.onended = () => setPlayingId(null);
    audio.play().catch(() => setPlayingId(null));
    setPlayingId(id);
  };

  return (
    <Card>
      <CardHeader>
        <SectionTitle
          title="Fake Call Audio"
          icon={FileAudio}
          subtitle="Record or upload audio that plays when a fake call starts"
        />
      </CardHeader>
      <CardContent className="space-y-5">
        {error && (
          <div className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {activeClip && (
          <div className="flex items-center gap-2 rounded-xl bg-success/10 p-3 text-sm text-success">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>
              Active clip: <span className="font-semibold">{activeClip.label || 'Untitled'}</span>
            </span>
          </div>
        )}

        {/* Recording */}
        <div className="space-y-3 rounded-xl border border-border p-4">
          <Label className="text-sm font-semibold">Record a new clip</Label>
          <div className="flex items-center gap-3">
            {recorder.status !== 'recording' ? (
              <Button type="button" onClick={recorder.start} variant="outline" size="sm">
                <Mic className="mr-2 h-4 w-4" />
                Start recording
              </Button>
            ) : (
              <Button type="button" onClick={recorder.stop} variant="destructive" size="sm">
                <Square className="mr-2 h-4 w-4" />
                Stop ({recorder.seconds}s)
              </Button>
            )}
            {recorder.status === 'recording' && (
              <span className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="h-2 w-2 animate-pulse rounded-full bg-destructive" />
                Recording...
              </span>
            )}
          </div>
          {recorder.error && (
            <p className="text-xs text-destructive">{recorder.error}</p>
          )}
          {recorder.audioUrl && recorder.status === 'stopped' && (
            <div className="space-y-3">
              <audio src={recorder.audioUrl} controls className="w-full" />
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Label (optional)"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                />
                <Button type="button" onClick={handleSaveRecording} disabled={saving} size="sm">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                </Button>
                <Button type="button" onClick={recorder.reset} variant="ghost" size="sm">
                  Discard
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Upload */}
        <div className="space-y-3 rounded-xl border border-border p-4">
          <Label className="text-sm font-semibold">Upload a pre-recorded clip</Label>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Label (optional)"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={saving}
              onClick={() => fileInputRef.current?.click()}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Choose file
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={handleFile}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            MP3, WAV, M4A, OGG, or WebM. Keep clips short for a realistic ringtone.
          </p>
        </div>

        {/* Saved clips */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Saved clips</Label>
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading...
            </div>
          ) : clips.length === 0 ? (
            <p className="rounded-lg bg-muted/40 p-3 text-center text-xs text-muted-foreground">
              No clips yet. Record or upload one above.
            </p>
          ) : (
            <ul className="space-y-2">
              {clips.map((clip) => {
                const url = getPublicUrl(clip.storage_path);
                const isActive = clip.is_active;
                return (
                  <li
                    key={clip.id}
                    className={cn(
                      'flex items-center gap-3 rounded-xl border p-3',
                      isActive ? 'border-success/40 bg-success/5' : 'border-border'
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => togglePreview(clip.id, url)}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20"
                      aria-label={playingId === clip.id ? 'Pause' : 'Play'}
                    >
                      {playingId === clip.id ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {clip.label || 'Untitled clip'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDuration(clip.duration_ms)} • {clip.mime_type.split('/')[1]?.toUpperCase()}
                      </p>
                    </div>
                    {isActive ? (
                      <Badge className="border-success/30 bg-success/15 text-success">Active</Badge>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setActive(clip.id)}
                      >
                        Use
                      </Button>
                    )}
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => removeClip(clip.id)}
                      aria-label="Delete clip"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
