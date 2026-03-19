import { escapeHtml, createHighlighter } from "@/lib/highlight-engine";

// TypeScript keywords extend JavaScript keywords with type-system additions
const KEYWORDS = /\b(abstract|as|async|await|break|case|catch|class|const|constructor|continue|debugger|declare|default|delete|do|else|enum|export|extends|finally|for|from|function|if|implements|import|in|infer|instanceof|interface|is|keyof|let|namespace|never|new|null|of|override|private|protected|public|readonly|return|satisfies|static|super|switch|this|throw|try|type|typeof|undefined|unique|var|void|while|with|yield)\b/g;
const TYPE_KEYWORDS = /\b(any|boolean|bigint|never|number|object|string|symbol|unknown|void)\b/g;
const LITERALS = /\b(true|false)\b/g;

export const highlightTypeScript = createHighlighter({
  regions: [
    { type: "comment", pattern: /\/\*[\s\S]*?\*\//g },
    { type: "comment", pattern: /\/\/.*$/gm },
    { type: "string",  pattern: /`(?:[^`\\]|\\.)*`/g },
    { type: "string",  pattern: /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g },
  ],
  transformGap(text) {
    let html = escapeHtml(text);
    html = html.replace(/\b(\d+\.?\d*)\b/g, '<span style="color:#b5cea8">$1</span>');
    html = html.replace(TYPE_KEYWORDS, '<span style="color:#4ec9b0">$1</span>');
    html = html.replace(KEYWORDS, '<span style="color:#c586c0">$1</span>');
    html = html.replace(LITERALS, '<span style="color:#569cd6">$1</span>');
    html = html.replace(/\b([a-zA-Z_]\w*)\s*(?=\()/g, (_m, name) => `<span style="color:#dcdcaa">${name}</span>`);
    // Highlight type annotations: `: Type` and `<Type>`
    html = html.replace(/:\s*([A-Z][a-zA-Z0-9_&|<>\[\]]+)/g, (_m, t) => `: <span style="color:#4ec9b0">${t}</span>`);
    return html;
  },
});
