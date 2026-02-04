import { ImageResponse } from "next/og";
import { env } from "@/lib/env";

export const runtime = "edge";

interface SongMetadata {
  id: string;
  title: string;
  artist: string;
  coverUrl: string | null;
  genre: string | null;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let song: SongMetadata | null = null;
  try {
    const res = await fetch(`${env.apiUrl}/public/metadata/song/${id}`);
    if (res.ok) {
      song = await res.json();
    }
  } catch {
    // Use fallback
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1e1e2e 0%, #0033A0 50%, #4F46E5 100%)",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
        }}
      >
        {/* Background pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "radial-gradient(circle at 25% 75%, rgba(255,210,0,0.1) 0%, transparent 50%)",
          }}
        />

        {/* Content container */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "48px",
            padding: "60px",
          }}
        >
          {/* Left: Album Cover */}
          <div
            style={{
              width: "280px",
              height: "280px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #374151, #1f2937)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
              border: "2px solid rgba(255, 255, 255, 0.1)",
              overflow: "hidden",
            }}
          >
            {song?.coverUrl ? (
              <img
                src={song.coverUrl}
                alt=""
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <svg
                width="100"
                height="100"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(255,255,255,0.5)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 18V5l12-2v13" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
              </svg>
            )}
          </div>

          {/* Right: Info */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              maxWidth: "600px",
            }}
          >
            {/* Label */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span
                style={{
                  fontSize: "18px",
                  fontWeight: 500,
                  color: "rgba(255, 255, 255, 0.6)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                Cancion
              </span>
              {song?.genre && (
                <span
                  style={{
                    padding: "4px 12px",
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "rgba(255, 255, 255, 0.8)",
                    background: "rgba(255, 255, 255, 0.1)",
                    borderRadius: "9999px",
                  }}
                >
                  {song.genre}
                </span>
              )}
            </div>

            {/* Title */}
            <h1
              style={{
                fontSize: "52px",
                fontWeight: 900,
                color: "white",
                margin: 0,
                lineHeight: 1.1,
              }}
            >
              {song?.title || "Cancion"}
            </h1>

            {/* Artist */}
            <p
              style={{
                fontSize: "32px",
                color: "rgba(255, 255, 255, 0.7)",
                margin: 0,
              }}
            >
              {song?.artist || "Artista"}
            </p>
          </div>
        </div>

        {/* Footer: Logo */}
        <div
          style={{
            position: "absolute",
            bottom: "30px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #0033A0, #FFD200)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: "24px", fontWeight: 900, color: "white" }}>P</span>
          </div>
          <span style={{ fontSize: "20px", color: "rgba(255, 255, 255, 0.5)" }}>
            PUCMM Band App
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
