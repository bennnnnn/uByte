import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        background: "linear-gradient(135deg, #4338ca, #1d4ed8)",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "6px",
        color: "#ffffff",
        fontSize: 18,
        fontWeight: 800,
        letterSpacing: "-0.08em",
      }}
    >
      U
    </div>,
    size
  );
}
