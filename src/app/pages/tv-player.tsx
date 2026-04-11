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
}

export function TVPlayer({ gameId, songs, montageYoutubeId }: TVPlayerProps) {
  const playerRef = useRef<HTMLVideoElement>(null);

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
  const overlayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Show overlay when activeSong changes
  useEffect(() => {
    if (!activeSong) {
      setShowOverlay(false);
      return;
    }

    setShowOverlay(true);
    setOverlayFading(false);

    if (overlayTimerRef.current) {
      clearTimeout(overlayTimerRef.current);
    }

    // Start fading out after 3 seconds
    overlayTimerRef.current = setTimeout(() => {
      setOverlayFading(true);
      // Remove after fade animation (1 second)
      overlayTimerRef.current = setTimeout(() => {
        setShowOverlay(false);
      }, 1000);
    }, 3000);

    return () => {
      if (overlayTimerRef.current) {
        clearTimeout(overlayTimerRef.current);
      }
    };
  }, [activeSong]);

  // Auto-play when a new song starts (song mode)
  useEffect(() => {
    if (!isMontageMode && currentSong?.youtubeId) {
      setPlaying(true);
    }
  }, [activeSong, isMontageMode, currentSong?.youtubeId]);

  // Respond to tvPlayback commands
  useEffect(() => {
    if (!tvPlayback) return;

    switch (tvPlayback.command) {
      case "play":
        setPlaying(true);
        break;
      case "pause":
        setPlaying(false);
        break;
      case "seek":
        if (tvPlayback.seekTo !== undefined && playerRef.current) {
          playerRef.current.currentTime = tvPlayback.seekTo;
        }
        break;
    }
  }, [tvPlayback]);

  // Handle timeupdate for progress reporting
  const handleTimeUpdate = useCallback(() => {
    const el = playerRef.current;
    if (!el || !el.duration) return;
    setTvProgress({
      playedFraction: el.currentTime / el.duration,
      playedSeconds: el.currentTime,
      loadedFraction: el.buffered.length > 0
        ? el.buffered.end(el.buffered.length - 1) / el.duration
        : 0,
    });
  }, [setTvProgress]);

  // Handle video end
  const handleEnded = useCallback(() => {
    if (isMontageMode) {
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
        ref={playerRef}
        src={videoUrl}
        playing={playing}
        controls={false}
        width="100%"
        height="100%"
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        config={{
          youtube: {
            rel: 0,
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
