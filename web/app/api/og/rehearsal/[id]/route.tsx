import { ImageResponse } from "next/og";
import { env } from "@/lib/env";

export const runtime = "edge";

interface RehearsalMetadata {
  id: string;
  date: string;
  eventName: string | null;
  locationName: string | null;
  bannerUrl: string | null;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-DO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let rehearsal: RehearsalMetadata | null = null;
  try {
    const res = await fetch(`${env.apiUrlInternal}/public/metadata/rehearsal/${id}`);
    if (res.ok) {
      rehearsal = await res.json();
    }
  } catch {
    // Use fallback
  }

  const isUpcoming = rehearsal ? new Date(rehearsal.date) >= new Date() : false;

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
          background: "linear-gradient(135deg, #059669 0%, #0D9488 50%, #1e1e2e 100%)",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
        }}
      >
        {/* Background pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "radial-gradient(circle at 25% 25%, rgba(255,210,0,0.1) 0%, transparent 50%)",
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
          {/* Left: Icon */}
          <div
            style={{
              width: "200px",
              height: "200px",
              borderRadius: "24px",
              background: isUpcoming
                ? "linear-gradient(135deg, #059669, #0D9488)"
                : "linear-gradient(135deg, #4B5563, #374151)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
              border: "2px solid rgba(255, 255, 255, 0.1)",
              overflow: "hidden",
            }}
          >
            {rehearsal?.bannerUrl ? (
              <img
                src={rehearsal.bannerUrl}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
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
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
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
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span
                style={{
                  fontSize: "20px",
                  fontWeight: 500,
                  color: "rgba(255, 255, 255, 0.6)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                Ensayo
              </span>
              {isUpcoming && (
                <span
                  style={{
                    padding: "4px 12px",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "white",
                    background: "#10B981",
                    borderRadius: "9999px",
                    textTransform: "uppercase",
                  }}
                >
                  Proximo
                </span>
              )}
            </div>

            {/* Date */}
            <h1
              style={{
                fontSize: "56px",
                fontWeight: 900,
                color: "white",
                margin: 0,
                lineHeight: 1.1,
                textTransform: "capitalize",
              }}
            >
              {rehearsal ? formatDate(rehearsal.date) : "Ensayo"}
            </h1>

            {/* Event name and location */}
            <p
              style={{
                fontSize: "28px",
                color: "rgba(255, 255, 255, 0.7)",
                margin: 0,
              }}
            >
              {[rehearsal?.eventName, rehearsal?.locationName].filter(Boolean).join(" - ") || env.orgName}
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
            <span style={{ fontSize: "24px", fontWeight: 900, color: "white" }}>{env.orgName.charAt(0)}</span>
          </div>
          <span style={{ fontSize: "20px", color: "rgba(255, 255, 255, 0.5)" }}>
            {env.orgName}
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
