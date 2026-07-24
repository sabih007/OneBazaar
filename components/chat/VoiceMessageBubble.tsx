"use client";

import { useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { cn, formatDuration } from "@/lib/utils";

export default function VoiceMessageBubble({
  src,
  durationMs,
  mine,
}: {
  src: string;
  durationMs: number;
  mine: boolean;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      audio.play();
    }
  }

  return (
    <div className="flex items-center gap-2.5">
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => setElapsedMs(e.currentTarget.currentTime * 1000)}
        onEnded={() => {
          setPlaying(false);
          setElapsedMs(0);
        }}
        className="hidden"
      />
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pause voice message" : "Play voice message"}
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          mine ? "bg-white/20 text-white" : "bg-primary-light text-primary-text"
        )}
      >
        {playing ? (
          <Pause className="h-3.5 w-3.5 fill-current" />
        ) : (
          <Play className="ml-0.5 h-3.5 w-3.5 fill-current" />
        )}
      </button>
      <span className="text-xs tabular-nums">
        {formatDuration(playing || elapsedMs > 0 ? elapsedMs : durationMs)}
      </span>
    </div>
  );
}
