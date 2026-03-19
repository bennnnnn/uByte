import { escapeHtml, createHighlighter } from "@/lib/highlight-engine";

const KEYWORDS = /\b(ADD|ALL|ALTER|AND|AS|ASC|BETWEEN|BY|CASE|CAST|CHECK|COLUMN|CONSTRAINT|CREATE|CROSS|DEFAULT|DELETE|DESC|DISTINCT|DROP|ELSE|END|EXISTS|FOREIGN|FROM|FULL|GROUP|HAVING|IN|INDEX|INNER|INSERT|INTO|IS|JOIN|KEY|LEFT|LIKE|LIMIT|NOT|NULL|OFFSET|ON|OR|ORDER|OUTER|PRIMARY|REFERENCES|RIGHT|SELECT|SET|TABLE|THEN|TRUNCATE|UNION|UNIQUE|UPDATE|VALUES|VIEW|WHEN|WHERE|WITH)\b/gi;
const FUNCTIONS = /\b(ABS|AVG|COALESCE|COUNT|DATE|GROUP_CONCAT|IFNULL|JULIANDAY|LENGTH|LOWER|MAX|MIN|NOW|NULLIF|PRINTF|RANDOM|REPLACE|ROUND|STRFTIME|SUBSTR|SUM|TRIM|TYPEOF|UPPER)\b/gi;
const TYPES = /\b(BIGINT|BLOB|BOOLEAN|CHAR|DATE|DATETIME|DECIMAL|DOUBLE|FLOAT|INT|INTEGER|NUMERIC|REAL|TEXT|TIMESTAMP|VARCHAR)\b/gi;

export const highlightSql = createHighlighter({
  regions: [
    { type: "comment", pattern: /--.*$/gm },
    { type: "comment", pattern: /\/\*[\s\S]*?\*\//g },
    { type: "string",  pattern: /'(?:[^'\\]|\\.)*'/g },
  ],
  transformGap(text) {
    let html = escapeHtml(text);
    html = html.replace(/\b(\d+\.?\d*)\b/g, '<span style="color:#b5cea8">$1</span>');
    html = html.replace(TYPES, '<span style="color:#4ec9b0">$1</span>');
    html = html.replace(FUNCTIONS, '<span style="color:#dcdcaa">$1</span>');
    html = html.replace(KEYWORDS, '<span style="color:#569cd6">$1</span>');
    return html;
  },
});
