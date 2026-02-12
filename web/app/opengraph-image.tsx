import { ImageResponse } from "next/og";
import { env } from "@/lib/env";

export const runtime = "edge";

export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
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
            backgroundImage: "radial-gradient(circle at 30% 30%, rgba(255,210,0,0.15) 0%, transparent 50%)",
          }}
        />

        {/* Logo */}
        <div
          style={{
            width: "160px",
            height: "160px",
            borderRadius: "32px",
            background: "linear-gradient(135deg, #0033A0, #4F46E5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            border: "3px solid rgba(255, 255, 255, 0.1)",
            marginBottom: "32px",
          }}
        >
          <span
            style={{
              fontSize: "100px",
              fontWeight: 900,
              color: "#FFD200",
            }}
          >
            {env.orgName.charAt(0)}
          </span>
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: "72px",
            fontWeight: 900,
            color: "white",
            margin: 0,
            marginBottom: "16px",
          }}
        >
          {env.orgName}
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: "28px",
            color: "rgba(255, 255, 255, 0.7)",
            margin: 0,
          }}
        >
          Sistema de Gestion de Repertorio
        </p>

        {/* Footer */}
        <div
          style={{
            position: "absolute",
            bottom: "30px",
            fontSize: "20px",
            color: "rgba(255, 255, 255, 0.4)",
          }}
        >
          {env.siteUrl.replace(/^https?:\/\//, "")}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
