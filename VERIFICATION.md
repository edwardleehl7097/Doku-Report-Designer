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

## Not verified here

- This environment does not have the project's installed node_modules or a Playwright Chromium browser. Full `npm install`, `npm test`, `npm run build`, and actual PDF raster/visual checks could not yet be completed here.
- On the user's Windows machine, run `npm.cmd install`, then `npm.cmd run install:browser`, then `npm.cmd run dev`. If Chromium installation is blocked, the Preview PDF button will show an installation hint.
- This is standalone, local-only PDF generation. It uses synthetic template content, is not integrated with DokuEMS auth/APIs/publishing, and must not be used with real patient data.
- The custom QR/barcode/page-number components remain visual placeholders until the prototype implements real code generation and pagination semantics.

## Safety notes

- GrapesJS Core remains the BSD-3-Clause licensed editor; the separate GrapesJS Studio SDK is not used.
- Playwright is used only for local server-side preview. Network resource requests and page scripting are disabled for the template render.
- Production integration requires proper DokuEMS template validation, binding allowlists, authorization, versioned format metadata, rendering tests, and legacy PDFsharp compatibility policy.
