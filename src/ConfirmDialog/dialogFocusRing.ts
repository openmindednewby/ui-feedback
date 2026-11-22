import { useCallback, useMemo, useState } from 'react';

import { Platform } from 'react-native';
import type { ViewStyle } from 'react-native';

import { focusRingOutline, isFocusVisible, resolveFocusRingColor } from '@dloizides/design-tokens';

import type { FeedbackTheme } from '../context/FeedbackUiContext';

const LIGHT_BRAND_STEP = '300';
const NO_RING: ViewStyle = { outlineWidth: 0 };
const NATIVE_RING: ViewStyle = {};

/** The design-tokens focus ring of one dialog button and the handlers that show it on keyboard focus only. */
export interface DialogFocusRing {
  ringStyle: ViewStyle;
  onFocus: (event?: unknown) => void;
  onBlur: () => void;
}

/** The ring style for one state: the token outline when keyboard-focused on web, else none. */
export function buildDialogRingStyle(visible: boolean, color: string, isWeb: boolean): ViewStyle {
  if (!isWeb) return NATIVE_RING;
  return visible ? (focusRingOutline(color) as ViewStyle) : NO_RING;
}

/** The theme's focus-ring colour, contrast-checked against the theme's ground. */
export function dialogRingColor(theme: FeedbackTheme): string {
  const colors = theme.colors as FeedbackTheme['colors'] & { focusRing?: string };
  return resolveFocusRingColor({
    focusRing: colors.focusRing,
    primary: theme.palette.primary['500'],
    primaryLight: theme.palette.primary[LIGHT_BRAND_STEP],
    text: colors.text,
    background: colors.background,
  });
}

/** Keyboard-only token focus ring for one dialog button. */
export function useDialogFocusRing(color: string): DialogFocusRing {
  const [visible, setVisible] = useState(false);
  const onFocus = useCallback((event?: unknown): void => {
    setVisible(isFocusVisible((event as { target?: unknown } | undefined)?.target));
  }, []);
  const onBlur = useCallback((): void => setVisible(false), []);
  const ringStyle = useMemo(() => buildDialogRingStyle(visible, color, Platform.OS === 'web'), [visible, color]);
  return { ringStyle, onFocus, onBlur };
}
