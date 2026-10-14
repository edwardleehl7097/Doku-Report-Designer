import { describe, expect, it, vi } from 'vitest';
import { pdfPreviewFilename, requestPdfPreview } from './pdfPreview';

const payload = {
  documentType: 'Invoice' as const,
  title: 'Invoice',
  html: '<main class="doc-page">Synthetic invoice</main>',
  css: '.doc-page{width:210mm}',
};

function pdfResponse() {
  return new Response(new Blob(['%PDF-1.7\nsynthetic PDF bytes']), {
    status: 200,
    headers: { 'Content-Type': 'application/pdf', 'Cache-Control': 'no-store' },
  });
}

describe('Playwright PDF preview client', () => {
  it('posts the current document type, HTML and CSS and accepts a real PDF response', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(pdfResponse());
    const blob = await requestPdfPreview(payload, fetcher);

    expect(fetcher).toHaveBeenCalledWith('/api/pdf', expect.objectContaining({
      method: 'POST',
      cache: 'no-store',
      headers: expect.objectContaining({ Accept: 'application/pdf, application/json' }),
      body: JSON.stringify(payload),
    }));
    expect(blob.type).toContain('application/pdf');
    expect(new TextDecoder().decode(await blob.slice(0, 5).arrayBuffer())).toBe('%PDF-');
  });

  it('shows a safe server problem message for render failures', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify({ message: 'Chromium is not installed.' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    }));
    await expect(requestPdfPreview(payload, fetcher)).rejects.toThrow('Chromium is not installed.');
  });

  it('rejects HTML returned by a misconfigured preview server', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response('<html>not a PDF</html>', {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    }));
    await expect(requestPdfPreview(payload, fetcher)).rejects.toThrow('did not return a PDF');
  });

  it('rejects a PDF content type with an invalid file signature', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response(new Blob(['not actually a PDF']), {
      status: 200,
      headers: { 'Content-Type': 'application/pdf' },
    }));
    await expect(requestPdfPreview(payload, fetcher)).rejects.toThrow('invalid PDF');
  });

  it('provides predictable download names for all supported document types', () => {
    expect(pdfPreviewFilename('Invoice')).toBe('dokuems-invoice-preview.pdf');
    expect(pdfPreviewFilename('PaymentReceipt')).toBe('dokuems-payment-receipt-preview.pdf');
    expect(pdfPreviewFilename('Pcr')).toBe('dokuems-pcr-preview.pdf');
  });
});
