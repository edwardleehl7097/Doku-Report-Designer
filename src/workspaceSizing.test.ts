import { describe, expect, it } from 'vitest';
import { clampEditorZoom, fitEditorZoom } from './workspaceSizing';

describe('GrapesJS canvas sizing', () => {
  it('fits A4 by both width and height', () => {
    const zoom = fitEditorZoom({ viewportWidth: 900, viewportHeight: 760, pageWidth: 794, pageHeight: 1123, mode: 'page' });
    expect(zoom).toBe(63);
  });

  it('fits width when explicitly requested', () => {
    const zoom = fitEditorZoom({ viewportWidth: 900, viewportHeight: 500, pageWidth: 794, pageHeight: 1123, mode: 'width' });
    expect(zoom).toBe(100);
  });

  it('clamps the zoom to GrapesJS-supported bounds', () => {
    expect(clampEditorZoom(999)).toBe(100);
    expect(clampEditorZoom(0)).toBe(25);
    expect(clampEditorZoom(Number.NaN)).toBe(25);
  });
});
