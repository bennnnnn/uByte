/** Shared engine for all client-side syntax highlighters. */

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export interface HighlightConfig {
  /** Protected regions (strings, comments) scanned in order; first match wins per character. */
  regions: { type: "comment" | "string"; pattern: RegExp }[];
  /** Receives raw code text for each gap between protected regions; must return highlighted HTML. */
  transformGap: (text: string) => string;
}

export function createHighlighter(config: HighlightConfig): (code: string) => string {
  return function highlight(code: string): string {
    const tokens: { type: string; value: string; start: number; end: number }[] = [];

    for (const { type, pattern } of config.regions) {
      pattern.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(code)) !== null) {
        const start = match.index;
        const end = start + match[0].length;
        if (!tokens.some((t) => start < t.end && end > t.start)) {
          tokens.push({ type, value: match[0], start, end });
        }
      }
    }

    tokens.sort((a, b) => a.start - b.start);

    let result = "";
    let lastIndex = 0;

    for (const token of tokens) {
      if (token.start > lastIndex) {
        result += config.transformGap(code.substring(lastIndex, token.start));
      }
      const escaped = escapeHtml(token.value);
      result +=
        token.type === "comment"
          ? `<span style="color:#6a9955">${escaped}</span>`
          : `<span style="color:#ce9178">${escaped}</span>`;
      lastIndex = token.end;
    }

    if (lastIndex < code.length) {
      result += config.transformGap(code.substring(lastIndex));
    }

    return result;
  };
}
