"use client";

import dynamic from "next/dynamic";

// HeroIDE is only shown on lg+ screens. Using ssr:false inside this client
// component keeps its JS out of the critical bundle on mobile.
const HeroIDE = dynamic(() => import("./HeroIDE"), { ssr: false, loading: () => null });

export default function HeroIDEDeferred() {
  return <HeroIDE />;
}
