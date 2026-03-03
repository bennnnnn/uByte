// Lightweight client-side Java syntax highlighter (same style as highlight-go)

const JAVA_KEYWORDS =
  /\b(abstract|assert|boolean|break|byte|case|catch|char|class|const|continue|default|do|double|else|enum|extends|final|finally|float|for|goto|if|implements|import|instanceof|int|interface|long|native|new|package|private|protected|public|return|short|static|strictfp|super|switch|synchronized|this|throw|throws|transient|try|void|volatile|while|true|false|null)\b/g;

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

interface Token {
  type: string;
  value: string;
  start: number;
  end: number;
}

export function highlightJava(code: string): string {
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

  // Javadoc
  const javadocRegex = /\/\*\*[\s\S]*?\*\//g;
  while ((match = javadocRegex.exec(code)) !== null) {
    const overlaps = tokens.some((t) => match!.index >= t.start && match!.index < t.end);
    if (!overlaps) tokens.push({ type: "comment", value: match[0], start: match.index, end: match.index + match[0].length });
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
  html = html.replace(/\b(\d+\.?\d*(?:[eE][+-]?\d+)?[fFdDlL]?)\b/g, '<span style="color:#b5cea8">$1</span>');
  html = html.replace(JAVA_KEYWORDS, '<span style="color:#c586c0">$1</span>');
  html = html.replace(/\b([a-zA-Z_]\w*)\s*(?=\()/g, (_m, name) => `<span style="color:#dcdcaa">${name}</span>`);
  return html;
}
