import React from 'react';

import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Skeleton } from '@dloizides/ui-motion';

import { FEEDBACK_TEST_IDS } from '../constants';
import { useFeedbackUi } from '../context/FeedbackUiContext';

const DEFAULT_GAP = 8;
const DEFAULT_RADIUS = 4;

/** One placeholder bar: its height in px, its width (px or percent) and its corner radius. */
export interface SkeletonLine {
  height: number;
  width?: number | string;
  radius?: number;
}

export interface SkeletonLinesProps {
  lines: readonly SkeletonLine[];
  gap?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const styles = StyleSheet.create({
  stack: { minWidth: 0 },
});

/** A busy stack of shimmer bars sized by the caller, so a loading tile keeps the height of the content it stands in for. */
export const SkeletonLines = ({ lines, gap = DEFAULT_GAP, style, testID = FEEDBACK_TEST_IDS.skeletonLines }: SkeletonLinesProps): React.ReactElement => {
  const { theme, t } = useFeedbackUi();
  const blockColor = String(theme.colors.border);
  return (
    <View
      accessibilityHint={t('pageSkeleton.loadingHint')}
      accessibilityLabel={t('pageSkeleton.loadingLabel')}
      aria-busy
      style={[styles.stack, { gap }, style]}
      testID={testID}
    >
      {lines.map((line, index) => (
        <Skeleton
          key={`${String(index)}-${String(line.height)}`}
          backgroundColor={blockColor}
          borderRadius={line.radius ?? DEFAULT_RADIUS}
          height={line.height}
          width={line.width ?? '100%'}
        />
      ))}
    </View>
  );
};
