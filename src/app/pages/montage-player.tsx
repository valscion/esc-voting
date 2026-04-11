"use client";

import { useRef, useCallback, useEffect } from "react";
import ReactPlayer from "react-player";

interface MontagePlayerProps {
  youtubeId: string;
  timestamps: { startSec: number; country: string }[];
  onSongChange: (country: string | null) => void;
  onEnded: () => void;
}

/**
 * Given the current playback time in seconds, returns the country name
 * of the song currently playing in the montage video.
 */
function getCountryAtTime(
  seconds: number,
  timestamps: { startSec: number; country: string }[],
): string | null {
  let result: string | null = null;
  for (const entry of timestamps) {
    if (seconds >= entry.startSec) {
      result = entry.country;
    } else {
      break;
    }
  }
  return result;
}

export function MontagePlayer({
  youtubeId,
  timestamps,
  onSongChange,
  onEnded,
}: MontagePlayerProps) {
  const playerRef = useRef<HTMLVideoElement | null>(null);
  const lastCountryRef = useRef<string | null>(null);

  // youtube-video-element sets `config` as a property via useLayoutEffect AFTER
  // the first load() has already created the iframe without it. Using a callback
  // ref with a microtask ensures load() fires after layout effects have applied
  // the config (origin + referrerpolicy) to the element.
  const playerRefCallback = useCallback((el: HTMLVideoElement | null) => {
    playerRef.current = el;
    if (el) {
      Promise.resolve().then(() =>
        (el as HTMLVideoElement & { load?: () => void }).load?.(),
      );
    }
  }, []);

  const handleTimeUpdate = useCallback(() => {
    const el = playerRef.current;
    if (!el) return;
    const currentTime = el.currentTime;
    const country = getCountryAtTime(currentTime, timestamps);
    if (country !== lastCountryRef.current) {
      lastCountryRef.current = country;
      onSongChange(country);
    }
  }, [onSongChange, timestamps]);

  const handleEnded = useCallback(() => {
    lastCountryRef.current = null;
    onEnded();
  }, [onEnded]);

  // Reset tracking when the component unmounts
  useEffect(() => {
    return () => {
      lastCountryRef.current = null;
    };
  }, []);

  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-gray-700 bg-black">
      <ReactPlayer
        ref={playerRefCallback}
        src={`https://www.youtube.com/watch?v=${youtubeId}`}
        playing
        controls
        width="100%"
        height="auto"
        style={{ aspectRatio: "16/9" }}
        config={{ youtube: { referrerpolicy: "strict-origin-when-cross-origin", origin: globalThis.location?.origin } }}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />
    </div>
  );
}
