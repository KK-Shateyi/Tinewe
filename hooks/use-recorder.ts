'use client';

import * as React from 'react';

type Status = 'idle' | 'recording' | 'stopped' | 'error';

interface RecorderState {
  status: Status;
  seconds: number;
  error: string | null;
  audioBlob: Blob | null;
  audioUrl: string | null;
}

interface UseRecorderResult extends RecorderState {
  start: () => Promise<void>;
  stop: () => void;
  reset: () => void;
}

export function useRecorder(): UseRecorderResult {
  const [status, setStatus] = React.useState<Status>('idle');
  const [seconds, setSeconds] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const [audioBlob, setAudioBlob] = React.useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = React.useState<string | null>(null);

  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const chunksRef = React.useRef<Blob[]>([]);
  const streamRef = React.useRef<MediaStream | null>(null);
  const timerRef = React.useRef<number | null>(null);

  const clearTimer = () => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const stop = React.useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    clearTimer();
  }, []);

  const reset = React.useCallback(() => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setSeconds(0);
    setError(null);
    setStatus('idle');
  }, [audioUrl]);

  const start = React.useCallback(async () => {
    setError(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
      setAudioBlob(null);
    }
    setSeconds(0);
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setError('Microphone recording is not supported in this browser.');
      setStatus('error');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = pickMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: mimeType || 'audio/webm',
        });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        setStatus('stopped');
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setStatus('recording');
      timerRef.current = window.setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not access microphone.';
      setError(message);
      setStatus('error');
    }
  }, [audioUrl]);

  React.useEffect(() => {
    return () => {
      clearTimer();
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { status, seconds, error, audioBlob, audioUrl, start, stop, reset };
}

function pickMimeType(): string | undefined {
  if (typeof window === 'undefined' || !window.MediaRecorder) return undefined;
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'];
  for (const type of candidates) {
    if (window.MediaRecorder.isTypeSupported(type)) return type;
  }
  return undefined;
}
