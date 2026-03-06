import { escapeHtml, createHighlighter } from "@/lib/highlight-engine";

const KEYWORDS = /\b(await|break|case|catch|class|const|continue|debugger|default|delete|do|else|export|extends|finally|for|function|if|import|in|instanceof|let|new|null|return|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)\b/g;
const LITERALS = /\b(true|false)\b/g;

export const highlightJavaScript = createHighlighter({
  regions: [
    { type: "comment", pattern: /\/\*[\s\S]*?\*\//g },
    { type: "comment", pattern: /\/\/.*$/gm },
    { type: "string",  pattern: /`(?:[^`\\]|\\.)*`/g }, // template literals
    { type: "string",  pattern: /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g },
  ],
  transformGap(text) {
    let html = escapeHtml(text);
    html = html.replace(/\b(\d+\.?\d*)\b/g, '<span style="color:#b5cea8">$1</span>');
    html = html.replace(KEYWORDS, '<span style="color:#c586c0">$1</span>');
    html = html.replace(LITERALS, '<span style="color:#569cd6">$1</span>');
    html = html.replace(/\b([a-zA-Z_]\w*)\s*(?=\()/g, (_m, name) => `<span style="color:#dcdcaa">${name}</span>`);
    return html;
  },
});
