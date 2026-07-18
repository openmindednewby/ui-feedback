/**
 * ErrorBoundaryFallback — the presentational half of `<AppErrorBoundary>`.
 *
 * Split out of the class component so it can read the `UiProvider` theme through
 * `useFeedbackUi()` (a class cannot use hooks). The message itself renders through
 * the shared `<ErrorState>`, which is what replaces the 40+ hardcoded Bootstrap-4
 * hex literals the six app-local boundaries each carried.
 *
 * Announces itself: `role="alert"` + `accessibilityLiveRegion="assertive"` so a
 * screen reader reads the failure instead of the screen going silently blank.
 */
import React from 'react';

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useFeedbackUi } from '../context/FeedbackUiContext';
import { ErrorState } from '../ErrorState/ErrorState';
import type { ErrorBoundaryLabels } from './labels';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CONTAINER_PADDING = 20;
const CONTENT_MAX_WIDTH = 400;
const TITLE_FONT_SIZE = 24;
const TITLE_MARGIN_BOTTOM = 12;
const DETAILS_PADDING = 12;
const DETAILS_BORDER_RADIUS = 8;
const DETAILS_BORDER_WIDTH = 1;
const DETAILS_MARGIN_VERTICAL = 16;
const DETAILS_TITLE_FONT_SIZE = 14;
const DETAILS_TITLE_MARGIN_BOTTOM = 4;
const DETAILS_TEXT_FONT_SIZE = 12;
const BUTTON_PADDING_H = 24;
const BUTTON_PADDING_V = 12;
const BUTTON_BORDER_RADIUS = 8;
const BUTTON_MARGIN_TOP = 12;
const BUTTON_FONT_SIZE = 16;

// ---------------------------------------------------------------------------
// Styles (layout only — every colour comes from the theme at render time)
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: CONTAINER_PADDING,
  },
  content: {
    maxWidth: CONTENT_MAX_WIDTH,
    alignItems: 'center',
  },
  title: {
    fontSize: TITLE_FONT_SIZE,
    fontWeight: 'bold',
    marginBottom: TITLE_MARGIN_BOTTOM,
    textAlign: 'center',
  },
  details: {
    padding: DETAILS_PADDING,
    borderRadius: DETAILS_BORDER_RADIUS,
    borderWidth: DETAILS_BORDER_WIDTH,
    marginVertical: DETAILS_MARGIN_VERTICAL,
    width: '100%',
  },
  detailsTitle: {
    fontSize: DETAILS_TITLE_FONT_SIZE,
    fontWeight: 'bold',
    marginBottom: DETAILS_TITLE_MARGIN_BOTTOM,
  },
  detailsText: {
    fontSize: DETAILS_TEXT_FONT_SIZE,
    fontFamily: 'monospace',
  },
  button: {
    paddingHorizontal: BUTTON_PADDING_H,
    paddingVertical: BUTTON_PADDING_V,
    borderRadius: BUTTON_BORDER_RADIUS,
    marginTop: BUTTON_MARGIN_TOP,
  },
  buttonText: {
    fontSize: BUTTON_FONT_SIZE,
    fontWeight: '600',
  },
});

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface ErrorBoundaryFallbackProps {
  labels: ErrorBoundaryLabels;
  testIDPrefix: string;
  error: Error | null;
  showDetails: boolean;
  /** When false the retry action is omitted entirely (retrying cannot help this error). */
  showRetry: boolean;
  /** Give Reload the filled emphasis and the first position instead of Try Again. */
  reloadIsPrimary: boolean;
  onRetry: () => void;
  onReload?: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const ErrorBoundaryFallback = ({
  labels,
  testIDPrefix,
  error,
  showDetails,
  showRetry,
  reloadIsPrimary,
  onRetry,
  onReload,
}: ErrorBoundaryFallbackProps): React.ReactElement => {
  const { theme } = useFeedbackUi();
  const warningColor = (theme.semantic.warning ?? theme.semantic.error)['500'];
  const primaryColor = theme.palette.primary['500'];
  const hasDetails = showDetails && error !== null;

  // Exactly one action carries the filled emphasis. Which one is the caller's call
  // (`reloadIsPrimary`), because only the caller knows whether re-rendering can work.
  const primaryFill = { backgroundColor: primaryColor };
  const primaryInk = { color: theme.colors.surfaceElevated };
  const secondaryFill = { backgroundColor: theme.colors.surface };
  const secondaryInk = { color: theme.colors.text };

  const retryButton = showRetry ? (
    <TouchableOpacity
      accessibilityHint={labels.tryAgainHint}
      accessibilityLabel={labels.tryAgain}
      accessibilityRole="button"
      style={[styles.button, reloadIsPrimary ? secondaryFill : primaryFill]}
      testID={`${testIDPrefix}-retry-button`}
      onPress={onRetry}
    >
      <Text style={[styles.buttonText, reloadIsPrimary ? secondaryInk : primaryInk]}>
        {labels.tryAgain}
      </Text>
    </TouchableOpacity>
  ) : null;

  const reloadButton =
    typeof onReload === 'function' ? (
      <TouchableOpacity
        accessibilityHint={labels.reloadHint}
        accessibilityLabel={labels.reload}
        accessibilityRole="button"
        style={[styles.button, reloadIsPrimary ? primaryFill : secondaryFill]}
        testID={`${testIDPrefix}-reload-button`}
        onPress={onReload}
      >
        <Text style={[styles.buttonText, reloadIsPrimary ? primaryInk : secondaryInk]}>
          {labels.reload}
        </Text>
      </TouchableOpacity>
    ) : null;

  return (
    <View
      accessibilityLiveRegion="assertive"
      role="alert"
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      testID={testIDPrefix}
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]}>{labels.title}</Text>

        <ErrorState message={labels.message} testID={`${testIDPrefix}-message`} />

        {hasDetails ? (
          <View
            style={[styles.details, { backgroundColor: theme.colors.surface, borderColor: warningColor }]}
            testID={`${testIDPrefix}-details`}
          >
            <Text style={[styles.detailsTitle, { color: warningColor }]}>{labels.errorDetails}</Text>
            <Text style={[styles.detailsText, { color: theme.colors.textSecondary }]}>{error.message}</Text>
          </View>
        ) : null}

        {reloadIsPrimary ? reloadButton : retryButton}
        {reloadIsPrimary ? retryButton : reloadButton}
      </View>
    </View>
  );
};

export default ErrorBoundaryFallback;
