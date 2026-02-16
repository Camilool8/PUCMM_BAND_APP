"use client";

interface SpotifyEngineProps {
  spotifyTrackId: string | undefined;
  isActive: boolean;
  isExpanded: boolean;
}

export default function SpotifyEngine({
  spotifyTrackId,
  isActive,
  isExpanded,
}: SpotifyEngineProps) {
  if (!spotifyTrackId || !isActive) return null;

  return (
    <div className={isExpanded ? "w-full max-w-md mx-auto" : "sr-only"}>
      <iframe
        src={`https://open.spotify.com/embed/track/${spotifyTrackId}?theme=0`}
        width="100%"
        height={isExpanded ? 80 : 0}
        allow="encrypted-media; autoplay; clipboard-write"
        loading="lazy"
        className="rounded-xl"
        title="Spotify Player"
      />
    </div>
  );
}
