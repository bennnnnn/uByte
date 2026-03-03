// Lightweight client-side C++ syntax highlighter (same style as highlight-go)

const CPP_KEYWORDS =
  /\b(alignas|alignof|and|and_eq|asm|auto|bitand|bitor|bool|break|case|catch|char|char8_t|char16_t|char32_t|class|compl|concept|const|consteval|constexpr|const_cast|continue|co_await|co_return|co_yield|decltype|default|delete|do|double|dynamic_cast|else|enum|explicit|export|extern|false|float|for|friend|goto|if|inline|int|long|mutable|namespace|new|noexcept|not|not_eq|nullptr|operator|or|or_eq|private|protected|public|register|reinterpret_cast|return|short|signed|sizeof|static|static_assert|static_cast|struct|switch|template|this|thread_local|throw|true|try|typedef|typeid|typename|union|unsigned|using|virtual|void|volatile|wchar_t|while|xor|xor_eq)\b/g;

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

interface Token {
  type: string;
  value: string;
  start: number;
  end: number;
}

export function highlightCpp(code: string): string {
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

  // Raw string literal R"(...)" - simple
  const rawRegex = /R"[^(]*\([\s\S]*?\)"[^(]*/g;
  while ((match = rawRegex.exec(code)) !== null) {
    const overlaps = tokens.some((t) => match!.index >= t.start && match!.index < t.end);
    if (!overlaps) tokens.push({ type: "string", value: match[0], start: match.index, end: match.index + match[0].length });
  }

  // Double/single quoted strings
  const stringRegex = /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|L?"(?:[^"\\]|\\.)*"|L?'(?:[^'\\]|\\.)*'/g;
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
  html = html.replace(/\b(\d+\.?\d*(?:[eE][+-]?\d+)?[fFlL]?)\b/g, '<span style="color:#b5cea8">$1</span>');
  html = html.replace(CPP_KEYWORDS, '<span style="color:#c586c0">$1</span>');
  html = html.replace(/\b([a-zA-Z_]\w*)\s*(?=\()/g, (_m, name) => `<span style="color:#dcdcaa">${name}</span>`);
  return html;
}
