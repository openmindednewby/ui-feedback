/**
 * PageSkeleton - shimmer skeleton loader for full pages.
 *
 * Improves perceived performance (Speed Index) by showing immediate visual
 * feedback while page content loads.
 *
 * Each placeholder block is a `@dloizides/ui-motion` <Skeleton> — a rounded block
 * with a highlight band that sweeps across it (translateX shimmer). This is the ONE
 * shimmer implementation in the kit: PageSkeleton owns only the page LAYOUT (how many
 * bars/blocks, their sizes and spacing), not the animation. Under reduced-motion the
 * <Skeleton> suppresses the sweep and renders a static block on its own.
 */
import React from 'react';

import { StyleSheet, View } from 'react-native';

import { Skeleton } from '@dloizides/ui-motion';

import { useFeedbackUi } from '../context/FeedbackUiContext';
import { FEEDBACK_TEST_IDS } from '../constants';

const SKELETON_BORDER_RADIUS = 4;
const CARD_BORDER_RADIUS = 8;
const DEFAULT_ROWS = 5;

const HEADER_HEIGHT = 32;
const HEADER_WIDTH = '60%';
const AVATAR_SIZE = 48;
const AVATAR_BORDER_RADIUS = 24;
const TEXT_LINE_HEIGHT = 16;
const TEXT_LINE_FULL_WIDTH = '100%';
const TEXT_LINE_SHORT_WIDTH = '70%';
const CARD_HEIGHT = 120;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  avatar: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  textLine: {
    marginBottom: 8,
  },
  card: {
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

  const skeletonColor = String(colors.border);

  const renderListRow = (index: number): React.ReactElement => (
    <View key={index} style={styles.row}>
      <Skeleton
        backgroundColor={skeletonColor}
        borderRadius={AVATAR_BORDER_RADIUS}
        height={AVATAR_SIZE}
        style={styles.avatar}
        width={AVATAR_SIZE}
      />
      <View style={styles.textContainer}>
        <Skeleton
          backgroundColor={skeletonColor}
          borderRadius={SKELETON_BORDER_RADIUS}
          height={TEXT_LINE_HEIGHT}
          style={styles.textLine}
          width={TEXT_LINE_FULL_WIDTH}
        />
        <Skeleton
          backgroundColor={skeletonColor}
          borderRadius={SKELETON_BORDER_RADIUS}
          height={TEXT_LINE_HEIGHT}
          style={styles.textLine}
          width={TEXT_LINE_SHORT_WIDTH}
        />
      </View>
    </View>
  );

  const renderCard = (index: number): React.ReactElement => (
    <Skeleton
      key={index}
      backgroundColor={skeletonColor}
      borderRadius={CARD_BORDER_RADIUS}
      height={CARD_HEIGHT}
      style={styles.card}
    />
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
      {showHeader ? (
        <Skeleton
          backgroundColor={skeletonColor}
          borderRadius={SKELETON_BORDER_RADIUS}
          height={HEADER_HEIGHT}
          style={styles.header}
          width={HEADER_WIDTH}
        />
      ) : null}
      {rowElements}
    </View>
  );
};

export default PageSkeleton;
