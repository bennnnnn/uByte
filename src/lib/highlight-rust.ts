// Lightweight client-side Rust syntax highlighter (same style as highlight-go)

const RUST_KEYWORDS =
  /\b(as|async|await|break|const|continue|crate|dyn|else|enum|extern|false|fn|for|if|impl|in|let|loop|match|mod|move|mut|pub|ref|return|self|Self|static|struct|super|trait|true|try|type|unsafe|use|where|while)\b/g;

const RUST_TYPES = /\b(bool|char|f32|f64|i8|i16|i32|i64|i128|isize|str|u8|u16|u32|u64|u128|usize|Option|Result|Vec|String|Box|Rc|Arc)\b/g;

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

interface Token {
  type: string;
  value: string;
  start: number;
  end: number;
}

export function highlightRust(code: string): string {
  const tokens: Token[] = [];

  // Block comments /* */ and nested block comments (simplified: non-nested)
  const blockCommentRegex = /\/\*[\s\S]*?\*\//g;
  let match;
  while ((match = blockCommentRegex.exec(code)) !== null) {
    tokens.push({ type: "comment", value: match[0], start: match.index, end: match.index + match[0].length });
  }

  // Line comments and doc comments // and //!
  const lineCommentRegex = /\/\/.*$/gm;
  while ((match = lineCommentRegex.exec(code)) !== null) {
    const overlaps = tokens.some((t) => match!.index >= t.start && match!.index < t.end);
    if (!overlaps) tokens.push({ type: "comment", value: match[0], start: match.index, end: match.index + match[0].length });
  }

  // Raw string r"..." (no #)
  const rawRegex = /r"(?:[^"\\]|\\.)*"/g;
  while ((match = rawRegex.exec(code)) !== null) {
    const overlaps = tokens.some((t) => match!.index >= t.start && match!.index < t.end);
    if (!overlaps) tokens.push({ type: "string", value: match[0], start: match.index, end: match.index + match[0].length });
  }

  // Byte and regular strings
  const stringRegex = /b?"(?:[^"\\]|\\.)*"|b?'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|'(?:[^'\\]|\\.)'/g;
  while ((match = stringRegex.exec(code)) !== null) {
    const overlaps = tokens.some((t) => match!.index >= t.start && match!.index < t.end);
    if (!overlaps) tokens.push({ type: "string", value: match[0], start: match.index, end: match.index + match[0].length });
  }

  tokens.sort((a, b) => a.start - b.start);

  let result = "";
  let lastIndex = 0;

  for (const token of tokens) {
    if (token.start > lastIndex) {
      result += highlightKeywords(code.substring(lastIndex, token.start));
    }
    const escaped = escapeHtml(token.value);
    if (token.type === "comment") {
      result += `<span style="color:#6a9955">${escaped}</span>`;
    } else {
      result += `<span style="color:#ce9178">${escaped}</span>`;
    }
    lastIndex = token.end;
  }
  if (lastIndex < code.length) {
    result += highlightKeywords(code.substring(lastIndex));
  }
  return result;
}

function highlightKeywords(text: string): string {
  let html = escapeHtml(text);
  html = html.replace(/\b(\d+\.?\d*(?:[eE][+-]?\d+)?(?:f32|f64)?)\b/g, '<span style="color:#b5cea8">$1</span>');
  html = html.replace(RUST_KEYWORDS, '<span style="color:#c586c0">$1</span>');
  html = html.replace(RUST_TYPES, '<span style="color:#4ec9b0">$1</span>');
  html = html.replace(/\b([a-zA-Z_]\w*)\s*(?=\()/g, (_m, name) => `<span style="color:#dcdcaa">${name}</span>`);
  return html;
}
