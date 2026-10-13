# Doku Report Designer

React + TypeScript report designer prototype using GrapesJS with a Playwright-powered PDF preview and Excel `.xlsx` export. Includes sample Invoice, Payment Receipt and PCR templates.

## Requirements
- Node.js 20 or newer recommended
- npm

## Run locally (Windows PowerShell)
```powershell
npm.cmd install
npm.cmd run install:browser
npm.cmd run dev
```

Open the local URL Vite prints. Run tests with `npm.cmd test` and production build with `npm.cmd run build`.

## Current limitations
This is a standalone prototype using synthetic sample data. It is not connected to live DokuEMS records. QR/barcode sample elements and document-specific bindings are prototypes; validate multipage rendering and business rules before production use.

## License
MIT; see [LICENSE](LICENSE).