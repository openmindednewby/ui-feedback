import React from 'react';

import { StyleSheet, Text, View } from 'react-native';

import { semanticScale } from '../CheckStatus/semanticScale';
import { useFeedbackUi } from '../context/FeedbackUiContext';
import { meetsThreshold, meterPercent } from './meterScale';

const TRACK_HEIGHT = 8;
const MARKER_WIDTH = 2;
const MARKER_HEIGHT = 16;
const MARKER_TOP = -4;
const RADIUS = 999;
const FONT = 12;

const styles = StyleSheet.create({
  fill: { borderRadius: RADIUS, height: '100%' },
  head: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between' },
  marker: { height: MARKER_HEIGHT, marginLeft: -MARKER_WIDTH / 2, position: 'absolute', top: MARKER_TOP, width: MARKER_WIDTH },
  text: { fontSize: FONT, fontVariant: ['tabular-nums'] },
  track: { borderRadius: RADIUS, height: TRACK_HEIGHT },
  wrap: { gap: 6 },
});

export interface ThresholdMeterProps {
  value: number;
  threshold: number;
  max?: number;
  lowerPasses?: boolean;
  label: string;
  valueText: string;
  accessibilityHint: string;
  testID?: string;
}

function partId(testID: string | undefined, part: string): string | undefined {
  return testID === undefined ? undefined : `${testID}-${part}`;
}

/** A score against its pass line: the fill is the score, the mark is the threshold, the fill tone says pass or fail. */
export const ThresholdMeter = (props: ThresholdMeterProps): React.ReactElement => {
  const { value, threshold, max = 1, lowerPasses = false, label, valueText, accessibilityHint, testID } = props;
  const { theme } = useFeedbackUi();
  const passes = meetsThreshold(value, threshold, lowerPasses);
  const fill = passes ? semanticScale(theme, 'success') ?? theme.palette.primary['500'] : theme.semantic.error['500'];
  return (
    <View accessibilityHint={accessibilityHint} accessibilityLabel={label} aria-valuemax={max} aria-valuemin={0} aria-valuenow={value} aria-valuetext={valueText} dataSet={{ passes: String(passes) }} role="meter" style={styles.wrap} testID={testID}>
      <View style={styles.head}>
        <Text style={[styles.text, { color: theme.colors.textSecondary }]}>{label}</Text>
        <Text style={[styles.text, { color: theme.colors.text }]}>{valueText}</Text>
      </View>
      <View style={[styles.track, { backgroundColor: theme.colors.border }]}>
        <View style={[styles.fill, { backgroundColor: fill, width: `${meterPercent(value, max)}%` }]} testID={partId(testID, 'fill')} />
        <View style={[styles.marker, { backgroundColor: theme.colors.text, left: `${meterPercent(threshold, max)}%` }]} testID={partId(testID, 'threshold')} />
      </View>
    </View>
  );
};

export default ThresholdMeter;
