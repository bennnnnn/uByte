// Lightweight client-side JavaScript syntax highlighter (same style as highlight-go)

const JS_KEYWORDS =
  /\b(await|break|case|catch|class|const|continue|debugger|default|delete|do|else|export|extends|finally|for|function|if|import|in|instanceof|let|new|null|return|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)\b/g;

const JS_LITERALS = /\b(true|false)\b/g;

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

interface Token {
  type: string;
  value: string;
  start: number;
  end: number;
}

export function highlightJavaScript(code: string): string {
  const tokens: Token[] = [];

  // Block comments
  const blockCommentRegex = /\/\*[\s\S]*?\*\//g;
  let match;
  while ((match = blockCommentRegex.exec(code)) !== null) {
    tokens.push({ type: "comment", value: match[0], start: match.index, end: match.index + match[0].length });
  }

  // Line comments
  const lineCommentRegex = /\/\/.*$/gm;
  while ((match = lineCommentRegex.exec(code)) !== null) {
    const overlaps = tokens.some((t) => match!.index >= t.start && match!.index < t.end);
    if (!overlaps) tokens.push({ type: "comment", value: match[0], start: match.index, end: match.index + match[0].length });
  }

  // Template literals (backticks) - simple form
  const templateRegex = /`(?:[^`\\]|\\.)*`/g;
  while ((match = templateRegex.exec(code)) !== null) {
    const overlaps = tokens.some((t) => match!.index >= t.start && match!.index < t.end);
    if (!overlaps) tokens.push({ type: "string", value: match[0], start: match.index, end: match.index + match[0].length });
  }

  // Double/single quoted strings
  const stringRegex = /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g;
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
  html = html.replace(/\b(\d+\.?\d*)\b/g, '<span style="color:#b5cea8">$1</span>');
  html = html.replace(JS_KEYWORDS, '<span style="color:#c586c0">$1</span>');
  html = html.replace(JS_LITERALS, '<span style="color:#569cd6">$1</span>');
  html = html.replace(/\b([a-zA-Z_]\w*)\s*(?=\()/g, (_m, name) => `<span style="color:#dcdcaa">${name}</span>`);
  return html;
}
