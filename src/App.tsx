import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import grapesjs from 'grapesjs';
import { buildDraftEnvelope, isValidDraftEnvelope, templateSeeds, type DokuDocumentType, type DraftEnvelope } from './dokuemsTemplates';
import { configureDokuEmsEditor, DOKUEMS_TOOL_BLOCKS } from './dokuemsPlugin';
import { clampEditorZoom, fitEditorZoom } from './workspaceSizing';
import { pdfPreviewFilename, requestPdfPreview } from './pdfPreview';

type EditorInstance = ReturnType<typeof grapesjs.init>;
type InspectorTab = 'styles' | 'traits' | 'layers';
type PreviewDocument = { title: string; documentType: DokuDocumentType; objectUrl?: string };

const DRAFT_PREFIX = 'dokuems-grapesjs-poc:draft:v1:';
const typeOptions: { value: DokuDocumentType; label: string }[] = [
  { value: 'Invoice', label: 'Invoice' },
  { value: 'PaymentReceipt', label: 'Payment Receipt' },
  { value: 'Pcr', label: 'Patient Care Report (PCR)' },
];

function saveBlob(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function downloadObjectUrl(filename: string, url: string) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener';
  link.click();
}

export default function App() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const blocksRef = useRef<HTMLDivElement>(null);
  const stylesRef = useRef<HTMLDivElement>(null);
  const traitsRef = useRef<HTMLDivElement>(null);
  const layersRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<EditorInstance | null>(null);
  const [documentType, setDocumentType] = useState<DokuDocumentType>('Invoice');
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>('styles');
  const [zoom, setZoom] = useState(70);
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState('Sample Invoice loaded');
  const [statusKind, setStatusKind] = useState<'neutral' | 'success' | 'error'>('neutral');
  const [blockSearch, setBlockSearch] = useState('');
  const [preview, setPreview] = useState<PreviewDocument | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState('');
  const previewGenerationRef = useRef(0);
  const previewUrlRef = useRef<string | null>(null);
  const [hidePanels, setHidePanels] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const currentLabel = useMemo(() => typeOptions.find(x => x.value === documentType)?.label ?? documentType, [documentType]);

  const reportStatus = useCallback((message: string, kind: 'neutral' | 'success' | 'error' = 'neutral') => {
    setStatus(message);
    setStatusKind(kind);
  }, []);

  const revokePreviewUrl = useCallback(() => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = null;
  }, []);

  const closePreview = useCallback(() => {
    previewGenerationRef.current += 1;
    revokePreviewUrl();
    setPreview(null);
    setPreviewLoading(false);
    setPreviewError('');
  }, [revokePreviewUrl]);

  useEffect(() => () => {
    previewGenerationRef.current += 1;
    revokePreviewUrl();
  }, [revokePreviewUrl]);

  const fitCanvas = useCallback((mode: 'page' | 'width') => {
    const editor = editorRef.current;
    if (!editor) return;
    const frameDocument = editor.Canvas.getDocument();
    const page = frameDocument?.querySelector<HTMLElement>('.doc-page');
    const viewport = editor.getContainer()?.querySelector<HTMLElement>('.gjs-cv-canvas');
    if (!page || !viewport) {
      reportStatus('Canvas is still loading. Try Fit again in a moment.', 'error');
      return;
    }
    const pageWidth = page.offsetWidth || page.scrollWidth;
    const pageHeight = page.offsetHeight || page.scrollHeight;
    const nextZoom = fitEditorZoom({ viewportWidth: viewport.clientWidth, viewportHeight: viewport.clientHeight, pageWidth, pageHeight, mode });
    editor.Canvas.setZoom(nextZoom);
    setZoom(nextZoom);
    reportStatus(mode === 'page' ? `Fit Page · ${nextZoom}%` : `Fit Width · ${nextZoom}%`);
  }, [reportStatus]);

  const applyEnvelope = useCallback((envelope: DraftEnvelope) => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.loadProjectData(envelope.projectData as any);
    editor.Canvas.setZoom(70);
    setZoom(70);
    setDocumentType(envelope.documentType);
    setDirty(false);
    reportStatus(`Draft reloaded · ${typeOptions.find(x => x.value === envelope.documentType)?.label ?? envelope.documentType}`, 'success');
    window.setTimeout(() => fitCanvas('page'), 120);
  }, [fitCanvas, reportStatus]);

  useEffect(() => {
    if (!canvasRef.current || !blocksRef.current || !stylesRef.current || !traitsRef.current || !layersRef.current) return;

    const editor = grapesjs.init({
      container: canvasRef.current,
      height: '100%',
      width: 'auto',
      fromElement: false,
      storageManager: false,
      noticeOnUnload: false,
      panels: { defaults: [] },
      blockManager: { appendTo: blocksRef.current, blocks: [] },
      styleManager: {
        appendTo: stylesRef.current,
        sectors: [
          { name: 'Layout', open: true, properties: ['display', 'position', 'top', 'right', 'bottom', 'left', 'float', 'clear'] },
          { name: 'Dimensions', open: true, properties: ['width', 'height', 'min-height', 'max-width', 'margin', 'padding'] },
          { name: 'Typography', open: true, properties: ['font-family', 'font-size', 'font-weight', 'color', 'line-height', 'letter-spacing', 'text-align', 'text-decoration'] },
          { name: 'Background & border', open: false, properties: ['background-color', 'border', 'border-radius', 'box-shadow'] },
        ],
      },
      traitManager: { appendTo: traitsRef.current },
      layerManager: { appendTo: layersRef.current },
      selectorManager: { appendTo: '#gjs-selector-manager' },
      canvas: { styles: [] },
      assetManager: { assets: [] },
      deviceManager: { devices: [{ name: 'Desktop', width: '' }] },
    });
    editorRef.current = editor;

    configureDokuEmsEditor(editor, 'Invoice');
    const invoice = templateSeeds.Invoice;
    editor.setComponents(invoice.html);
    editor.setStyle(invoice.css);
    editor.Canvas.setZoom(70);
    setZoom(70);

    let suppressUpdates = true;
    editor.on('update', () => {
      if (!suppressUpdates) {
        setDirty(true);
        setStatusKind('neutral');
      }
    });
    editor.on('component:selected', (component: any) => {
      const attrs = component?.getAttributes?.() ?? {};
      if (attrs['data-doku-binding'] || attrs['data-doku-component']) setInspectorTab('traits');
    });
    editor.on('canvas:zoom', () => setZoom(editor.Canvas.getZoom()));

    // Attach DokuEMS metadata after the initial component tree has been parsed.
    editor.getWrapper()?.addAttributes({ 'data-doku-document-type': 'Invoice', 'data-doku-engine': 'grapesjs-poc' });
    suppressUpdates = false;
    setDirty(false);
    reportStatus('Sample Invoice loaded · synthetic data only');
    window.setTimeout(() => fitCanvas('page'), 200);

    return () => {
      editor.destroy();
      editorRef.current = null;
    };
  }, [fitCanvas, reportStatus]);

  useEffect(() => {
    const target = blocksRef.current;
    if (!target) return;
    const query = blockSearch.trim().toLowerCase();
    target.querySelectorAll<HTMLElement>('.gjs-block').forEach(node => {
      node.style.display = !query || node.innerText.toLowerCase().includes(query) ? '' : 'none';
    });
  }, [blockSearch]);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const areas: [InspectorTab, HTMLDivElement | null][] = [
      ['styles', stylesRef.current],
      ['traits', traitsRef.current],
      ['layers', layersRef.current],
    ];
    areas.forEach(([tab, element]) => {
      if (element) element.style.display = inspectorTab === tab ? 'block' : 'none';
    });
  }, [inspectorTab]);

  const loadSeed = useCallback((nextType: DokuDocumentType, force = false) => {
    const editor = editorRef.current;
    if (!editor) return;
    if (dirty && !force && !window.confirm('Discard the unsaved canvas changes and load this sample? Your previously saved local draft will remain available.')) return;
    const local = localStorage.getItem(DRAFT_PREFIX + nextType);
    if (local) {
      try {
        const parsed: unknown = JSON.parse(local);
        if (isValidDraftEnvelope(parsed) && parsed.documentType === nextType) {
          editor.loadProjectData(parsed.projectData as any);
          editor.getWrapper()?.addAttributes({ 'data-doku-document-type': nextType, 'data-doku-engine': 'grapesjs-poc' });
          setDocumentType(nextType);
          setDirty(false);
          reportStatus(`Saved local draft loaded · ${nextType}`, 'success');
          window.setTimeout(() => fitCanvas('page'), 160);
          return;
        }
      } catch {
        // Fall through to the known built-in synthetic sample.
      }
    }
    const seed = templateSeeds[nextType];
    editor.setComponents(seed.html);
    editor.setStyle(seed.css);
    editor.getWrapper()?.addAttributes({ 'data-doku-document-type': nextType, 'data-doku-engine': 'grapesjs-poc' });
    setDocumentType(nextType);
    setDirty(false);
    reportStatus(`${seed.title} sample loaded · synthetic data only`);
    window.setTimeout(() => fitCanvas('page'), 160);
  }, [dirty, fitCanvas, reportStatus]);

  const changeDocumentType = (nextType: DokuDocumentType) => {
    if (nextType === documentType) return;
    loadSeed(nextType);
  };

  const saveDraft = () => {
    const editor = editorRef.current;
    if (!editor) return;
    try {
      const envelope = buildDraftEnvelope(documentType, editor.getProjectData(), editor.getHtml(), editor.getCss() ?? '');
      localStorage.setItem(DRAFT_PREFIX + documentType, JSON.stringify(envelope));
      setDirty(false);
      reportStatus(`Draft saved in this browser · ${currentLabel}`, 'success');
    } catch {
      reportStatus('Could not save the draft in browser storage. Export the project JSON as a backup.', 'error');
    }
  };

  const reloadDraft = () => {
    if (dirty && !window.confirm('Discard the current unsaved changes and reload the last saved browser draft?')) return;
    const local = localStorage.getItem(DRAFT_PREFIX + documentType);
    if (!local) {
      reportStatus(`No saved local draft for ${currentLabel}; loading the sample instead.`, 'neutral');
      loadSeed(documentType, true);
      return;
    }
    try {
      const parsed: unknown = JSON.parse(local);
      if (!isValidDraftEnvelope(parsed)) throw new Error('Invalid draft format');
      applyEnvelope(parsed);
    } catch {
      reportStatus('The local draft could not be read. It has not been deleted; export or inspect browser storage before continuing.', 'error');
    }
  };

  const openPreview = async () => {
    const editor = editorRef.current;
    if (!editor) return;

    const requestId = ++previewGenerationRef.current;
    const title = currentLabel;
    const selectedType = documentType;
    const html = editor.getHtml();
    const css = editor.getCss() ?? '';
    revokePreviewUrl();
    setPreview({ title, documentType: selectedType });
    setPreviewError('');
    setPreviewLoading(true);
    reportStatus('Generating PDF preview with local Chromium…', 'neutral');

    try {
      const blob = await requestPdfPreview({ documentType: selectedType, title, html, css });
      const objectUrl = URL.createObjectURL(blob);
      if (requestId !== previewGenerationRef.current) {
        URL.revokeObjectURL(objectUrl);
        return;
      }
      previewUrlRef.current = objectUrl;
      setPreview({ title, documentType: selectedType, objectUrl });
      reportStatus('PDF preview generated · synthetic data only', 'success');
    } catch (error) {
      if (requestId === previewGenerationRef.current) {
        const message = error instanceof Error ? error.message : 'The PDF preview could not be generated.';
        setPreviewError(message);
        reportStatus(message, 'error');
      }
    } finally {
      if (requestId === previewGenerationRef.current) setPreviewLoading(false);
    }
  };

  const exportProject = () => {
    const editor = editorRef.current;
    if (!editor) return;
    const envelope = buildDraftEnvelope(documentType, editor.getProjectData(), editor.getHtml(), editor.getCss() ?? '');
    saveBlob(`dokuems-${documentType.toLowerCase()}-template-poc.json`, JSON.stringify(envelope, null, 2), 'application/json');
    reportStatus('Project JSON exported', 'success');
  };

  const runCommand = (command: string) => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.Commands.run(command);
  };

  const changeZoom = (nextZoom: number) => {
    const editor = editorRef.current;
    const validZoom = clampEditorZoom(nextZoom);
    if (!editor) return;
    editor.Canvas.setZoom(validZoom);
    setZoom(validZoom);
  };

  return (
    <main className={`app-shell ${hidePanels ? 'panels-hidden' : ''}`}>
      <header className="topbar">
        <div className="brand-lockup"><span className="brand-symbol">D+</span><strong>DokuEMS</strong><span className="brand-divider" /> <span className="product-title">Template Designer</span></div>
        <div className="topbar-center"><span className="poc-badge">OPEN-SOURCE POC</span><span className="type-label">{currentLabel}</span><span className={`dirty-state ${dirty ? 'is-dirty' : ''}`}>{dirty ? 'Unsaved changes' : 'Draft saved state'}</span></div>
        <div className="topbar-actions">
          <button className="icon-button" title="Undo" aria-label="Undo" onClick={() => runCommand('core:undo')}>↶</button>
          <button className="icon-button" title="Redo" aria-label="Redo" onClick={() => runCommand('core:redo')}>↷</button>
          <span className="topbar-divider" />
          <button className="button button-quiet" onClick={() => setHidePanels(v => !v)}>{hidePanels ? 'Show panels' : 'Hide panels'}</button>
          <button className="button button-quiet" onClick={() => void openPreview()} disabled={previewLoading}>{previewLoading ? 'Generating PDF…' : 'Preview PDF'}</button>
          <button className="button button-primary" onClick={saveDraft}>Save Draft</button>
        </div>
      </header>

      <div className="workspace-toolbar">
        <div className="toolbar-group"><label htmlFor="document-type">Document</label><select id="document-type" value={documentType} onChange={event => changeDocumentType(event.target.value as DokuDocumentType)}>{typeOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div>
        <div className="toolbar-group zoom-group"><button className="icon-button" title="Zoom out" onClick={() => changeZoom(zoom - 5)}>−</button><span className="zoom-readout">{zoom}%</span><button className="icon-button" title="Zoom in" onClick={() => changeZoom(zoom + 5)}>＋</button><button className="button button-quiet" onClick={() => fitCanvas('width')}>Fit Width</button><button className="button button-quiet" onClick={() => fitCanvas('page')}>Fit Page</button><button className="button button-quiet" onClick={() => changeZoom(70)}>Reset</button></div>
        <div className="toolbar-group toolbar-right"><button className="button button-quiet" onClick={reloadDraft}>Reload</button><button className="button button-quiet" onClick={() => loadSeed(documentType)}>Load sample</button><button className="button button-outline" onClick={exportProject}>Export JSON</button></div>
      </div>

      <div className={`editor-layout ${hidePanels ? 'hide-side-panels' : ''}`}>
        <aside className="side-panel left-panel" aria-label="Components palette">
          <div className="panel-heading"><div><span className="panel-eyebrow">BUILDING BLOCKS</span><h2>Components</h2></div><span className="component-count">{DOKUEMS_TOOL_BLOCKS.length} tools</span></div>
          <div className="search-field"><span aria-hidden="true">⌕</span><input value={blockSearch} onChange={event => setBlockSearch(event.target.value)} placeholder="Search components…" aria-label="Search components" /></div>
          <div ref={blocksRef} className="blocks-host" />
          <div className="binding-catalog">
            <div className="panel-eyebrow">DATA BINDINGS</div>
            <p>Sample binding catalogue</p>
            <div className="binding-chips"><span>organisation.*</span><span>invoice.*</span><span>charges.rows</span><span>payments.rows</span><span>pcr.*</span></div>
          </div>
        </aside>

        <section className="canvas-area" aria-label="Document canvas">
          <div className="canvas-caption"><div><strong>{currentLabel} template</strong><span> A4 portrait · flow-based layout</span></div><span className="canvas-hint">Drag blocks onto the page · select an element to edit</span></div>
          <div className="canvas-stage"><div ref={canvasRef} className="grapes-canvas" /></div>
          <div className={`statusbar ${statusKind}`} role={statusKind === 'error' ? 'alert' : 'status'}><span className="status-dot" />{status}<span className="status-spacer" /><span className="sample-warning">Synthetic sample data · not connected to live DokuEMS</span></div>
        </section>

        <aside className="side-panel right-panel" aria-label="Properties inspector">
          <div className="panel-heading"><div><span className="panel-eyebrow">EDIT SELECTION</span><h2>Properties</h2></div></div>
          <div className="inspector-tabs" role="tablist" aria-label="Inspector panels">
            <button className={inspectorTab === 'styles' ? 'active' : ''} role="tab" aria-selected={inspectorTab === 'styles'} onClick={() => setInspectorTab('styles')}>Style</button>
            <button className={inspectorTab === 'traits' ? 'active' : ''} role="tab" aria-selected={inspectorTab === 'traits'} onClick={() => setInspectorTab('traits')}>Content</button>
            <button className={inspectorTab === 'layers' ? 'active' : ''} role="tab" aria-selected={inspectorTab === 'layers'} onClick={() => setInspectorTab('layers')}>Layers</button>
          </div>
          <div ref={stylesRef} className="manager-host styles-host" />
          <div ref={traitsRef} className="manager-host traits-host" style={{ display: 'none' }} />
          <div ref={layersRef} className="manager-host layers-host" style={{ display: 'none' }} />
          <div id="gjs-selector-manager" className="selector-host" />
          <div className="help-box"><button className="help-toggle" onClick={() => setIsHelpOpen(v => !v)} aria-expanded={isHelpOpen}>{isHelpOpen ? '−' : '+'} Designer notes</button>{isHelpOpen && <div className="help-copy">This proof of concept uses GrapesJS Core for editing and a local Playwright/Chromium service to generate the PDF preview. Drafts are saved in this browser only; the preview uses the current synthetic sample content and is not connected to DokuEMS production data, publishing, audit or version pinning.</div>}</div>
        </aside>
      </div>

      {preview && <div className="modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) closePreview(); }}><section className="preview-modal" role="dialog" aria-modal="true" aria-labelledby="preview-title"><header className="preview-modal-header"><div><span className="panel-eyebrow">PDF PREVIEW · SYNTHETIC DATA</span><h2 id="preview-title">{preview.title} · PDF preview</h2></div><div className="modal-actions">{preview.objectUrl && <button className="button button-outline" onClick={() => downloadObjectUrl(pdfPreviewFilename(preview.documentType), preview.objectUrl!)}>Download PDF</button>}{previewError && <button className="button button-quiet" onClick={() => void openPreview()}>Retry</button>}<button className="button button-primary" onClick={closePreview}>Close</button></div></header>{previewLoading ? <div className="pdf-preview-message" role="status"><span className="pdf-spinner" />Generating A4 PDF…</div> : previewError ? <div className="pdf-preview-message pdf-preview-error" role="alert"><strong>PDF preview failed</strong><p>{previewError}</p><p className="pdf-preview-hint">If Chromium has not been installed yet, run <code>npm.cmd run install:browser</code> and restart the app.</p></div> : preview.objectUrl ? <iframe className="preview-frame pdf-preview-frame" title={`${preview.title} PDF preview`} src={preview.objectUrl} /> : <div className="pdf-preview-message" role="status">Preparing PDF preview…</div>}</section></div>}
    </main>
  );
}
