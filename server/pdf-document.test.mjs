import { describe, expect, it } from 'vitest';
import { buildPrintDocument, isSupportedDocumentType, sanitizeTemplateCss, sanitizeTemplateHtml } from './pdf-document.mjs';

describe('print HTML prepared for Playwright PDF generation', () => {
  it('builds an A4 print document for each supported DokuEMS template type', () => {
    for (const documentType of ['Invoice', 'PaymentReceipt', 'Pcr']) {
      const html = buildPrintDocument({ documentType, title: 'Sample & Test', html: '<main class="doc-page">Sample content</main>', css: '.doc-page{color:#123}' });
      expect(html).toContain('@page { size: A4 portrait; margin: 0; }');
      expect(html).toContain('width: 210mm !important');
      expect(html).toContain('<title>Sample &amp; Test</title>');
      expect(html).toContain('Sample content');
    }
  });

  it('rejects document types outside the prototype allowlist', () => {
    expect(isSupportedDocumentType('Invoice')).toBe(true);
    expect(isSupportedDocumentType('Patient')).toBe(false);
    expect(() => buildPrintDocument({ documentType: 'Patient', title: 'Bad', html: '<main/>', css: '' })).toThrow('Unsupported document type');
  });

  it('removes script-capable markup and inline event handlers', () => {
    const result = sanitizeTemplateHtml('<script>alert(1)</script><div onclick="alert(1)">safe</div><iframe src="https://bad.test"></iframe>');
    expect(result).not.toMatch(/<script|onclick|<iframe/i);
    expect(result).toContain('safe');
  });

  it('removes imports and external CSS URLs while retaining data images', () => {
    const result = sanitizeTemplateCss('@import url(https://example.test/a.css); .a{background:url(https://bad.test/a.png)} .b{background:url(data:image/png;base64,AA==)}');
    expect(result).not.toContain('@import');
    expect(result).not.toContain('https://');
    expect(result).toContain('url(data:image/png;base64,AA==)');
  });
});
