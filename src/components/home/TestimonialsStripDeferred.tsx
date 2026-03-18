"use client";

import dynamic from "next/dynamic";

// ssr:false keeps testimonials out of the initial HTML — they're below the
// fold and not SEO-critical. Same pattern as HeroIDEDeferred.
const TestimonialsStrip = dynamic(() => import("./TestimonialsStrip"), {
  ssr: false,
  loading: () => null,
});

export default function TestimonialsStripDeferred() {
  return <TestimonialsStrip />;
}
