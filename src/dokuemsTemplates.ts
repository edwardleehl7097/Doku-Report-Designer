export type DokuDocumentType = 'Invoice' | 'PaymentReceipt' | 'Pcr';

export interface TemplateSeed {
  title: string;
  html: string;
  css: string;
}

const commonCss = `
*{box-sizing:border-box}
.doc-page{width:210mm;min-height:297mm;background:#fff;color:#18283c;margin:0 auto;padding:13mm 14mm 12mm;font-family:Arial,Helvetica,sans-serif;font-size:10pt;line-height:1.35;box-shadow:0 2px 18px rgba(17,37,60,.12);}
.doc-page h1,.doc-page h2,.doc-page h3,.doc-page p{margin-top:0}
.doc-page h1{font-size:23pt;letter-spacing:.5px;margin:0;color:#0e2b48}
.doc-page h2{font-size:12pt;margin:0 0 6px;color:#0e2b48}
.doc-page .muted{color:#65758a}
.doc-page .tiny{font-size:8.5pt}
.doc-page .brand-row{display:flex;justify-content:space-between;gap:12mm;align-items:flex-start;border-bottom:1px solid #dce5ef;padding-bottom:7mm;margin-bottom:7mm}
.doc-page .brand{display:grid;grid-template-columns:16mm minmax(0,1fr);gap:4mm;align-items:start;max-width:118mm}
.doc-page .brand-mark{height:16mm;width:16mm;border-radius:5mm;background:#0879a9;color:#fff;display:flex;align-items:center;justify-content:center;font-size:20pt;font-weight:700}
.doc-page .brand-name{font-size:15pt;font-weight:700;color:#12324f;margin-bottom:2mm}
.doc-page .brand-contact{font-size:8.5pt;line-height:1.45;color:#3f5267;overflow-wrap:anywhere}
.doc-page .doc-title{min-width:46mm;text-align:right}
.doc-page .doc-title .subtitle{margin-top:2mm;font-size:9pt;color:#62748a}
.doc-page .meta-box{border:1px solid #dce5ef;padding:3mm;margin-top:4mm;font-size:8.5pt}
.doc-page .meta-row{display:grid;grid-template-columns:minmax(24mm, .8fr) minmax(22mm,1.2fr);gap:3mm;padding:1.3mm 0;border-bottom:1px solid #e9eef4;overflow-wrap:anywhere}
.doc-page .meta-row:last-child{border-bottom:0}
.doc-page .two-col{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr);gap:8mm;margin-bottom:7mm}
.doc-page .three-col{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:5mm;margin-bottom:7mm}
.doc-page .info-card{border:1px solid #dce5ef;border-radius:2mm;padding:4mm;min-width:0;overflow-wrap:anywhere}
.doc-page .info-label{font-size:8pt;text-transform:uppercase;letter-spacing:.4px;color:#65758a;margin-bottom:2mm;font-weight:700}
.doc-page .info-value{min-height:5mm;overflow-wrap:anywhere;white-space:normal}
.doc-page .items-wrap{margin:5mm 0 7mm;max-width:100%;}
.doc-page table{width:100%;border-collapse:collapse;table-layout:fixed;font-size:8.5pt;}
.doc-page th{background:#eaf2fa;color:#19344e;font-weight:700;text-align:left;white-space:normal;overflow-wrap:anywhere;vertical-align:bottom}
.doc-page th,.doc-page td{border:1px solid #d3deea;padding:2.5mm 2mm;vertical-align:top;overflow-wrap:anywhere;word-break:normal;}
.doc-page td.num,.doc-page th.num{text-align:right;font-variant-numeric:tabular-nums;}
.doc-page tbody tr:nth-child(even){background:#f8fafc}
.doc-page .bottom-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(65mm,.8fr);gap:9mm;align-items:start;margin-top:5mm}
.doc-page .note-box{font-size:8.5pt;color:#43566c;overflow-wrap:anywhere}
.doc-page .totals{width:100%;font-size:9pt}
.doc-page .totals td{padding:2.3mm 2.5mm}
.doc-page .totals td:first-child{width:62%}
.doc-page .totals .grand-total td{background:#e7f1fb;font-size:11pt;font-weight:700;color:#112d49}
.doc-page .footer-row{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6mm;align-items:end;border-top:1px solid #dce5ef;margin-top:9mm;padding-top:6mm}
.doc-page .fake-code{height:23mm;border:1px solid #ccd8e5;background:repeating-linear-gradient(90deg,#15283b 0 1px,#fff 1px 3px,#15283b 3px 5px,#fff 5px 7px);}
.doc-page .qr-placeholder{height:24mm;width:24mm;border:2px solid #263b50;display:flex;align-items:center;justify-content:center;font-size:7pt;font-weight:700;text-align:center;color:#263b50;background:repeating-conic-gradient(#23384c 0 25%,#fff 0 50%) 0/5mm 5mm;}
.doc-page .signature-line{height:12mm;border-bottom:1px solid #718096;margin-bottom:2mm}
.doc-page .signature-label{font-size:8pt;color:#65758a;text-align:center}
.doc-page .doku-label{display:inline-block;font-weight:700;color:#30475e;padding:1mm 0}
.doc-page .doku-data-field{display:inline-block;min-width:24mm;min-height:5mm;border-bottom:1px dashed #b7c6d5;padding:1mm 0;overflow-wrap:anywhere}
.doc-page .doku-outline-box{border:1px solid #c8d5e2;border-radius:1.5mm;padding:4mm;min-height:12mm;overflow-wrap:anywhere}
.doc-page .doku-checkbox-control{display:inline-flex;align-items:center;gap:2mm;font-size:9pt}
.doc-page .doku-checkbox-box{display:inline-grid;place-items:center;width:5mm;height:5mm;border:1px solid #61778b;color:#0879a9;font-weight:700}
.doc-page .doku-approval-stamp{display:inline-flex;align-items:center;justify-content:center;border:2px solid #13836b;color:#13836b;padding:2mm 4mm;font-weight:800;letter-spacing:1px;transform:rotate(-3deg)}
.doc-page .doku-code-caption{margin-top:1.5mm;text-align:center;overflow-wrap:anywhere}
.doc-page .doku-page-number{text-align:right;font-size:8pt;color:#65758a;padding:2mm 0}
.doc-page .doku-divider{border:0;border-top:1px solid #b9c7d4;margin:4mm 0}
.doc-page .doku-spacer{min-height:2mm}
.doc-page .section-title{background:#f0f5fa;border-left:3px solid #0879a9;padding:2.5mm 3mm;font-weight:700;font-size:9.5pt;margin:6mm 0 3mm}
.doc-page .narrative{min-height:17mm;border:1px solid #dce5ef;padding:3mm;overflow-wrap:anywhere;white-space:pre-wrap}
.doc-page .callout{padding:3mm 4mm;background:#f7fafc;border:1px solid #dce5ef;border-radius:1.5mm;overflow-wrap:anywhere}
.doc-page .page-footer{margin-top:9mm;padding-top:3mm;border-top:1px solid #dce5ef;display:flex;justify-content:space-between;font-size:8pt;color:#65758a}
`;

const invoiceHtml = `
<main class="doc-page invoice-page" data-doku-template="Invoice">
  <header class="brand-row">
    <div class="brand">
      <div class="brand-mark">D+</div>
      <div>
        <div class="brand-name" data-doku-binding="organisation.name">DokuEMS Medical Services</div>
        <div class="brand-contact" data-doku-binding="organisation.address">12 Jalan Medika, Taman Kesihatan<br>11950 Bayan Baru, Penang, Malaysia</div>
        <div class="brand-contact"><span data-doku-binding="organisation.phone">+60 4-555 0100</span> &nbsp; <span data-doku-binding="organisation.email">billing@example.test</span></div>
      </div>
    </div>
    <div class="doc-title">
      <h1>INVOICE</h1>
      <div class="meta-box">
        <div class="meta-row"><span>Invoice No.</span><strong data-doku-binding="invoice.invoiceNumber">INV-SAMPLE-0001</strong></div>
        <div class="meta-row"><span>Invoice Date</span><strong data-doku-binding="invoice.date">12 Oct 2026</strong></div>
        <div class="meta-row"><span>Case No.</span><strong data-doku-binding="case.caseNumber">26-SAMPLE-001</strong></div>
      </div>
    </div>
  </header>
  <section class="two-col">
    <div class="info-card">
      <div class="info-label">Bill To</div>
      <div class="info-value" data-doku-binding="invoice.billTo">Sample Customer Sdn Bhd</div>
      <div class="info-value" data-doku-binding="invoice.address">Level 8, Menara Sample, Jalan Utama, 11950 Bayan Baru, Penang</div>
    </div>
    <div class="info-card">
      <div class="info-label">Service Details</div>
      <div class="meta-row"><span>Service</span><strong data-doku-binding="invoice.serviceName">Ambulance Transport</strong></div>
      <div class="meta-row"><span>Payment status</span><strong data-doku-binding="invoice.status">Outstanding</strong></div>
    </div>
  </section>
  <div class="section-title">Charges</div>
  <div class="items-wrap">
    <table class="doku-items-table" data-doku-component="items-table" data-doku-repeat="charges.rows">
      <colgroup><col style="width:39%"><col style="width:10%"><col style="width:17%"><col style="width:13%"><col style="width:21%"></colgroup>
      <thead><tr><th>Description</th><th class="num">Qty</th><th class="num">Unit Price (RM)</th><th class="num">SST %</th><th class="num">Amount (RM)</th></tr></thead>
      <tbody>
        <tr data-doku-row-sample="true"><td data-doku-column="description">Ambulance transport service</td><td class="num" data-doku-column="quantity">1</td><td class="num" data-doku-column="unitPrice">180.00</td><td class="num" data-doku-column="sstPercentage">6%</td><td class="num" data-doku-column="lineAmount">190.80</td></tr>
        <tr data-doku-row-sample="true"><td data-doku-column="description">Medical attendant</td><td class="num" data-doku-column="quantity">1</td><td class="num" data-doku-column="unitPrice">80.00</td><td class="num" data-doku-column="sstPercentage">6%</td><td class="num" data-doku-column="lineAmount">84.80</td></tr>
      </tbody>
    </table>
  </div>
  <div class="bottom-grid">
    <div class="note-box"><strong>Notes</strong><p data-doku-binding="invoice.notes">Thank you. Please quote the invoice number when making payment.</p><div class="callout">This is a synthetic design preview. Amounts and identifiers are sample values only.</div></div>
    <table class="totals"><tbody>
      <tr><td>Subtotal (RM)</td><td class="num" data-doku-binding="invoice.subtotal">260.00</td></tr>
      <tr><td>SST (RM)</td><td class="num" data-doku-binding="invoice.sstAmount">15.60</td></tr>
      <tr class="grand-total"><td>Total (RM)</td><td class="num" data-doku-binding="invoice.total">275.60</td></tr>
      <tr><td>Amount received (RM)</td><td class="num" data-doku-binding="invoice.amountReceived">0.00</td></tr>
      <tr><td>Outstanding (RM)</td><td class="num" data-doku-binding="invoice.outstanding">275.60</td></tr>
    </tbody></table>
  </div>
  <footer class="footer-row">
    <div><div class="qr-placeholder" data-doku-component="qr-code" data-doku-binding="payment.qrPayload">QR<br>PLACEHOLDER</div><div class="tiny muted" style="margin-top:2mm">Payment QR</div></div>
    <div><div class="fake-code" data-doku-component="barcode" data-doku-binding="invoice.invoiceNumber"></div><div class="tiny muted" style="text-align:center;margin-top:2mm">Invoice reference</div></div>
    <div><div class="signature-line" data-doku-component="signature"></div><div class="signature-label">Authorized signature</div></div>
  </footer>
  <div class="page-footer"><span data-doku-binding="organisation.name">DokuEMS Medical Services</span><span>Page 1</span></div>
</main>`;

const receiptHtml = `
<main class="doc-page receipt-page" data-doku-template="PaymentReceipt">
  <header class="brand-row">
    <div class="brand"><div class="brand-mark">D+</div><div><div class="brand-name" data-doku-binding="organisation.name">DokuEMS Medical Services</div><div class="brand-contact" data-doku-binding="organisation.address">12 Jalan Medika, Taman Kesihatan<br>11950 Bayan Baru, Penang, Malaysia</div><div class="brand-contact"><span data-doku-binding="organisation.phone">+60 4-555 0100</span> · <span data-doku-binding="organisation.email">billing@example.test</span></div></div></div>
    <div class="doc-title"><h1>RECEIPT</h1><div class="meta-box"><div class="meta-row"><span>Receipt No.</span><strong data-doku-binding="receipt.receiptNumber">RCT-SAMPLE-0001</strong></div><div class="meta-row"><span>Payment Date</span><strong data-doku-binding="payment.date">12 Oct 2026</strong></div><div class="meta-row"><span>Method</span><strong data-doku-binding="payment.method">Bank transfer</strong></div></div></div>
  </header>
  <section class="two-col">
    <div class="info-card"><div class="info-label">Received From</div><div class="info-value" data-doku-binding="invoice.billTo">Sample Customer Sdn Bhd</div><div class="info-value" data-doku-binding="invoice.address">Level 8, Menara Sample, Penang</div></div>
    <div class="info-card"><div class="info-label">Payment Reference</div><div class="meta-row"><span>Invoice No.</span><strong data-doku-binding="invoice.invoiceNumber">INV-SAMPLE-0001</strong></div><div class="meta-row"><span>Case No.</span><strong data-doku-binding="case.caseNumber">26-SAMPLE-001</strong></div></div>
  </section>
  <div class="section-title">Payment Details</div>
  <table class="doku-items-table" data-doku-component="items-table" data-doku-repeat="payments.rows"><colgroup><col style="width:48%"><col style="width:26%"><col style="width:26%"></colgroup><thead><tr><th>Description</th><th>Reference</th><th class="num">Amount (RM)</th></tr></thead><tbody><tr data-doku-row-sample="true"><td data-doku-column="description">Payment received</td><td data-doku-column="reference">TRX-SAMPLE-001</td><td data-doku-column="amount" class="num">100.00</td></tr></tbody></table>
  <div class="bottom-grid"><div class="note-box"><strong>Payment Note</strong><p data-doku-binding="payment.notes">Thank you. Please retain this receipt for your records.</p><div class="callout">Receipt confirms the payment amount listed. It does not necessarily indicate that the full invoice balance is settled.</div></div><table class="totals"><tbody><tr><td>Amount received (RM)</td><td class="num" data-doku-binding="payment.amount">100.00</td></tr><tr><td>Invoice total (RM)</td><td class="num" data-doku-binding="invoice.total">275.60</td></tr><tr class="grand-total"><td>Balance outstanding (RM)</td><td class="num" data-doku-binding="invoice.outstanding">175.60</td></tr></tbody></table></div>
  <footer class="footer-row"><div><div class="qr-placeholder" data-doku-component="qr-code" data-doku-binding="payment.qrPayload">QR<br>PLACEHOLDER</div><div class="tiny muted" style="margin-top:2mm">Payment reference</div></div><div><div class="fake-code" data-doku-component="barcode" data-doku-binding="receipt.receiptNumber"></div><div class="tiny muted" style="text-align:center;margin-top:2mm">Receipt reference</div></div><div><div class="signature-line" data-doku-component="signature"></div><div class="signature-label">Received by</div></div></footer>
  <div class="page-footer"><span data-doku-binding="organisation.name">DokuEMS Medical Services</span><span>Page 1</span></div>
</main>`;

const pcrHtml = `
<main class="doc-page pcr-page" data-doku-template="Pcr">
  <header class="brand-row"><div class="brand"><div class="brand-mark">D+</div><div><div class="brand-name" data-doku-binding="organisation.name">DokuEMS Ambulance Services</div><div class="brand-contact" data-doku-binding="organisation.address">12 Jalan Medika, Taman Kesihatan, Penang</div><div class="brand-contact"><span data-doku-binding="organisation.phone">+60 4-555 0100</span> · <span data-doku-binding="organisation.email">operations@example.test</span></div></div></div><div class="doc-title"><h1 style="font-size:18pt">PATIENT CARE REPORT</h1><div class="meta-box"><div class="meta-row"><span>Case No.</span><strong data-doku-binding="case.caseNumber">26-SAMPLE-001</strong></div><div class="meta-row"><span>Report Date</span><strong data-doku-binding="pcr.reportDate">12 Oct 2026</strong></div></div></div></header>
  <div class="section-title">Patient and Incident</div><section class="three-col"><div class="info-card"><div class="info-label">Patient</div><div class="info-value" data-doku-binding="pcr.patientName">Sample Patient</div></div><div class="info-card"><div class="info-label">Date of Birth / Age</div><div class="info-value" data-doku-binding="pcr.patientAge">Adult</div></div><div class="info-card"><div class="info-label">Incident Time</div><div class="info-value" data-doku-binding="pcr.incidentTime">10:35</div></div><div class="info-card"><div class="info-label">Pickup Location</div><div class="info-value" data-doku-binding="pcr.pickupAddress">Sample pickup address, Penang</div></div><div class="info-card"><div class="info-label">Destination</div><div class="info-value" data-doku-binding="pcr.destinationAddress">Sample destination, Penang</div></div><div class="info-card"><div class="info-label">Crew</div><div class="info-value" data-doku-binding="pcr.crewNames">Sample Crew A; Sample Crew B</div></div></section>
  <div class="section-title">Clinical Assessment</div><div class="info-label">Chief complaint</div><div class="narrative" data-doku-binding="pcr.chiefComplaint">Sample clinical complaint for layout demonstration. Replace this text with authorized case data when integrated.</div><div class="info-label" style="margin-top:4mm">Assessment and care provided</div><div class="narrative" data-doku-binding="pcr.assessment">Synthetic assessment text demonstrating natural text wrapping and expanding document flow. No patient information is used in this prototype.</div>
  <div class="section-title">Vitals and Transport</div><table class="doku-items-table" data-doku-component="items-table" data-doku-repeat="pcr.vitals"><colgroup><col style="width:24%"><col style="width:19%"><col style="width:19%"><col style="width:19%"><col style="width:19%"></colgroup><thead><tr><th>Time</th><th>Blood pressure</th><th>Pulse</th><th>Respiratory rate</th><th>SpO₂</th></tr></thead><tbody><tr data-doku-row-sample="true"><td>10:40</td><td>120/80</td><td>82 bpm</td><td>16/min</td><td>98%</td></tr><tr data-doku-row-sample="true"><td>10:55</td><td>118/78</td><td>80 bpm</td><td>16/min</td><td>98%</td></tr></tbody></table>
  <div class="section-title">Handover</div><div class="narrative" data-doku-binding="pcr.handoverNotes">Synthetic handover notes. Confirm receiving staff, handover time and destination-specific details in the actual DokuEMS integration.</div>
  <div class="two-col" style="margin-top:12mm"><div><div class="signature-line" data-doku-component="signature"></div><div class="signature-label">Crew signature</div></div><div><div class="signature-line" data-doku-component="signature"></div><div class="signature-label">Receiving staff signature</div></div></div><div class="page-footer"><span>CONFIDENTIAL — authorized use only</span><span data-doku-binding="case.caseNumber">26-SAMPLE-001</span></div>
</main>`;

export const templateSeeds: Record<DokuDocumentType, TemplateSeed> = {
  Invoice: { title: 'Invoice', html: invoiceHtml, css: commonCss },
  PaymentReceipt: { title: 'Payment Receipt', html: receiptHtml, css: commonCss },
  Pcr: { title: 'Patient Care Report', html: pcrHtml, css: commonCss },
};

export const dokuBindingCatalog = [
  { category: 'Organization', items: ['organisation.name', 'organisation.address', 'organisation.phone', 'organisation.email'] },
  { category: 'Case', items: ['case.caseNumber'] },
  { category: 'Invoice', items: ['invoice.invoiceNumber', 'invoice.date', 'invoice.billTo', 'invoice.address', 'invoice.serviceName', 'invoice.status', 'invoice.subtotal', 'invoice.sstAmount', 'invoice.total', 'invoice.amountReceived', 'invoice.outstanding', 'invoice.notes'] },
  { category: 'Payment / Receipt', items: ['receipt.receiptNumber', 'payment.date', 'payment.method', 'payment.amount', 'payment.notes', 'payments.rows'] },
  { category: 'Charges', items: ['charges.rows'] },
  { category: 'PCR', items: ['pcr.reportDate', 'pcr.patientName', 'pcr.patientAge', 'pcr.incidentTime', 'pcr.pickupAddress', 'pcr.destinationAddress', 'pcr.crewNames', 'pcr.chiefComplaint', 'pcr.assessment', 'pcr.vitals', 'pcr.handoverNotes'] },
];

export interface DraftEnvelope {
  format: 'dokuems-grapesjs-poc';
  version: 1;
  documentType: DokuDocumentType;
  savedAt: string;
  projectData: unknown;
  html: string;
  css: string;
  note: 'Prototype only; not a production DokuEMS template.';
}

export function buildDraftEnvelope(documentType: DokuDocumentType, projectData: unknown, html: string, css: string): DraftEnvelope {
  return {
    format: 'dokuems-grapesjs-poc',
    version: 1,
    documentType,
    savedAt: new Date().toISOString(),
    projectData,
    html,
    css,
    note: 'Prototype only; not a production DokuEMS template.',
  };
}

export function isValidDraftEnvelope(value: unknown): value is DraftEnvelope {
  if (!value || typeof value !== 'object') return false;
  const draft = value as Partial<DraftEnvelope>;
  return draft.format === 'dokuems-grapesjs-poc'
    && draft.version === 1
    && ['Invoice', 'PaymentReceipt', 'Pcr'].includes(draft.documentType ?? '')
    && typeof draft.html === 'string'
    && typeof draft.css === 'string'
    && 'projectData' in draft;
}
