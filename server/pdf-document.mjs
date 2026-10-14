const TITLES = Object.freeze({
  Invoice: 'Invoice',
  PaymentReceipt: 'Payment Receipt',
  Pcr: 'Patient Care Report',
});

export function isSupportedDocumentType(value) {
  return Object.hasOwn(TITLES, value);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function sanitizeTemplateHtml(html) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, '')
    .replace(/<\/?script\b[^>]*>/gi, '')
    .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe\s*>/gi, '')
    .replace(/<\/?iframe\b[^>]*>/gi, '')
    .replace(/<object\b[^>]*>[\s\S]*?<\/object\s*>/gi, '')
    .replace(/<embed\b[^>]*\/?>/gi, '')
    .replace(/<base\b[^>]*>/gi, '')
    .replace(/<meta\b[^>]*http-equiv\s*=\s*(['"]?)refresh\1[^>]*>/gi, '')
    .replace(/\s+on[a-z0-9_-]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/\s+(href|src)\s*=\s*(["'])\s*javascript:[\s\S]*?\2/gi, '')
    .replace(/<\s*style\b[^>]*>[\s\S]*?<\/\s*style\s*>/gi, '');
}

export function sanitizeTemplateCss(css) {
  return css
    .replace(/@import\s+(?:url\([^)]*\)|[^;]+);?/gi, '')
    .replace(/url\(\s*(['"]?)(?!data:image\/)(?:https?:|file:|ftp:|\/\/|\/)[^)]*\)/gi, 'none')
    .replace(/url\(\s*(['"]?)javascript:[^)]*\)/gi, 'none')
    .replace(/<\/style/gi, '<\\/style');
}

export function buildPrintDocument({ documentType, title, html, css }) {
  if (!isSupportedDocumentType(documentType)) {
    throw new TypeError('Unsupported document type.');
  }
  if (typeof html !== 'string' || typeof css !== 'string') {
    throw new TypeError('Template HTML and CSS are required.');
  }

  const safeTitle = escapeHtml(title || TITLES[documentType]);
  const safeHtml = sanitizeTemplateHtml(html);
  const safeCss = sanitizeTemplateCss(css);
  const printCss = `
    @page { size: A4 portrait; margin: 0; }
    html, body { margin: 0 !important; padding: 0 !important; width: 210mm; min-height: 297mm; background: #fff !important; }
    body { display: block !important; }
    *, *::before, *::after { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .doc-page { width: 210mm !important; min-height: 297mm !important; height: auto !important; margin: 0 !important; box-shadow: none !important; }
    .doku-page-break, [data-doku-component="page-break"] { break-before: page !important; page-break-before: always !important; height: 0 !important; min-height: 0 !important; }
    table { break-inside: auto; page-break-inside: auto; }
    thead { display: table-header-group; }
    tfoot { display: table-footer-group; }
    tr, .info-card, .signature-block { break-inside: avoid; page-break-inside: avoid; }
    @media screen { html, body { background: #fff !important; } }
  `;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data: blob:; style-src 'unsafe-inline'; font-src data:;">
  <title>${safeTitle}</title>
  <style>${safeCss}\n${printCss}</style>
</head>
<body>${safeHtml}</body>
</html>`;
}
