"use client";

interface SpotifyEngineProps {
  spotifyTrackId: string | undefined;
  isActive: boolean;
  compact?: boolean;
  onReady?: () => void;
}

export default function SpotifyEngine({
  spotifyTrackId,
  isActive,
  compact = false,
  onReady,
}: SpotifyEngineProps) {
  if (!spotifyTrackId || !isActive) return null;

  return (
    <div className="w-full" key={spotifyTrackId}>
      <iframe
        src={`https://open.spotify.com/embed/track/${spotifyTrackId}?utm_source=generator&theme=0`}
        width="100%"
        height={compact ? 80 : 152}
        allow="encrypted-media; autoplay; clipboard-write"
        loading="eager"
        className="rounded-xl"
        title="Spotify Player"
        onLoad={onReady}
      />
    </div>
  );
}
