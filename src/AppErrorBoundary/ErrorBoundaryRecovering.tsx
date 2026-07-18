/**
 * ErrorBoundaryRecovering — the transient screen shown while the caller's
 * `recover(error)` handles the failure (in the apps: a one-shot guarded reload
 * after a stale-chunk `ChunkLoadError` following a deploy).
 *
 * It is NOT an error screen — the app is about to come back — so it announces
 * politely (`role="status"`), unlike the assertive fallback.
 */
import React from 'react';

import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useFeedbackUi } from '../context/FeedbackUiContext';

const CONTAINER_PADDING = 20;
const MESSAGE_FONT_SIZE = 16;
const MESSAGE_MARGIN_TOP = 12;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: CONTAINER_PADDING,
  },
  message: {
    fontSize: MESSAGE_FONT_SIZE,
    marginTop: MESSAGE_MARGIN_TOP,
    textAlign: 'center',
  },
});

export interface ErrorBoundaryRecoveringProps {
  message: string;
  testID: string;
}

export const ErrorBoundaryRecovering = ({
  message,
  testID,
}: ErrorBoundaryRecoveringProps): React.ReactElement => {
  const { theme } = useFeedbackUi();

  return (
    <View
      accessibilityLiveRegion="polite"
      role="status"
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      testID={testID}
    >
      <ActivityIndicator color={theme.palette.primary['500']} size="large" />
      <Text style={[styles.message, { color: theme.colors.textSecondary }]}>{message}</Text>
    </View>
  );
};

export default ErrorBoundaryRecovering;
