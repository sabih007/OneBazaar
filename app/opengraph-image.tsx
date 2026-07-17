import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/seo/site";

export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
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
          background: "linear-gradient(135deg, #1B4EF5 0%, #1642D6 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 120,
            height: 120,
            borderRadius: 28,
            background: "rgba(255,255,255,0.15)",
            marginBottom: 36,
          }}
        >
          <div style={{ fontSize: 64, fontWeight: 700, color: "#FFFFFF" }}>B</div>
        </div>
        <div style={{ fontSize: 76, fontWeight: 700, color: "#FFFFFF", letterSpacing: -1 }}>
          {SITE_NAME}
        </div>
        <div style={{ marginTop: 18, fontSize: 34, color: "#E8EDFE", fontWeight: 500 }}>
          {SITE_TAGLINE}
        </div>
        <div
          style={{
            display: "flex",
            gap: 14,
            marginTop: 44,
          }}
        >
          {["Karachi", "Lahore", "Islamabad", "and more"].map((city) => (
            <div
              key={city}
              style={{
                fontSize: 24,
                color: "#1B4EF5",
                background: "#FFFFFF",
                padding: "8px 22px",
                borderRadius: 999,
                fontWeight: 600,
              }}
            >
              {city}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
