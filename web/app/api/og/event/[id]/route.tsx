import { ImageResponse } from "next/og";

export const runtime = "edge";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface EventMetadata {
  id: string;
  name: string;
  description: string | null;
  bannerUrl: string | null;
  iconName: string | null;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let event: EventMetadata | null = null;
  try {
    const res = await fetch(`${API_URL}/public/metadata/event/${id}`);
    if (res.ok) {
      event = await res.json();
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
          background: "linear-gradient(135deg, #0033A0 0%, #4F46E5 50%, #1e1e2e 100%)",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
        }}
      >
        {/* Background pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "radial-gradient(circle at 75% 25%, rgba(255,210,0,0.15) 0%, transparent 50%)",
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
          {/* Left: Icon/Image */}
          <div
            style={{
              width: "200px",
              height: "200px",
              borderRadius: "24px",
              background: "linear-gradient(135deg, #0033A0, #4F46E5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
              border: "2px solid rgba(255, 255, 255, 0.1)",
              overflow: "hidden",
            }}
          >
            {event?.bannerUrl ? (
              <img
                src={event.bannerUrl}
                alt=""
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <svg
                width="80"
                height="80"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(255,255,255,0.9)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            )}
          </div>

          {/* Right: Info */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              maxWidth: "700px",
            }}
          >
            {/* Label */}
            <span
              style={{
                fontSize: "20px",
                fontWeight: 500,
                color: "rgba(255, 255, 255, 0.6)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              Evento
            </span>

            {/* Name */}
            <h1
              style={{
                fontSize: "64px",
                fontWeight: 900,
                color: "white",
                margin: 0,
                lineHeight: 1.1,
              }}
            >
              {event?.name || "Evento PUCMM"}
            </h1>

            {/* Description */}
            {event?.description && (
              <p
                style={{
                  fontSize: "28px",
                  color: "rgba(255, 255, 255, 0.7)",
                  margin: 0,
                  lineHeight: 1.4,
                }}
              >
                {event.description.length > 100
                  ? `${event.description.slice(0, 100)}...`
                  : event.description}
              </p>
            )}
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
