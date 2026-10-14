import type { DokuDocumentType } from './dokuemsTemplates';

type AnyEditor = any;

export interface DokuEmsToolBlock {
  id: string;
  label: string;
  category: string;
  content: any;
  media?: string;
}

const itemsTable = `<table class="doku-items-table" data-doku-component="items-table" data-doku-repeat="charges.rows"><colgroup><col style="width:39%"><col style="width:10%"><col style="width:17%"><col style="width:13%"><col style="width:21%"></colgroup><thead><tr><th>Description</th><th class="num">Qty</th><th class="num">Unit Price (RM)</th><th class="num">SST %</th><th class="num">Amount (RM)</th></tr></thead><tbody><tr data-doku-row-sample="true"><td data-doku-column="description">Service description</td><td class="num" data-doku-column="quantity">1</td><td class="num" data-doku-column="unitPrice">100.00</td><td class="num" data-doku-column="sstPercentage">6%</td><td class="num" data-doku-column="lineAmount">106.00</td></tr></tbody></table>`;

const paymentTable = `<table class="doku-items-table" data-doku-component="items-table" data-doku-repeat="payments.rows"><colgroup><col style="width:48%"><col style="width:26%"><col style="width:26%"></colgroup><thead><tr><th>Description</th><th>Reference</th><th class="num">Amount (RM)</th></tr></thead><tbody><tr data-doku-row-sample="true"><td data-doku-column="description">Payment received</td><td data-doku-column="reference">TRX-SAMPLE-001</td><td class="num" data-doku-column="amount">100.00</td></tr></tbody></table>`;

/**
 * Core-only GrapesJS blocks. QR and barcode blocks deliberately render clear
 * visual placeholders; they are not scannable codes in this prototype.
 */
export const DOKUEMS_TOOL_BLOCKS: DokuEmsToolBlock[] = [
  { id: 'doku-label', label: 'Label', category: 'Text & Fields', content: '<span class="doku-label" data-doku-component="label" data-doku-label="Label">Label text</span>', media: 'Aa' },
  { id: 'doku-text', label: 'Text / Paragraph', category: 'Text & Fields', content: '<p data-doku-component="static-text">Type your text here. Text wraps naturally within the document flow.</p>', media: '¶' },
  { id: 'doku-heading', label: 'Heading', category: 'Text & Fields', content: '<h2 data-doku-component="heading">Section heading</h2>', media: 'H' },
  { id: 'doku-data-field', label: 'Data Field', category: 'Text & Fields', content: '<span class="doku-data-field" data-doku-component="data-field" data-doku-binding="invoice.invoiceNumber" data-doku-label="Invoice number">INV-SAMPLE-0001</span>', media: '{x}' },
  { id: 'doku-date-field', label: 'Date Field', category: 'Text & Fields', content: '<span class="doku-data-field" data-doku-component="data-field" data-doku-binding="invoice.date" data-doku-label="Invoice date" data-doku-format="dd/MM/yyyy">12/10/2026</span>', media: 'DATE' },
  { id: 'doku-amount-field', label: 'Amount / Currency', category: 'Text & Fields', content: '<span class="doku-data-field num" data-doku-component="data-field" data-doku-binding="invoice.total" data-doku-label="Invoice total" data-doku-format="RM #,##0.00">RM 106.00</span>', media: 'RM' },
  { id: 'doku-multiline-field', label: 'Multiline Data Field', category: 'Text & Fields', content: '<div class="narrative" data-doku-component="data-field" data-doku-binding="pcr.assessment" data-doku-label="Assessment / notes">Sample multiline content. The field expands naturally to fit text.</div>', media: 'TXT' },
  { id: 'doku-org-info', label: 'Organization Info', category: 'DokuEMS Fields', content: '<section class="brand-row"><div class="brand"><div class="brand-mark">D+</div><div><div class="brand-name" data-doku-binding="organisation.name">Organization name</div><div class="brand-contact" data-doku-binding="organisation.address">Organization address</div><div class="brand-contact"><span data-doku-binding="organisation.phone">Phone</span> · <span data-doku-binding="organisation.email">Email</span></div></div></div></section>', media: 'ORG' },
  { id: 'doku-invoice-info', label: 'Invoice Information', category: 'DokuEMS Fields', content: '<div class="info-card"><div class="info-label">Invoice Information</div><div class="meta-row"><span>Invoice No.</span><strong data-doku-binding="invoice.invoiceNumber">INV-SAMPLE-0001</strong></div><div class="meta-row"><span>Invoice Date</span><strong data-doku-binding="invoice.date">12 Oct 2026</strong></div><div class="meta-row"><span>Case No.</span><strong data-doku-binding="case.caseNumber">26-SAMPLE-001</strong></div></div>', media: 'INV' },
  { id: 'doku-customer-info', label: 'Bill To / Customer', category: 'DokuEMS Fields', content: '<div class="info-card"><div class="info-label">Bill To</div><div class="info-value" data-doku-binding="invoice.billTo">Sample Customer Sdn Bhd</div><div class="info-value" data-doku-binding="invoice.address">Sample billing address</div></div>', media: 'TO' },
  { id: 'doku-service-info', label: 'Service Details', category: 'DokuEMS Fields', content: '<div class="info-card"><div class="info-label">Service Details</div><div class="meta-row"><span>Service</span><strong data-doku-binding="invoice.serviceName">Ambulance Transport</strong></div><div class="meta-row"><span>Status</span><strong data-doku-binding="invoice.status">Outstanding</strong></div></div>', media: 'SVC' },
  { id: 'doku-items-table', label: 'Charges / SST Table', category: 'Tables & Totals', content: `<div class="items-wrap">${itemsTable}</div>`, media: 'TABLE' },
  { id: 'doku-payment-table', label: 'Payment Table', category: 'Tables & Totals', content: `<div class="items-wrap">${paymentTable}</div>`, media: 'PAY' },
  { id: 'doku-totals', label: 'Invoice Totals', category: 'Tables & Totals', content: '<table class="totals" data-doku-component="totals-table"><tbody><tr><td>Subtotal (RM)</td><td class="num" data-doku-binding="invoice.subtotal">100.00</td></tr><tr><td>SST (RM)</td><td class="num" data-doku-binding="invoice.sstAmount">6.00</td></tr><tr class="grand-total"><td>Total (RM)</td><td class="num" data-doku-binding="invoice.total">106.00</td></tr><tr><td>Amount received (RM)</td><td class="num" data-doku-binding="invoice.amountReceived">0.00</td></tr><tr><td>Outstanding (RM)</td><td class="num" data-doku-binding="invoice.outstanding">106.00</td></tr></tbody></table>', media: 'Σ' },
  { id: 'doku-qr', label: 'QR Code (placeholder)', category: 'Codes & Signatures', content: '<div class="doku-qr-block" data-doku-component="qr-code" data-doku-binding="payment.qrPayload" data-doku-label="Payment QR"><div class="qr-placeholder" role="img" aria-label="QR code placeholder">QR<br>PLACEHOLDER</div><div class="tiny muted doku-code-caption">Payment reference</div></div>', media: 'QR' },
  { id: 'doku-barcode', label: 'Barcode (placeholder)', category: 'Codes & Signatures', content: '<div class="doku-barcode-block" data-doku-component="barcode" data-doku-binding="invoice.invoiceNumber" data-doku-symbology="CODE128" data-doku-label="Invoice barcode"><div class="fake-code" role="img" aria-label="Barcode placeholder"></div><div class="tiny muted doku-code-caption">INV-SAMPLE-0001</div></div>', media: '||||' },
  { id: 'doku-signature', label: 'Signature Block', category: 'Codes & Signatures', content: '<div class="doku-signature-block" data-doku-component="signature" data-doku-label="Authorized signature"><div class="signature-line"></div><div class="signature-label">Authorized signature</div></div>', media: 'SIGN' },
  { id: 'doku-approval-stamp', label: 'Approval Stamp', category: 'Codes & Signatures', content: '<div class="doku-approval-stamp" data-doku-component="approval-stamp" data-doku-label="Approval stamp">APPROVED</div>', media: 'OK' },
  { id: 'doku-checkbox', label: 'Checkbox / Tick', category: 'Codes & Signatures', content: '<span class="doku-checkbox-control" data-doku-component="checkbox"><span class="doku-checkbox-box">✓</span><span>Confirmed</span></span>', media: '☑' },
  { id: 'doku-divider', label: 'Divider Line', category: 'Layout', content: '<hr class="doku-divider" data-doku-component="divider" />', media: '―' },
  { id: 'doku-outline-box', label: 'Bordered Box', category: 'Layout', content: '<div class="doku-outline-box" data-doku-component="box">Content area</div>', media: '□' },
  { id: 'doku-two-col', label: 'Two Columns', category: 'Layout', content: '<div class="two-col"><div class="info-card">Left column</div><div class="info-card">Right column</div></div>', media: 'Ⅱ' },
  { id: 'doku-three-col', label: 'Three Columns', category: 'Layout', content: '<div class="three-col"><div class="info-card">Column 1</div><div class="info-card">Column 2</div><div class="info-card">Column 3</div></div>', media: 'Ⅲ' },
  { id: 'doku-note', label: 'Notes / Terms', category: 'Layout', content: '<div class="note-box" data-doku-component="notes"><strong>Notes / Terms</strong><p>Add payment terms, instructions or supporting notes here.</p></div>', media: '¶' },
  { id: 'doku-page-number', label: 'Page Number (placeholder)', category: 'Layout', content: '<div class="doku-page-number" data-doku-component="page-number" data-doku-format="Page {page}">Page 1</div>', media: '#P' },
  { id: 'doku-spacer', label: 'Vertical Spacer', category: 'Layout', content: '<div class="doku-spacer" data-doku-component="spacer" style="height:8mm"></div>', media: '↕' },
  { id: 'doku-page-break', label: 'Page Break', category: 'Layout', content: '<div data-doku-component="page-break" style="border-top:2px dashed #9aabbc;margin:12mm 0;padding-top:2mm;color:#65758a;font-size:9pt;break-before:page">Page break (preview marker)</div>', media: '↵' },
  { id: 'doku-image', label: 'Image / Logo', category: 'Media', content: { type: 'image' }, media: '▧' },
];

export function configureDokuEmsEditor(editor: AnyEditor, documentType: DokuDocumentType) {
  editor.DomComponents.addType('doku-binding', {
    isComponent: (element: Element) => element?.nodeType === 1 && element.hasAttribute('data-doku-binding')
      ? { type: 'doku-binding' }
      : false,
    model: {
      defaults: {
        name: 'DokuEMS Data Field',
        traits: [
          { type: 'text', name: 'data-doku-binding', label: 'Data binding' },
          { type: 'text', name: 'data-doku-label', label: 'Field label' },
          { type: 'text', name: 'data-doku-format', label: 'Format (optional)' },
        ],
      },
    },
  });

  editor.DomComponents.addType('doku-repeating-table', {
    isComponent: (element: Element) => element?.nodeType === 1 && element.getAttribute('data-doku-component') === 'items-table'
      ? { type: 'doku-repeating-table' }
      : false,
    model: {
      defaults: {
        name: 'DokuEMS Repeating Table',
        traits: [
          { type: 'text', name: 'data-doku-repeat', label: 'Row collection binding' },
          { type: 'text', name: 'data-doku-component', label: 'Component type' },
          { type: 'text', name: 'data-doku-label', label: 'Table label' },
        ],
      },
    },
  });

  editor.DomComponents.addType('doku-visual-component', {
    isComponent: (element: Element) => element?.nodeType === 1
      && element.hasAttribute('data-doku-component')
      && !['items-table', 'barcode', 'qr-code'].includes(element.getAttribute('data-doku-component') ?? '')
      ? { type: 'doku-visual-component' }
      : false,
    model: {
      defaults: {
        name: 'DokuEMS Component',
        traits: [
          { type: 'text', name: 'data-doku-component', label: 'Component type' },
          { type: 'text', name: 'data-doku-binding', label: 'Data binding (optional)' },
          { type: 'text', name: 'data-doku-label', label: 'Field label (optional)' },
          { type: 'text', name: 'data-doku-format', label: 'Format (optional)' },
        ],
      },
    },
  });

  editor.DomComponents.addType('doku-qr-code', {
    isComponent: (element: Element) => element?.nodeType === 1 && element.getAttribute('data-doku-component') === 'qr-code'
      ? { type: 'doku-qr-code' }
      : false,
    model: {
      defaults: {
        name: 'DokuEMS QR Code Placeholder',
        traits: [
          { type: 'text', name: 'data-doku-binding', label: 'QR payload binding' },
          { type: 'text', name: 'data-doku-label', label: 'Label' },
        ],
      },
    },
  });

  editor.DomComponents.addType('doku-barcode', {
    isComponent: (element: Element) => element?.nodeType === 1 && element.getAttribute('data-doku-component') === 'barcode'
      ? { type: 'doku-barcode' }
      : false,
    model: {
      defaults: {
        name: 'DokuEMS Barcode Placeholder',
        traits: [
          { type: 'text', name: 'data-doku-binding', label: 'Barcode data binding' },
          { type: 'select', name: 'data-doku-symbology', label: 'Barcode format', options: [
            { id: 'CODE128', name: 'Code 128' },
            { id: 'CODE39', name: 'Code 39' },
            { id: 'EAN13', name: 'EAN-13' },
          ] },
          { type: 'text', name: 'data-doku-label', label: 'Label' },
        ],
      },
    },
  });

  DOKUEMS_TOOL_BLOCKS.forEach(tool => {
    editor.Blocks.add(tool.id, {
      label: tool.label,
      category: tool.category,
      content: tool.content,
      ...(tool.media ? { media: tool.media } : {}),
      attributes: { title: `Add ${tool.label}` },
    });
  });

  const root = editor.getWrapper?.();
  if (root) root.addAttributes({ 'data-doku-document-type': documentType, 'data-doku-engine': 'grapesjs-poc' });
}
