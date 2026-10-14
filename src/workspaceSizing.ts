export type FitMode = 'page' | 'width';

export function clampEditorZoom(zoom: number, minimum = 25, maximum = 100): number {
  if (!Number.isFinite(zoom)) return minimum;
  return Math.max(minimum, Math.min(maximum, Math.round(zoom)));
}

/**
 * Calculate zoom from unscaled document dimensions. GrapesJS Canvas.setZoom
 * accepts a percentage from 0 to 100, so this helper stays within that range.
 */
export function fitEditorZoom(options: {
  viewportWidth: number;
  viewportHeight: number;
  pageWidth: number;
  pageHeight: number;
  mode: FitMode;
  gutter?: number;
  minimum?: number;
  maximum?: number;
}): number {
  const { viewportWidth, viewportHeight, pageWidth, pageHeight, mode } = options;
  const gutter = options.gutter ?? 52;
  const minimum = options.minimum ?? 25;
  const maximum = options.maximum ?? 100;
  if (![viewportWidth, viewportHeight, pageWidth, pageHeight].every(Number.isFinite) || pageWidth <= 0 || pageHeight <= 0) return minimum;
  const availableWidth = Math.max(1, viewportWidth - gutter);
  const availableHeight = Math.max(1, viewportHeight - gutter);
  const widthScale = availableWidth / pageWidth;
  const scale = mode === 'width' ? widthScale : Math.min(widthScale, availableHeight / pageHeight);
  return clampEditorZoom(scale * 100, minimum, maximum);
}
