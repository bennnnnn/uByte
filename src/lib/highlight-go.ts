import { escapeHtml, createHighlighter } from "@/lib/highlight-engine";

const KEYWORDS = /\b(break|case|chan|const|continue|default|defer|else|fallthrough|for|func|go|goto|if|import|interface|map|package|range|return|select|struct|switch|type|var)\b/g;
const TYPES    = /\b(bool|byte|complex64|complex128|error|float32|float64|int|int8|int16|int32|int64|rune|string|uint|uint8|uint16|uint32|uint64|uintptr|nil|true|false|iota)\b/g;
const BUILTINS = /\b(append|cap|close|copy|delete|len|make|new|panic|print|println|recover)\b/g;

export const highlightGo = createHighlighter({
  regions: [
    { type: "comment", pattern: /\/\*[\s\S]*?\*\//g },
    { type: "comment", pattern: /\/\/.*$/gm },
    { type: "string",  pattern: /"(?:[^"\\]|\\.)*"|`[^`]*`/g },
    { type: "string",  pattern: /'(?:[^'\\]|\\.)'/g }, // rune literals
  ],
  transformGap(text) {
    let html = escapeHtml(text);
    html = html.replace(/\b(\d+\.?\d*)\b/g, '<span style="color:#b5cea8">$1</span>');
    html = html.replace(KEYWORDS, '<span style="color:#c586c0">$1</span>');
    html = html.replace(TYPES,    '<span style="color:#4ec9b0">$1</span>');
    html = html.replace(BUILTINS, '<span style="color:#dcdcaa">$1</span>');
    html = html.replace(/\b([a-zA-Z_]\w*)\s*(?=\()/g, (match, name) => {
      if (match.includes("</span>")) return match;
      return `<span style="color:#dcdcaa">${name}</span>`;
    });
    html = html.replace(/\b([a-zA-Z_]\w*)\.([a-zA-Z_]\w*)/g, (full, pkg, method) => {
      if (full.includes("</span>")) return full;
      return `<span style="color:#9cdcfe">${pkg}</span>.<span style="color:#dcdcaa">${method}</span>`;
    });
    return html;
  },
});
