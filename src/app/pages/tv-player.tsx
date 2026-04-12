"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import ReactPlayer from "react-player";
import { useSyncedState } from "rwsdk/use-synced-state/client";

interface TVSongInfo {
  country: string;
  youtubeId: string;
  flag: string;
  artist: string;
  song: string;
}

interface TVPlayback {
  command: "play" | "pause" | "seek";
  seekTo?: number;
}

interface TVProgress {
  playedFraction: number;
  playedSeconds: number;
  loadedFraction: number;
}

interface TVPlayerProps {
  gameId: string;
  songs: TVSongInfo[];
  montageYoutubeId: string;
  montageTimestamps: { startSec: number; country: string }[];
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

export function TVPlayer({ gameId, songs, montageYoutubeId, montageTimestamps }: TVPlayerProps) {
  const playerRef = useRef<HTMLVideoElement | null>(null);
  const lastMontageCountryRef = useRef<string | null>(null);

  // Synced state — read
  const [activeSong, setActiveSong] = useSyncedState<string | null>(
    null,
    "activeSong",
    gameId,
  );
  const [tvPlayback] = useSyncedState<TVPlayback | null>(
    null,
    "tvPlayback",
    gameId,
  );
  const [tvMode, setTvMode] = useSyncedState<"song" | "montage" | null>(
    null,
    "tvMode",
    gameId,
  );

  // Synced state — write
  const [, setTvProgress] = useSyncedState<TVProgress | null>(
    null,
    "tvProgress",
    gameId,
  );

  // Local state
  const [playing, setPlaying] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayFading, setOverlayFading] = useState(false);

  // Find the current song
  const currentSong = activeSong
    ? songs.find((s) => s.country === activeSong) ?? null
    : null;

  // Determine which video to play
  const isMontageMode = tvMode === "montage";
  const videoUrl = isMontageMode
    ? montageYoutubeId
      ? `https://www.youtube.com/watch?v=${montageYoutubeId}`
      : null
    : currentSong?.youtubeId
      ? `https://www.youtube.com/watch?v=${currentSong.youtubeId}`
      : null;

  // --- State adjustments during render ---
  // This follows React's documented "adjusting state when a prop changes"
  // pattern to avoid set-state-in-effect lint violations.

  // React to activeSong changes: reset overlay, auto-play in song mode
  const [prevActiveSong, setPrevActiveSong] = useState<string | null>(null);
  if (activeSong !== prevActiveSong) {
    setPrevActiveSong(activeSong);
    setOverlayFading(false);
    if (activeSong) {
      setShowOverlay(true);
      if (!isMontageMode) {
        setPlaying(true);
      }
    } else {
      setShowOverlay(false);
    }
  }

  // React to tvMode changes: auto-play when entering montage mode
  const [prevTvMode, setPrevTvMode] = useState<"song" | "montage" | null>(null);
  if (tvMode !== prevTvMode) {
    setPrevTvMode(tvMode);
    if (tvMode === "montage") {
      setPlaying(true);
    }
  }

  // React to tvPlayback play/pause commands
  const [prevPlayback, setPrevPlayback] = useState<TVPlayback | null>(null);
  if (tvPlayback !== prevPlayback) {
    setPrevPlayback(tvPlayback);
    if (tvPlayback?.command === "play") {
      setPlaying(true);
    } else if (tvPlayback?.command === "pause") {
      setPlaying(false);
    }
  }

  // --- Effects for external system interaction only ---

  // Overlay fade-out timer (browser timer = external system)
  useEffect(() => {
    if (!activeSong) return;

    const fadeTimer = setTimeout(() => {
      setOverlayFading(true);
    }, 3000);

    const hideTimer = setTimeout(() => {
      setShowOverlay(false);
    }, 4000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, [activeSong]);

  // Handle seek commands (needs DOM ref access, which is allowed in effects)
  useEffect(() => {
    if (
      tvPlayback?.command === "seek" &&
      tvPlayback.seekTo !== undefined &&
      playerRef.current
    ) {
      playerRef.current.currentTime = tvPlayback.seekTo;
    }
  }, [tvPlayback]);

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

  // Handle timeupdate for progress reporting and montage song tracking
  const handleTimeUpdate = useCallback(() => {
    const el = playerRef.current;
    if (!el || !el.duration) return;
    setTvProgress({
      playedFraction: el.currentTime / el.duration,
      playedSeconds: el.currentTime,
      loadedFraction:
        el.buffered.length > 0
          ? el.buffered.end(el.buffered.length - 1) / el.duration
          : 0,
    });

    // In montage mode, sync activeSong based on timestamps
    if (isMontageMode && montageTimestamps.length > 0) {
      const country = getCountryAtTime(el.currentTime, montageTimestamps);
      if (country !== lastMontageCountryRef.current) {
        lastMontageCountryRef.current = country;
        setActiveSong(country);
      }
    }
  }, [setTvProgress, isMontageMode, montageTimestamps, setActiveSong]);

  // Handle video end
  const handleEnded = useCallback(() => {
    if (isMontageMode) {
      lastMontageCountryRef.current = null;
      setActiveSong(null);
      setTvMode(null);
      setPlaying(false);
      return;
    }

    // Song mode: auto-advance to next song
    if (activeSong) {
      const currentIndex = songs.findIndex((s) => s.country === activeSong);
      if (currentIndex >= 0 && currentIndex < songs.length - 1) {
        setActiveSong(songs[currentIndex + 1].country);
      } else {
        setActiveSong(null);
      }
    }
  }, [isMontageMode, activeSong, songs, setActiveSong, setTvMode]);

  // Standby screen
  if (!videoUrl) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-gray-950">
        <h1 className="mb-4 text-2xl font-bold text-gray-500">
          ESC Voting — TV Display
        </h1>
        <p className="animate-pulse text-4xl">🎶</p>
        <p className="mt-4 text-lg text-gray-600">
          Waiting for the next song…
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen bg-black">
      {/* Video player */}
      <ReactPlayer
        ref={playerRefCallback}
        src={videoUrl}
        playing={playing}
        controls={false}
        width="100%"
        height="100%"
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        config={{
          youtube: {
            referrerpolicy: "strict-origin-when-cross-origin",
            origin: globalThis.location?.origin,
          },
        }}
      />

      {/* Song overlay */}
      {showOverlay && currentSong && (
        <div
          className={`pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-center pb-16 transition-opacity duration-1000 ${
            overlayFading ? "opacity-0" : "opacity-100"
          }`}
        >
          <div className="rounded-2xl bg-black/70 px-10 py-6 text-center backdrop-blur-sm">
            <p className="text-5xl">{currentSong.flag}</p>
            <p className="mt-2 text-3xl font-bold text-white">
              {currentSong.country}
            </p>
            <p className="mt-1 text-xl text-gray-300">
              {currentSong.artist} – {currentSong.song}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
