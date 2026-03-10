import { escapeHtml, createHighlighter } from "@/lib/highlight-engine";

const KEYWORDS = /\b(abstract|as|base|bool|break|byte|case|catch|char|checked|class|const|continue|decimal|default|delegate|do|double|else|enum|event|explicit|extern|false|finally|fixed|float|for|foreach|goto|if|implicit|in|int|interface|internal|is|lock|long|namespace|new|null|object|operator|out|override|params|private|protected|public|readonly|ref|return|sbyte|sealed|short|sizeof|stackalloc|static|string|struct|switch|this|throw|true|try|typeof|uint|ulong|unchecked|unsafe|ushort|using|virtual|void|volatile|while)\b/g;
const TYPES    = /\b(Action|Array|Console|DateTime|Dictionary|Exception|Func|IEnumerable|IList|List|Object|String|Task|Thread|Tuple|Type|var)\b/g;

export const highlightCsharp = createHighlighter({
  regions: [
    { type: "comment", pattern: /\/\*[\s\S]*?\*\//g },
    { type: "comment", pattern: /\/\/.*$/gm },
    { type: "string",  pattern: /@"(?:[^"]|"")*"/g },       // verbatim strings
    { type: "string",  pattern: /\$"(?:[^"\\]|\\.)*"/g },   // interpolated strings
    { type: "string",  pattern: /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g },
  ],
  transformGap(text) {
    let html = escapeHtml(text);
    html = html.replace(/\b(\d+\.?\d*(?:[eE][+-]?\d+)?(?:f|d|m|L|UL)?)\b/g, '<span style="color:#b5cea8">$1</span>');
    html = html.replace(KEYWORDS, '<span style="color:#c586c0">$1</span>');
    html = html.replace(TYPES,    '<span style="color:#4ec9b0">$1</span>');
    html = html.replace(/\b([A-Z][a-zA-Z_]\w*)\b/g, '<span style="color:#4ec9b0">$1</span>');
    html = html.replace(/\b([a-zA-Z_]\w*)\s*(?=\()/g, (_m, name) => `<span style="color:#dcdcaa">${name}</span>`);
    return html;
  },
});
