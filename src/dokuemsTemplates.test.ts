import { describe, expect, it } from 'vitest';
import { buildDraftEnvelope, isValidDraftEnvelope, templateSeeds, type DokuDocumentType } from './dokuemsTemplates';
import { DOKUEMS_TOOL_BLOCKS } from './dokuemsPlugin';

const types: DokuDocumentType[] = ['Invoice', 'PaymentReceipt', 'Pcr'];

describe('DokuEMS GrapesJS template seeds', () => {
  it.each(types)('%s declares a type, uses sample content and has semantic bindings', (type) => {
    const seed = templateSeeds[type];
    expect(seed.html).toContain(`data-doku-template="${type}"`);
    expect(seed.html).toContain('data-doku-binding=');
    expect(seed.html).toContain('data-doku-component=');
    expect(seed.html).not.toMatch(/<script\b/i);
    expect(seed.css).toContain('.doc-page');
    expect(seed.css).not.toMatch(/position\s*:\s*absolute/i);
  });

  it('keeps the invoice item table width total at 100 percent and provides an SST column', () => {
    const html = templateSeeds.Invoice.html;
    const colgroup = html.match(/<colgroup>(.*?)<\/colgroup>/s)?.[1] ?? '';
    const widths = [...colgroup.matchAll(/width:\s*([\d.]+)%/g)].map(match => Number(match[1]));
    expect(widths.length).toBe(5);
    expect(widths.reduce((sum, value) => sum + value, 0)).toBe(100);
    expect(html).toContain('data-doku-column="sstPercentage"');
    expect(html).toContain('data-doku-repeat="charges.rows"');
  });

  it('saves an explicitly non-production project envelope and validates its shape', () => {
    const payload = buildDraftEnvelope('Invoice', { pages: [] }, '<main>sample</main>', '.doc-page{}');
    expect(isValidDraftEnvelope(payload)).toBe(true);
    expect(isValidDraftEnvelope({ ...payload, format: 'production-template' })).toBe(false);
    expect(payload.note).toContain('not a production');
  });
});


describe('DokuEMS visual tools palette', () => {
  const labels = DOKUEMS_TOOL_BLOCKS.map(tool => tool.label);

  it('provides common text, data, financial and layout controls', () => {
    expect(labels).toEqual(expect.arrayContaining([
      'Label', 'Text / Paragraph', 'Heading', 'Data Field', 'Date Field',
      'Amount / Currency', 'Multiline Data Field', 'Image / Logo',
      'Charges / SST Table', 'Payment Table', 'Invoice Totals',
      'Divider Line', 'Bordered Box', 'Notes / Terms', 'Vertical Spacer',
    ]));
  });

  it('provides DokuEMS-specific codes and signature controls with explicit placeholders', () => {
    const byId = Object.fromEntries(DOKUEMS_TOOL_BLOCKS.map(tool => [tool.id, tool]));
    expect(byId['doku-barcode'].label).toContain('placeholder');
    expect(byId['doku-barcode'].content).toContain('data-doku-symbology="CODE128"');
    expect(byId['doku-qr'].label).toContain('placeholder');
    expect(byId['doku-qr'].content).toContain('data-doku-binding="payment.qrPayload"');
    expect(byId['doku-signature'].content).toContain('data-doku-component="signature"');
    expect(labels.length).toBeGreaterThanOrEqual(25);
  });

  it('keeps the repeating charges table columns at 100 percent', () => {
    const tool = DOKUEMS_TOOL_BLOCKS.find(x => x.id === 'doku-items-table');
    const widths = [...String(tool?.content).matchAll(/width:\s*([\d.]+)%/g)].map(match => Number(match[1]));
    expect(widths.reduce((sum, value) => sum + value, 0)).toBe(100);
  });
});
