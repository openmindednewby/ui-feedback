import { UI_DEEP_STEP, UI_MAIN_STEP, canCarryAccessibleInk, isHexColor, resolveOnBrand } from '@dloizides/design-tokens';

import type { FeedbackColorScale, FeedbackTheme } from '../context/FeedbackUiContext';
import type { ToastType } from './ToastHost';

const APP_HEADER_HEIGHT = 64;
const HEADER_GAP = 8;
const TOAST_TOP_MOBILE = 40;

/** Default top of the web toast layer: below a 64 px app header, never under it. */
export const TOAST_TOP_WEB = APP_HEADER_HEIGHT + HEADER_GAP;

const GLYPHS: Record<ToastType, string> = {
  success: '✓',
  error: '!',
  info: 'i',
};

export interface ToastTone {
  fill: string;
  ink: string;
  border: string;
  glyph: string;
}

function scaleFor(theme: FeedbackTheme, type: ToastType): FeedbackColorScale {
  if (type === 'error') return theme.semantic.error;
  if (type === 'success') return theme.semantic.success ?? theme.palette.primary;
  return theme.palette.primary;
}

function readableInk(fill: string | undefined): string | null {
  if (fill === undefined || !isHexColor(fill) || !canCarryAccessibleInk(fill)) return null;
  return resolveOnBrand(fill);
}

/** The toast fill, ink (>= 4.5:1 on the fill), border and type glyph for a toast type. */
export function resolveToastTone(theme: FeedbackTheme, type: ToastType = 'info'): ToastTone {
  const scale = scaleFor(theme, type);
  const glyph = GLYPHS[type];
  const deep: string | undefined = scale[UI_DEEP_STEP];
  for (const fill of [scale[UI_MAIN_STEP], deep]) {
    const ink = readableInk(fill);
    if (ink !== null && fill !== undefined) return { fill, ink, border: fill, glyph };
  }
  return { fill: theme.colors.surfaceElevated, ink: theme.colors.text, border: scale[UI_MAIN_STEP], glyph };
}

/** The top offset of the toast layer: an explicit inset wins, else the platform default. */
export function toastTop(isWeb: boolean, topInset?: number): number {
  if (topInset !== undefined) return topInset;
  return isWeb ? TOAST_TOP_WEB : TOAST_TOP_MOBILE;
}
