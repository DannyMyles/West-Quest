import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "West Quest Limited — Your next device, within reach";

export default function OpengraphImage() {
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
          background: "linear-gradient(135deg, #21170f 0%, #2f2218 60%, #3a2a1d 140%)",
          color: "#fff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 84,
              height: 84,
              background: "linear-gradient(135deg, #b5481f 0%, #923716 70%, #21170f 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 44,
              fontWeight: 800,
              color: "#ffffff",
            }}
          >
            WQ
          </div>
          <div style={{ display: "flex", fontSize: 60, fontWeight: 700, letterSpacing: -1 }}>
            <span>West</span>
            <span style={{ color: "#f2c48d", marginLeft: 16 }}>Quest</span>
          </div>
        </div>
        <div style={{ marginTop: 36, fontSize: 32, color: "rgba(255,255,255,0.82)" }}>Your next device, within reach</div>
        <div style={{ marginTop: 14, fontSize: 22, color: "#f2c48d" }}>Deposit + daily payment · 6, 9 or 12 months</div>
      </div>
    ),
    { ...size }
  );
}
