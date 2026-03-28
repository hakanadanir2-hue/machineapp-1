const DANGEROUS_TAGS = /<(script|iframe|object|embed|form|base|link|meta)\b[^>]*>[\s\S]*?<\/\1>/gi;
const SELF_CLOSING   = /<(script|iframe|object|embed|form|base|link|meta)\b[^>]*\/?>/gi;
const EVENT_HANDLERS = /\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi;
const JS_PROTOCOL    = /\bhref\s*=\s*(?:"|')?\s*javascript:/gi;
const DATA_PROTOCOL  = /\bsrc\s*=\s*(?:"|')?\s*data:(?!image\/)/gi;

export function sanitizeHtml(html: string): string {
  return html
    .replace(DANGEROUS_TAGS, "")
    .replace(SELF_CLOSING, "")
    .replace(EVENT_HANDLERS, "")
    .replace(JS_PROTOCOL, 'href="about:blank"')
    .replace(DATA_PROTOCOL, 'src=""');
}
