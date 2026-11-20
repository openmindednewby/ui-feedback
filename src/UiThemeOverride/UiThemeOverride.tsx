import React, { useMemo } from 'react';

import { FeedbackUiProvider, useFeedbackUi } from '../context/FeedbackUiContext';
import type { FeedbackTheme } from '../context/FeedbackUiContext';

export interface UiThemeOverrideProps<T extends FeedbackTheme = FeedbackTheme> {
  map: (theme: T) => FeedbackTheme;
  children: React.ReactNode;
}

/** Re-provides the surrounding UI context with its theme passed through `map`; translate and navigate are kept. */
export function UiThemeOverride<T extends FeedbackTheme = FeedbackTheme>({
  map,
  children,
}: UiThemeOverrideProps<T>): React.ReactElement {
  const { theme, t, navigate } = useFeedbackUi();
  const mapped = useMemo(() => map(theme as T), [map, theme]);
  return (
    <FeedbackUiProvider navigate={navigate} t={t} theme={mapped}>
      {children}
    </FeedbackUiProvider>
  );
}
