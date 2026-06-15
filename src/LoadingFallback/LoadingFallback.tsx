/**
 * LoadingFallback - lightweight loading indicator for lazy-loaded components.
 *
 * Used with React.lazy() and Suspense to show a loading state while heavy
 * components are loading. Optimized for minimal bundle impact.
 */
import React from 'react';

import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useFeedbackUi } from '../context/FeedbackUiContext';
import { FEEDBACK_TEST_IDS } from '../constants';

const FULLSCREEN_MIN_HEIGHT = 300;
const CONTAINER_MIN_HEIGHT = 100;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: CONTAINER_MIN_HEIGHT,
  },
  fullScreen: {
    minHeight: FULLSCREEN_MIN_HEIGHT,
  },
});

export interface LoadingFallbackProps {
  /** Show as full-screen loader (default: false) */
  fullScreen?: boolean;
  /** Custom size for the spinner */
  size?: 'small' | 'large';
}

export const LoadingFallback: React.FC<LoadingFallbackProps> = ({ fullScreen = false, size = 'large' }) => {
  const { theme, t } = useFeedbackUi();
  const colors = theme.colors;
  const primary = theme.palette.primary['500'];

  return (
    <View
      accessibilityHint={t('loadingFallback.hint')}
      accessibilityLabel={t('loadingFallback.label')}
      accessibilityRole="progressbar"
      style={[styles.container, fullScreen && styles.fullScreen, { backgroundColor: colors.background }]}
      testID={FEEDBACK_TEST_IDS.loadingFallback}
    >
      <ActivityIndicator color={primary} size={size} />
    </View>
  );
};

export default LoadingFallback;
