import type { DokuDocumentType } from './dokuemsTemplates';

export interface PdfPreviewRequest {
  documentType: DokuDocumentType;
  title: string;
  html: string;
  css: string;
}

const PDF_ENDPOINT = '/api/pdf';
const MAX_CLIENT_MARKUP_CHARS = 1_500_000;

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json();
    if (body && typeof body === 'object' && 'message' in body && typeof body.message === 'string') {
      return body.message;
    }
  } catch {
    // Proxy/server failures can return non-JSON text. Do not surface its internals.
  }
  return `PDF preview failed (HTTP ${response.status}).`;
}

export async function requestPdfPreview(
  payload: PdfPreviewRequest,
  fetcher: typeof fetch = fetch,
): Promise<Blob> {
  if (payload.html.length + payload.css.length > MAX_CLIENT_MARKUP_CHARS) {
    throw new Error('This design is too large to preview. Reduce embedded content and try again.');
  }

  let response: Response;
  try {
    response = await fetcher(PDF_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/pdf, application/json' },
      cache: 'no-store',
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error('The PDF preview service is unreachable. Start the app with npm run dev and try again.');
  }

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  const contentType = response.headers.get('content-type')?.toLowerCase() ?? '';
  if (!contentType.includes('application/pdf')) {
    throw new Error('The preview service did not return a PDF. Check that the PDF service is running.');
  }

  const blob = await response.blob();
  const signature = new TextDecoder().decode(await blob.slice(0, 5).arrayBuffer());
  if (signature !== '%PDF-') {
    throw new Error('The preview service returned an invalid PDF. No preview was opened.');
  }

  return blob;
}

export function pdfPreviewFilename(documentType: DokuDocumentType): string {
  const suffix = documentType === 'PaymentReceipt' ? 'payment-receipt' : documentType.toLowerCase();
  return `dokuems-${suffix}-preview.pdf`;
}
