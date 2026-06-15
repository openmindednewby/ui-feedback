import React, { createContext, useContext, useMemo } from 'react';

/**
 * The minimal theme surface the feedback components read. Each consuming app's
 * resolved theme object is structurally compatible with this shape, so apps pass
 * their existing `useTheme().theme` straight through the provider.
 */
export interface FeedbackThemeColors {
  background: string;
  surfaceElevated: string;
  text: string;
  textSecondary: string;
  border: string;
}

/** A colour scale where the `500` step is the one the feedback components use. */
export interface FeedbackColorScale {
  '500': string;
}

export interface FeedbackTheme {
  colors: FeedbackThemeColors;
  palette: { primary: FeedbackColorScale };
  semantic: { error: FeedbackColorScale };
}

/** Translate function — mirrors the apps' `FM(key, p1?, p2?, p3?)` helper. */
export type FeedbackTranslate = (key: string, p1?: string, p2?: string, p3?: string) => string;

/** Navigation callback used by EmptyListState's optional call-to-action. */
export type FeedbackNavigate = (route: string) => void;

export interface FeedbackUiValue {
  theme: FeedbackTheme;
  t: FeedbackTranslate;
  navigate?: FeedbackNavigate;
}

/**
 * Neutral fallback used when no FeedbackUiProvider is mounted. Apps SHOULD mount a
 * provider so the components pick up the real theme + translations; the default keeps
 * the components rendering gracefully (e.g. in isolated tests) instead of throwing.
 */
const DEFAULT_FEEDBACK_VALUE: FeedbackUiValue = {
  theme: {
    colors: {
      background: '#ffffff',
      surfaceElevated: '#ffffff',
      text: '#111111',
      textSecondary: '#666666',
      border: '#dddddd',
    },
    palette: { primary: { '500': '#2563eb' } },
    semantic: { error: { '500': '#dc2626' } },
  },
  t: (key) => key,
};

const FeedbackUiContext = createContext<FeedbackUiValue>(DEFAULT_FEEDBACK_VALUE);

export interface FeedbackUiProviderProps extends FeedbackUiValue {
  children: React.ReactNode;
}

/**
 * Supplies the host app's theme + translate (+ optional navigate) to the
 * `@dloizides/ui-feedback` components. Mount once, high in the app tree, below
 * the app's own ThemeProvider.
 */
export const FeedbackUiProvider = ({
  theme,
  t,
  navigate,
  children,
}: FeedbackUiProviderProps): React.ReactElement => {
  const value = useMemo<FeedbackUiValue>(() => ({ theme, t, navigate }), [theme, t, navigate]);
  return <FeedbackUiContext.Provider value={value}>{children}</FeedbackUiContext.Provider>;
};

/**
 * Reads the feedback UI context. Returns the provider's value when one is mounted,
 * or a neutral default (see DEFAULT_FEEDBACK_VALUE) so components render gracefully
 * without a provider.
 */
export function useFeedbackUi(): FeedbackUiValue {
  return useContext(FeedbackUiContext);
}
