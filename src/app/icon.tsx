import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #b5481f 0%, #923716 70%, #21170f 100%)",
          color: "#fff",
          fontSize: 30,
          fontWeight: 800,
          fontFamily: "sans-serif",
        }}
      >
        WQ
      </div>
    ),
    { ...size }
  );
}
