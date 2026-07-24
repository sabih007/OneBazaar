"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Mic, Square, X } from "lucide-react";
import { formatDuration } from "@/lib/utils";

const MAX_DURATION_MS = 2 * 60 * 1000;
const RECORDER_MIME_TYPES = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];

function pickMimeType(): string | undefined {
  return RECORDER_MIME_TYPES.find((type) => MediaRecorder.isTypeSupported(type));
}

type Status = "idle" | "recording" | "uploading";

export default function VoiceRecorder({
  onRecorded,
  onRecordingChange,
  disabled,
}: {
  onRecorded: (blob: Blob, durationMs: number) => void;
  onRecordingChange?: (recording: boolean) => void;
  disabled?: boolean;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [elapsedMs, setElapsedMs] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    onRecordingChange?.(status === "recording");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status === "recording"]);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const startedAtRef = useRef(0);
  const cancelledRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  function cleanup() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    recorderRef.current = null;
    chunksRef.current = [];
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  async function startRecording() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = pickMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

      streamRef.current = stream;
      recorderRef.current = recorder;
      chunksRef.current = [];
      cancelledRef.current = false;
      startedAtRef.current = Date.now();

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const durationMs = Date.now() - startedAtRef.current;
        const wasCancelled = cancelledRef.current;
        const blob = new Blob(chunksRef.current, { type: mimeType ?? "audio/webm" });
        cleanup();

        if (wasCancelled) {
          setStatus("idle");
          setElapsedMs(0);
          return;
        }

        setStatus("uploading");
        Promise.resolve(onRecorded(blob, durationMs)).finally(() => {
          setStatus("idle");
          setElapsedMs(0);
        });
      };

      recorder.start();
      setStatus("recording");
      setElapsedMs(0);

      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startedAtRef.current;
        setElapsedMs(elapsed);
        if (elapsed >= MAX_DURATION_MS) stopRecording();
      }, 200);
    } catch {
      setError("Microphone access was denied. Allow it in your browser settings to send voice messages.");
      cleanup();
      setStatus("idle");
    }
  }

  function stopRecording() {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
  }

  function cancelRecording() {
    cancelledRef.current = true;
    stopRecording();
  }

  if (status === "recording") {
    return (
      <div className="flex h-11 flex-1 items-center gap-2 rounded-md border border-line bg-surface px-3.5 text-sm">
        <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-danger" />
        <span className="flex-1 text-ink-muted">{formatDuration(elapsedMs)} recording…</span>
        <button
          type="button"
          onClick={cancelRecording}
          aria-label="Cancel recording"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-ink-muted hover:bg-background hover:text-danger"
        >
          <X className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={stopRecording}
          aria-label="Stop and send recording"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-white hover:bg-primary-hover"
        >
          <Square className="h-3 w-3 fill-current" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={startRecording}
        disabled={disabled || status === "uploading"}
        aria-label="Record a voice message"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-line bg-surface text-ink-muted transition-colors hover:border-primary hover:text-primary-text disabled:pointer-events-none disabled:opacity-50"
      >
        {status === "uploading" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Mic className="h-4 w-4" />
        )}
      </button>
      {error && (
        <p className="absolute bottom-full right-0 mb-1 w-48 text-right text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
