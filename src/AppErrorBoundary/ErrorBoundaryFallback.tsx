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
  onRetry,
  onReload,
}: ErrorBoundaryFallbackProps): React.ReactElement => {
  const { theme } = useFeedbackUi();
  const warningColor = (theme.semantic.warning ?? theme.semantic.error)['500'];
  const primaryColor = theme.palette.primary['500'];
  const hasDetails = showDetails && error !== null;

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

        <TouchableOpacity
          accessibilityHint={labels.tryAgainHint}
          accessibilityLabel={labels.tryAgain}
          accessibilityRole="button"
          style={[styles.button, { backgroundColor: primaryColor }]}
          testID={`${testIDPrefix}-retry-button`}
          onPress={onRetry}
        >
          <Text style={[styles.buttonText, { color: theme.colors.surfaceElevated }]}>{labels.tryAgain}</Text>
        </TouchableOpacity>

        {typeof onReload === 'function' ? (
          <TouchableOpacity
            accessibilityHint={labels.reloadHint}
            accessibilityLabel={labels.reload}
            accessibilityRole="button"
            style={[styles.button, { backgroundColor: theme.colors.surface }]}
            testID={`${testIDPrefix}-reload-button`}
            onPress={onReload}
          >
            <Text style={[styles.buttonText, { color: theme.colors.text }]}>{labels.reload}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

export default ErrorBoundaryFallback;
