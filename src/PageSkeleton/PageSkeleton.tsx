/**
 * PageSkeleton - shimmer skeleton loader for full pages.
 *
 * Improves perceived performance (Speed Index) by showing immediate visual
 * feedback while page content loads.
 */
import React from 'react';

import { Animated, Easing, Platform, StyleSheet, View } from 'react-native';

import { useFeedbackUi } from '../context/FeedbackUiContext';
import { FEEDBACK_TEST_IDS } from '../constants';

const ANIMATION_DURATION_MS = 1200;
const SKELETON_BORDER_RADIUS = 4;
const SKELETON_OPACITY_START = 0.3;
const SKELETON_OPACITY_END = 0.7;
const DEFAULT_ROWS = 5;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    height: 32,
    borderRadius: SKELETON_BORDER_RADIUS,
    marginBottom: 24,
    width: '60%',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  textLine: {
    height: 16,
    borderRadius: SKELETON_BORDER_RADIUS,
    marginBottom: 8,
  },
  textLineShort: {
    width: '70%',
  },
  textLineFull: {
    width: '100%',
  },
  card: {
    height: 120,
    borderRadius: 8,
    marginBottom: 16,
  },
});

export interface PageSkeletonProps {
  /** Number of skeleton rows to show */
  rows?: number;
  /** Show header skeleton */
  showHeader?: boolean;
  /** Show card skeletons instead of rows */
  variant?: 'list' | 'cards';
}

export const PageSkeleton: React.FC<PageSkeletonProps> = ({
  rows = DEFAULT_ROWS,
  showHeader = true,
  variant = 'list',
}) => {
  const { theme, t } = useFeedbackUi();
  const colors = theme.colors;

  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: ANIMATION_DURATION_MS,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: ANIMATION_DURATION_MS,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [SKELETON_OPACITY_START, SKELETON_OPACITY_END],
  });

  const skeletonColor = String(colors.border);

  const renderListRow = (index: number): React.ReactElement => (
    <View key={index} style={styles.row}>
      <Animated.View style={[styles.avatar, { backgroundColor: skeletonColor, opacity }]} />
      <View style={styles.textContainer}>
        <Animated.View style={[styles.textLine, styles.textLineFull, { backgroundColor: skeletonColor, opacity }]} />
        <Animated.View style={[styles.textLine, styles.textLineShort, { backgroundColor: skeletonColor, opacity }]} />
      </View>
    </View>
  );

  const renderCard = (index: number): React.ReactElement => (
    <Animated.View key={index} style={[styles.card, { backgroundColor: skeletonColor, opacity }]} />
  );

  const rowElements = Array.from({ length: rows }, (_, i) => (variant === 'cards' ? renderCard(i) : renderListRow(i)));

  return (
    <View
      accessibilityHint={t('pageSkeleton.loadingHint')}
      accessibilityLabel={t('pageSkeleton.loadingLabel')}
      accessibilityState={{ busy: true }}
      style={[styles.container, { backgroundColor: colors.background }]}
      testID={FEEDBACK_TEST_IDS.pageSkeleton}
    >
      {showHeader ? <Animated.View style={[styles.header, { backgroundColor: skeletonColor, opacity }]} /> : null}
      {rowElements}
    </View>
  );
};

export default PageSkeleton;
