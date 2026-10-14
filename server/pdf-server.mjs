import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import express from 'express';
import { chromium } from 'playwright';
import { buildPrintDocument, isSupportedDocumentType } from './pdf-document.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const port = Number.parseInt(process.env.DOKUEMS_PDF_PORT ?? '5182', 10);
const app = express();
let browserPromise;

app.disable('x-powered-by');
app.use(express.json({ limit: '2mb', strict: true }));

async function getBrowser() {
  if (!browserPromise) {
    browserPromise = chromium.launch({
      headless: true,
      args: ['--disable-dev-shm-usage'],
    }).catch(error => {
      browserPromise = undefined;
      throw error;
    });
  }
  const browser = await browserPromise;
  if (!browser.isConnected()) {
    browserPromise = undefined;
    return getBrowser();
  }
  return browser;
}

app.get('/api/health', (_req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({ status: 'ready', service: 'local-pdf-preview' });
});

app.post('/api/pdf', async (req, res) => {
  const { documentType, title, html, css } = req.body ?? {};
  if (!isSupportedDocumentType(documentType)) {
    res.status(400).json({ code: 'unsupported_document_type', message: 'Select Invoice, Payment Receipt or PCR before previewing.' });
    return;
  }
  if (typeof html !== 'string' || typeof css !== 'string' || html.trim().length === 0) {
    res.status(400).json({ code: 'invalid_template', message: 'The current design has no renderable document content.' });
    return;
  }
  if (html.length + css.length > 1_500_000) {
    res.status(413).json({ code: 'template_too_large', message: 'This design is too large to render. Reduce embedded content and try again.' });
    return;
  }

  let context;
  try {
    const document = buildPrintDocument({ documentType, title, html, css });
    const browser = await getBrowser();
    context = await browser.newContext({
      javaScriptEnabled: false,
      acceptDownloads: false,
      viewport: { width: 1240, height: 1754 },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();

    // The prototype renderer is local-only and must not fetch external resources.
    await page.route('**/*', route => {
      const requestUrl = route.request().url();
      if (/^(about:|data:|blob:)/i.test(requestUrl)) return route.continue();
      return route.abort();
    });

    await page.emulateMedia({ media: 'print' });
    await page.setContent(document, { waitUntil: 'load', timeout: 15_000 });
    await page.evaluate(async () => { await document.fonts.ready; return true; });
    const pdf = await page.pdf({
      format: 'A4',
      preferCSSPageSize: true,
      printBackground: true,
      displayHeaderFooter: false,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    });

    const safeType = documentType === 'PaymentReceipt' ? 'payment-receipt' : documentType.toLowerCase();
    res.status(200);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="dokuems-${safeType}-preview.pdf"`);
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.send(Buffer.from(pdf));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '';
    const browserMissing = /executable doesn't exist|browserType\.launch|please run the following command.*install/i.test(errorMessage);
    // Do not log template content or exception messages.
    console.error(`[pdf-preview] documentType=${documentType} errorType=${error instanceof Error ? error.name : 'UnknownError'}`);
    if (browserMissing) {
      res.status(503).json({ code: 'chromium_not_installed', message: 'PDF engine is not installed yet. Run npm run install:browser, then restart the app.' });
      return;
    }
    res.status(500).json({ code: 'pdf_render_failed', message: 'The PDF could not be generated. Check that the local PDF service is running and try again.' });
  } finally {
    await context?.close().catch(() => undefined);
  }
});

app.use((error, _req, res, _next) => {
  if (error?.type === 'entity.too.large') {
    res.status(413).json({ code: 'request_too_large', message: 'The design exceeds the preview request limit.' });
    return;
  }
  if (error instanceof SyntaxError && 'body' in error) {
    res.status(400).json({ code: 'invalid_json', message: 'The preview request is invalid.' });
    return;
  }
  res.status(400).json({ code: 'invalid_request', message: 'The preview request could not be processed.' });
});

if (existsSync(path.join(distDir, 'index.html'))) {
  app.use(express.static(distDir, { index: false }));
  app.get('*', (_req, res) => res.sendFile(path.join(distDir, 'index.html')));
}

const server = app.listen(port, '127.0.0.1', () => {
  console.log(`DokuEMS local PDF preview service listening on http://127.0.0.1:${port}`);
});

async function shutdown() {
  server.close();
  if (browserPromise) {
    try { (await browserPromise).close(); } catch { /* Browser may not have started. */ }
  }
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
