# DokuEMS GrapesJS PDF Preview — Verification Report

## Implemented

- Replaced the in-app HTML preview modal with **Preview PDF**.
- Added a local Node.js PDF service at `server/pdf-server.mjs`, using Playwright/Chromium to generate A4 PDF bytes from the current GrapesJS HTML and CSS.
- Added a PDF iframe viewer, loading and safe-error states, retry, and PDF download. Object URLs are revoked when the preview closes, is replaced, or the component unmounts.
- Added an API response validator that checks both `Content-Type: application/pdf` and the `%PDF-` signature.
- Added A4 print styling, background printing, table header repetition, and page-break hooks for the prototype components.
- The preview server binds only to `127.0.0.1`, limits request size, disables page JavaScript, blocks non-local/network resource requests, strips script-capable markup/inline event handlers and external CSS imports/URLs, and does not log rendered template contents.
- `npm run dev` starts Vite on `127.0.0.1:5181` and the PDF service on `127.0.0.1:5182`; Vite proxies `/api` to the service. `npm start` serves the production build plus PDF endpoint on port 5182.
- Added unit tests for the PDF request/response contract and the safe A4 HTML wrapper.
- Fixed 8 strict-null TypeScript errors in `src/App.tsx` so `npm run build` completes: the nullable GrapesJS accessors (`Canvas.getDocument()`, `getContainer()`, `getWrapper()`) are guarded and an absent `getCss()` defaults to an empty string. Behaviour is unchanged; the Fit commands report the existing "canvas is still loading" status instead of throwing.

## Verified locally

Verified on Windows (Node 24, npm 11) on 2026-10-14 against commit `c9f9015` on branch `feature/restore-report-designer`:

- `npm ci` completed: 213 packages.
- `npm test` (vitest): **20/20 tests passed** across 4 files — `src/workspaceSizing.test.ts` (3), `server/pdf-document.test.mjs` (4), `src/pdfPreview.test.ts` (5), `src/dokuemsTemplates.test.ts` (8).
- `npm run build` (`tsc -b && vite build`) **succeeded** and produced `dist/` (`index.html` plus hashed JS/CSS assets).
- `npm run dev` started both services: Vite on `http://127.0.0.1:5181` and the PDF service on `http://127.0.0.1:5182`. `GET /api/health` through the Vite proxy returned `{"status":"ready","service":"local-pdf-preview"}`.
- The **editor loaded** in Chrome with the GrapesJS canvas, the DokuEMS component palette, the document-type selector, Fit Page and the **Preview PDF** control present.
- **Real Chromium PDF previews succeeded** through the Vite proxy for all three document types: **Invoice** (27,781 bytes), **Payment Receipt** (29,538 bytes) and **PCR** (26,631 bytes), each beginning with the `%PDF-` signature.
- Request guards returned the expected statuses: unsupported document type `400`, empty template `400`, malformed JSON `400`.

## Still not verified

- No visual/raster comparison of the generated PDFs: verification covered the HTTP contract, the `%PDF-` signature and byte sizes. Page-break behaviour, table header repetition and A4 fit were not inspected visually.
- `npm start` (production `dist` plus the PDF endpoint on port 5182) was not exercised; only `npm run dev` was.
- The Playwright browser install step (`npm run install:browser`) was not exercised because a compatible Chromium build was already cached on the verifying machine. If Chromium installation is blocked, the Preview PDF button shows an installation hint.
- This is standalone, local-only PDF generation. It uses synthetic template content, is not integrated with DokuEMS auth/APIs/publishing, and must not be used with real patient data.
- The custom QR/barcode/page-number components remain visual placeholders until the prototype implements real code generation and pagination semantics.
- Excel workbook (`.xlsx`) export is not implemented anywhere in this prototype. The only exports are the project JSON and the PDF preview download.

## Safety notes

- GrapesJS Core remains the BSD-3-Clause licensed editor; the separate GrapesJS Studio SDK is not used.
- Playwright is used only for local server-side preview. Network resource requests and page scripting are disabled for the template render.
- Production integration requires proper DokuEMS template validation, binding allowlists, authorization, versioned format metadata, rendering tests, and legacy PDFsharp compatibility policy.
