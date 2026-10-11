import React, { useEffect, useState } from 'react';

import { Animated, StyleSheet, Text, View } from 'react-native';
import type { LayoutChangeEvent } from 'react-native';

import { useFeedbackUi } from '../context/FeedbackUiContext';
import { FEEDBACK_TEST_IDS } from '../constants';
import { clampPercent, MAX_PERCENT, MIN_PERCENT } from './clampPercent';

const BAR_HEIGHT = 8;
const RADIUS = 999;
const TRACK_MARGIN = 4;
const INDET_FRACTION = 0.35;
const INDET_DURATION_MS = 1300;
const LABEL_FONT_SIZE = 12;

const styles = StyleSheet.create({
  track: { height: BAR_HEIGHT, borderRadius: RADIUS, overflow: 'hidden', marginVertical: TRACK_MARGIN },
  fill: { height: '100%', borderRadius: RADIUS },
  label: { fontSize: LABEL_FONT_SIZE, textAlign: 'right', fontVariant: ['tabular-nums'] },
});

export interface ProgressBarProps {
  percent?: number | null;
  label?: string;
  indeterminate?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  color?: string;
  trackColor?: string;
  textColor?: string;
  testID?: string;
}

interface IndeterminateFillProps {
  color: string;
  width: number;
  testID: string;
}

function IndeterminateFill({ color, width, testID }: IndeterminateFillProps): React.ReactElement {
  const [anim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(anim, { toValue: 1, duration: INDET_DURATION_MS, useNativeDriver: false }),
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);

  const barWidth = width * INDET_FRACTION;
  const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [-barWidth, width] });
  return (
    <Animated.View
      style={[styles.fill, { backgroundColor: color, width: barWidth, transform: [{ translateX }] }]}
      testID={testID}
    />
  );
}

/** Determinate (0-100) or indeterminate progress bar with an optional caption; themed via UiProvider. */
export function ProgressBar(props: ProgressBarProps): React.ReactElement {
  const { theme } = useFeedbackUi();
  const {
    percent = null,
    label,
    indeterminate = false,
    accessibilityLabel,
    accessibilityHint,
    color = theme.palette.primary['500'],
    trackColor = theme.colors.border,
    textColor = theme.colors.textSecondary,
    testID = FEEDBACK_TEST_IDS.progressBar,
  } = props;
  const [width, setWidth] = useState(0);
  const safePct = clampPercent(percent);
  const fillTestID = `${testID}-fill`;
  const onLayout = (e: LayoutChangeEvent): void => setWidth(e.nativeEvent.layout.width);

  return (
    <View
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel ?? label}
      aria-busy={indeterminate}
      aria-valuemax={MAX_PERCENT}
      aria-valuemin={MIN_PERCENT}
      aria-valuenow={indeterminate ? undefined : safePct}
      aria-valuetext={label}
      role="progressbar"
      testID={testID}
    >
      <View style={[styles.track, { backgroundColor: trackColor }]} onLayout={onLayout}>
        {indeterminate ? (
          <IndeterminateFill color={color} testID={fillTestID} width={width} />
        ) : (
          <View style={[styles.fill, { backgroundColor: color, width: `${safePct}%` }]} testID={fillTestID} />
        )}
      </View>
      {!indeterminate && label !== undefined ? (
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      ) : null}
    </View>
  );
}

export default ProgressBar;
