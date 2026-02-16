"use client";

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import type { Song, SetlistItem } from "@/lib/api";
import { extractVideoId, extractSpotifyTrackId } from "@/lib/youtube-utils";

// ============================================================================
// Types
// ============================================================================

export interface PlayableItem {
  setlistItemId: string;
  song: Song;
  source: "youtube" | "spotify";
  videoId?: string;
  spotifyTrackId?: string;
}

export interface SourceContext {
  type: "event" | "concert" | "rehearsal";
  id: string;
  name: string;
}

export interface PlayerState {
  queue: PlayableItem[];
  currentIndex: number;
  status: "idle" | "loading" | "playing" | "paused" | "ended";
  currentTimeMs: number;
  durationMs: number;
  isExpanded: boolean;
  isVisible: boolean;
  sourceContext: SourceContext | null;
  seekTarget: number | null;
}

// ============================================================================
// Actions
// ============================================================================

type PlayerAction =
  | {
      type: "LOAD_SETLIST";
      payload: {
        items: SetlistItem[];
        context: SourceContext;
        startIndex?: number;
      };
    }
  | { type: "PLAY" }
  | { type: "PAUSE" }
  | { type: "NEXT" }
  | { type: "PREVIOUS" }
  | { type: "SEEK"; payload: number }
  | {
      type: "UPDATE_TIME";
      payload: { currentTimeMs: number; durationMs: number };
    }
  | { type: "SET_STATUS"; payload: PlayerState["status"] }
  | { type: "TOGGLE_EXPANDED" }
  | { type: "CLOSE" }
  | { type: "JUMP_TO"; payload: number };

// ============================================================================
// Initial State
// ============================================================================

const initialState: PlayerState = {
  queue: [],
  currentIndex: -1,
  status: "idle",
  currentTimeMs: 0,
  durationMs: 0,
  isExpanded: false,
  isVisible: false,
  sourceContext: null,
  seekTarget: null,
};

// ============================================================================
// Helpers
// ============================================================================

function buildQueue(items: SetlistItem[]): PlayableItem[] {
  return items
    .filter((item) => item.itemType === "song" && item.song)
    .map((item) => {
      const song = item.song!;
      let source: "youtube" | "spotify" | null = null;
      let videoId: string | undefined;
      let spotifyId: string | undefined;

      if (song.youtubeUrl) {
        videoId = extractVideoId(song.youtubeUrl) ?? undefined;
        if (videoId) source = "youtube";
      }

      if (!source && song.spotifyUrl) {
        spotifyId = extractSpotifyTrackId(song.spotifyUrl) ?? undefined;
        if (spotifyId) source = "spotify";
      }

      if (!source) return null;

      return {
        setlistItemId: item.id,
        song,
        source,
        videoId,
        spotifyTrackId: spotifyId,
      } as PlayableItem;
    })
    .filter((item): item is PlayableItem => item !== null);
}

// ============================================================================
// Reducer
// ============================================================================

function playerReducer(state: PlayerState, action: PlayerAction): PlayerState {
  switch (action.type) {
    case "LOAD_SETLIST": {
      const queue = buildQueue(action.payload.items);
      if (queue.length === 0) return state;
      const startIndex = action.payload.startIndex ?? 0;
      return {
        ...state,
        queue,
        currentIndex: Math.min(startIndex, queue.length - 1),
        status: "loading",
        currentTimeMs: 0,
        durationMs: 0,
        isVisible: true,
        isExpanded: false,
        sourceContext: action.payload.context,
      };
    }

    case "PLAY":
      if (state.status === "ended" && state.queue.length > 0) {
        return { ...state, currentIndex: 0, status: "loading", currentTimeMs: 0, durationMs: 0 };
      }
      return state.queue.length > 0
        ? { ...state, status: "playing" }
        : state;

    case "PAUSE":
      return state.status === "playing"
        ? { ...state, status: "paused" }
        : state;

    case "NEXT": {
      if (state.currentIndex >= state.queue.length - 1) {
        return { ...state, status: "ended", currentTimeMs: 0 };
      }
      return {
        ...state,
        currentIndex: state.currentIndex + 1,
        status: "loading",
        currentTimeMs: 0,
        durationMs: 0,
      };
    }

    case "PREVIOUS": {
      // If more than 3 seconds in, restart current song
      if (state.currentTimeMs > 3000) {
        return { ...state, currentTimeMs: 0 };
      }
      if (state.currentIndex <= 0) {
        return { ...state, currentTimeMs: 0 };
      }
      return {
        ...state,
        currentIndex: state.currentIndex - 1,
        status: "loading",
        currentTimeMs: 0,
        durationMs: 0,
      };
    }

    case "SEEK":
      return { ...state, currentTimeMs: action.payload, seekTarget: action.payload };

    case "UPDATE_TIME":
      return {
        ...state,
        currentTimeMs: action.payload.currentTimeMs,
        durationMs: action.payload.durationMs,
        seekTarget: null,
      };

    case "SET_STATUS":
      return { ...state, status: action.payload };

    case "TOGGLE_EXPANDED":
      return { ...state, isExpanded: !state.isExpanded };

    case "CLOSE":
      return {
        ...initialState,
      };

    case "JUMP_TO": {
      const idx = action.payload;
      if (idx < 0 || idx >= state.queue.length) return state;
      return {
        ...state,
        currentIndex: idx,
        status: "loading",
        currentTimeMs: 0,
        durationMs: 0,
      };
    }

    default:
      return state;
  }
}

// ============================================================================
// Context
// ============================================================================

interface PlayerContextValue {
  state: PlayerState;
  dispatch: React.Dispatch<PlayerAction>;
  // Convenience actions
  playSetlist: (
    items: SetlistItem[],
    context: SourceContext,
    startIndex?: number
  ) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  next: () => void;
  previous: () => void;
  seek: (ms: number) => void;
  toggleExpanded: () => void;
  close: () => void;
  jumpTo: (index: number) => void;
  // Derived values
  currentItem: PlayableItem | null;
  currentSong: Song | null;
  hasNext: boolean;
  hasPrevious: boolean;
  isActive: boolean;
  progress: number;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

// ============================================================================
// Provider
// ============================================================================

export function MusicPlayerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(playerReducer, initialState);

  const playSetlist = useCallback(
    (items: SetlistItem[], context: SourceContext, startIndex?: number) => {
      dispatch({ type: "LOAD_SETLIST", payload: { items, context, startIndex } });
    },
    []
  );

  const play = useCallback(() => dispatch({ type: "PLAY" }), []);
  const pause = useCallback(() => dispatch({ type: "PAUSE" }), []);
  const togglePlay = useCallback(() => {
    dispatch({ type: state.status === "playing" ? "PAUSE" : "PLAY" });
  }, [state.status]);
  const next = useCallback(() => dispatch({ type: "NEXT" }), []);
  const previous = useCallback(() => dispatch({ type: "PREVIOUS" }), []);
  const seek = useCallback(
    (ms: number) => dispatch({ type: "SEEK", payload: ms }),
    []
  );
  const toggleExpanded = useCallback(
    () => dispatch({ type: "TOGGLE_EXPANDED" }),
    []
  );
  const close = useCallback(() => dispatch({ type: "CLOSE" }), []);
  const jumpTo = useCallback(
    (index: number) => dispatch({ type: "JUMP_TO", payload: index }),
    []
  );

  const currentItem =
    state.currentIndex >= 0 && state.currentIndex < state.queue.length
      ? state.queue[state.currentIndex]
      : null;

  const currentSong = currentItem?.song ?? null;
  const hasNext = state.currentIndex < state.queue.length - 1;
  const hasPrevious = state.currentIndex > 0;
  const isActive = state.isVisible && state.status !== "idle";
  const progress =
    state.durationMs > 0 ? (state.currentTimeMs / state.durationMs) * 100 : 0;

  const value = useMemo(
    (): PlayerContextValue => ({
      state,
      dispatch,
      playSetlist,
      play,
      pause,
      togglePlay,
      next,
      previous,
      seek,
      toggleExpanded,
      close,
      jumpTo,
      currentItem,
      currentSong,
      hasNext,
      hasPrevious,
      isActive,
      progress,
    }),
    [
      state,
      playSetlist,
      play,
      pause,
      togglePlay,
      next,
      previous,
      seek,
      toggleExpanded,
      close,
      jumpTo,
      currentItem,
      currentSong,
      hasNext,
      hasPrevious,
      isActive,
      progress,
    ]
  );

  return (
    <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

export function usePlayer(): PlayerContextValue {
  const ctx = useContext(PlayerContext);
  if (!ctx) {
    throw new Error("usePlayer must be used within MusicPlayerProvider");
  }
  return ctx;
}
