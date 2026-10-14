# DokuEMS HTML/CSS + Playwright Rendering — Migration Plan

## Do not switch production rendering in one step

DokuEMS currently has immutable versions using its existing fixed-layout template schema and PDF renderer. The GrapesJS proof of concept produces HTML/CSS plus GrapesJS project JSON. These formats are not directly interchangeable; automatic lossless conversion should not be assumed.

## Proposed versioned format

A new template version would need an explicit format/renderer identity, for example:

```json
{
  "format": "dokuems-html-template",
  "schemaVersion": 1,
  "renderer": "playwright-chromium",
  "documentType": "Invoice",
  "projectData": {},
  "html": "...validated document body...",
  "css": "...validated print styles...",
  "bindings": ["organisation.name", "invoice.total", "charges.rows"]
}
```

This is a proposal for evaluation, **not an approved production contract**. It needs formal server-side validation, versioning and API tests before adoption.

## Rendering requirements

- Run Chromium/Playwright in the server environment, not in the user's browser.
- Keep browser instances in a managed service; do not launch a new browser process for every request.
- Use A4 print CSS (`@page { size: A4; margin: ... }`) and explicit print-color settings.
- Resolve only approved DokuEMS bindings. Encode all data as text/attributes; never concatenate untrusted data into executable markup.
- Allow only approved elements, CSS properties, asset IDs and local assets. Block scripts, arbitrary custom code, external URLs, file URLs and uncontrolled network access.
- Test long organization addresses, names, invoice details, currency, SST headings, repeating tables, page breaks, headers/footers, QR/barcode generation, and multipage PCRs with synthetic data.
- Define behavior for text overflow, table pagination, repeated headers, signature blocks and page numbering. Do not silently truncate financial or clinical values.
- Return no-store PDFs, enforce authorization and request limits, and avoid logging patient data or rendered document content.
- Use the same renderer service for preview and final generation so the preview matches the PDF.

## Legacy document safety

Do not remove PDFsharp from production immediately. Existing versions contain the legacy schema; some document types rely on version pins rather than a stored PDF snapshot. Keep the legacy renderer available for those versions. New template versions can use the new renderer after acceptance. A migration of old template versions must be a separately approved, reversible project that never edits issued-document history.

## Rollout gates

1. Frontend proof of concept: editor controls, save/reload, export and synthetic PDF preview.
2. Server proof of concept: isolated local Playwright render endpoint for the current synthetic GrapesJS layout; no database/business data. The endpoint exists in `server/pdf-server.mjs` and is not connected to production APIs.
3. Binding prototype: approved DokuEMS schema, allowlisted bindings and row expansion.
4. Parity tests: visual/PDF checks across Invoice, Receipt and multipage PCR.
5. Controlled versioned integration: new renderer versions only; legacy versions remain readable.
6. Browser acceptance, authorization tests, security review, performance/load testing and operational deployment review before production enablement.
