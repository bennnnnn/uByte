// Lightweight client-side Python syntax highlighter (same style as highlight-go)

const PY_KEYWORDS =
  /\b(and|as|assert|async|await|break|class|continue|def|del|elif|else|except|finally|for|from|global|if|import|in|is|lambda|nonlocal|not|or|pass|raise|return|try|while|with|yield|False|None|True)\b/g;

const PY_BUILTINS =
  /\b(abs|all|any|ascii|bin|bool|bytearray|bytes|callable|chr|classmethod|dict|dir|divmod|enumerate|eval|exec|filter|float|format|frozenset|getattr|globals|hasattr|hash|help|hex|id|input|int|isinstance|issubclass|iter|len|list|locals|map|max|min|next|object|oct|open|ord|pow|print|property|range|repr|reversed|round|set|setattr|slice|sorted|staticmethod|str|sum|super|tuple|type|vars|zip|__import__)\b/g;

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

interface Token {
  type: string;
  value: string;
  start: number;
  end: number;
}

export function highlightPython(code: string): string {
  const tokens: Token[] = [];

  // Line comments
  const lineCommentRegex = /#.*$/gm;
  let match;
  while ((match = lineCommentRegex.exec(code)) !== null) {
    const overlaps = tokens.some((t) => match!.index >= t.start && match!.index < t.end);
    if (!overlaps) tokens.push({ type: "comment", value: match[0], start: match.index, end: match.index + match[0].length });
  }

  // Triple-quoted strings (before single/double to avoid partial matches)
  const tripleRegex = /("""[\s\S]*?"""|'''[\s\S]*?''')/g;
  while ((match = tripleRegex.exec(code)) !== null) {
    const overlaps = tokens.some((t) => match!.index >= t.start && match!.index < t.end);
    if (!overlaps) tokens.push({ type: "string", value: match[0], start: match.index, end: match.index + match[0].length });
  }

  // Single/double quoted strings
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
  html = html.replace(PY_KEYWORDS, '<span style="color:#c586c0">$1</span>');
  html = html.replace(PY_BUILTINS, '<span style="color:#dcdcaa">$1</span>');
  html = html.replace(/\b([a-zA-Z_]\w*)\s*(?=\()/g, (_m, name) => `<span style="color:#dcdcaa">${name}</span>`);
  return html;
}
