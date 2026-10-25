import { resolveOnBrand } from '@dloizides/design-tokens';

import type { FeedbackTheme } from '../context/FeedbackUiContext';

/** The confirm button fill: error 500 for a destructive action, primary 500 otherwise. */
export function confirmFill(theme: FeedbackTheme, destructive: boolean): string {
  return destructive ? theme.semantic.error['500'] : theme.palette.primary['500'];
}

/** The confirm label and spinner ink: the derived on-fill foreground, never the dialog surface colour. */
export function confirmInk(theme: FeedbackTheme, destructive: boolean): string {
  return resolveOnBrand(confirmFill(theme, destructive));
}
