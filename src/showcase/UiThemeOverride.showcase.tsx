import React from 'react';

import { FeedbackUiProvider } from '../context/FeedbackUiContext';
import type { FeedbackTheme } from '../context/FeedbackUiContext';
import { EmptyListState } from '../EmptyListState/EmptyListState';
import { UiThemeOverride } from '../UiThemeOverride/UiThemeOverride';

export interface UiThemeOverrideShowcaseProps {
  theme: FeedbackTheme;
  bandTheme: (theme: FeedbackTheme) => FeedbackTheme;
}

/** Showcase story: the same empty state in the page theme and inside a UiThemeOverride band. */
export const UiThemeOverrideShowcase = ({ theme, bandTheme }: UiThemeOverrideShowcaseProps): React.ReactElement => (
  <FeedbackUiProvider t={(key) => key} theme={theme}>
    <EmptyListState messageKey="showcase.uiThemeOverride.page" testID="ui-theme-override-page" />
    <UiThemeOverride map={bandTheme}>
      <EmptyListState messageKey="showcase.uiThemeOverride.band" testID="ui-theme-override-band" />
    </UiThemeOverride>
  </FeedbackUiProvider>
);
