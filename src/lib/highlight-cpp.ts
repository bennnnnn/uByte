import { escapeHtml, createHighlighter } from "@/lib/highlight-engine";

const KEYWORDS = /\b(alignas|alignof|and|and_eq|asm|auto|bitand|bitor|bool|break|case|catch|char|char8_t|char16_t|char32_t|class|compl|concept|const|consteval|constexpr|const_cast|continue|co_await|co_return|co_yield|decltype|default|delete|do|double|dynamic_cast|else|enum|explicit|export|extern|false|float|for|friend|goto|if|inline|int|long|mutable|namespace|new|noexcept|not|not_eq|nullptr|operator|or|or_eq|private|protected|public|register|reinterpret_cast|return|short|signed|sizeof|static|static_assert|static_cast|struct|switch|template|this|thread_local|throw|true|try|typedef|typeid|typename|union|unsigned|using|virtual|void|volatile|wchar_t|while|xor|xor_eq)\b/g;

export const highlightCpp = createHighlighter({
  regions: [
    { type: "comment", pattern: /\/\*[\s\S]*?\*\//g },
    { type: "comment", pattern: /\/\/.*$/gm },
    { type: "string",  pattern: /R"[^(]*\([\s\S]*?\)"[^(]*/g }, // raw string literals
    { type: "string",  pattern: /L?"(?:[^"\\]|\\.)*"|L?'(?:[^'\\]|\\.)*'/g },
  ],
  transformGap(text) {
    let html = escapeHtml(text);
    html = html.replace(/\b(\d+\.?\d*(?:[eE][+-]?\d+)?[fFlL]?)\b/g, '<span style="color:#b5cea8">$1</span>');
    html = html.replace(KEYWORDS, '<span style="color:#c586c0">$1</span>');
    html = html.replace(/\b([a-zA-Z_]\w*)\s*(?=\()/g, (_m, name) => `<span style="color:#dcdcaa">${name}</span>`);
    return html;
  },
});
