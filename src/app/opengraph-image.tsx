import fs from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "West Quest Limited — Your next device, within reach";

export default async function OpengraphImage() {
  const svg = await fs.readFile(path.join(process.cwd(), "public", "brand", "west-quest-logo-on-dark.svg"));
  const logo = `data:image/svg+xml;base64,${svg.toString("base64")}`;
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
          background: "#0d0a08",
          color: "#fff",
        }}
      >
        <img src={logo} width={490} height={374} alt="" />
        <div style={{ marginTop: 30, fontSize: 30, color: "rgba(255,255,255,0.8)" }}>Your next device, within reach</div>
        <div style={{ marginTop: 10, fontSize: 22, color: "#c49a4c" }}>Deposit + daily payment · 6, 9 or 12 months</div>
      </div>
    ),
    { ...size }
  );
}
