"use client";

import { useState } from "react";
import { encodeShareCode } from "@/lib/share-code";

/**
 * Shared "copy share link" behaviour used by both the tutorial IDE and the
 * practice IDE.  Returns the copied state and a handler that encodes the
 * current code into a ?share= URL param and writes it to the clipboard.
 */
export function useShareCode(getCode: () => string) {
  const [shareCopied, setShareCopied] = useState(false);

  function handleShare() {
    try {
      const encoded = encodeShareCode(getCode());
      const url = new URL(window.location.href);
      url.searchParams.set("share", encoded);
      navigator.clipboard
        .writeText(url.toString())
        .then(() => {
          setShareCopied(true);
          setTimeout(() => setShareCopied(false), 2500);
        })
        .catch(() => {});
    } catch {
      navigator.clipboard.writeText(window.location.href).catch(() => {});
    }
  }

  return { shareCopied, handleShare };
}
