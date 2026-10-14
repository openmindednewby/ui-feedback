import React, { useState } from 'react';

import { StyleSheet, Text, View } from 'react-native';

import { useFeedbackUi } from '../context/FeedbackUiContext';
import { RunCardButton } from './RunCardButton';
import { barFraction, splitShorterSteps } from './runGroups';
import { runToneColor } from './runTone';

import type { RunStep } from './runGroups';
import type { LiveRunCardLabels } from './types';

const BAR_HEIGHT = 8;
const LABEL_MIN_WIDTH = 220;
const LABEL_SHARE = '35%';
const LABEL_LINES = 2;
const DURATION_WIDTH = 64;
const PERCENT = 100;

const styles = StyleSheet.create({
  list: { gap: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stack: { gap: 4 },
  label: { fontSize: 13, flexBasis: LABEL_SHARE, flexGrow: 0, flexShrink: 0, minWidth: LABEL_MIN_WIDTH },
  compactLabel: { fontSize: 13, flexGrow: 1, flexShrink: 1, minWidth: 0 },
  track: { flexGrow: 1, flexShrink: 1, flexBasis: 80, height: BAR_HEIGHT, borderRadius: 2, overflow: 'hidden' },
  fullTrack: { height: BAR_HEIGHT, borderRadius: 2, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 2 },
  duration: { fontSize: 13, width: DURATION_WIDTH, textAlign: 'right', fontVariant: ['tabular-nums'] },
  strong: { fontWeight: '700' },
});

interface Props {
  steps: readonly RunStep[];
  maxBars: number;
  labels: LiveRunCardLabels;
  compact: boolean;
  testID: string;
}

/** One bar per step scaled to the longest; shorter steps beyond `maxBars` fold behind "+N shorter steps". */
export function RunStepBars({ steps, maxBars, labels, compact, testID }: Props): React.ReactElement {
  const { theme } = useFeedbackUi();
  const [all, setAll] = useState(false);
  const split = splitShorterSteps(steps, all ? steps.length : maxBars);
  const maxSec = steps.reduce((m, s) => Math.max(m, s.durationSec), 0);
  const folded = split.hiddenCount > 0;
  const canFold = all && steps.length > maxBars;
  return (
    <View style={styles.list} testID={testID}>
      {split.visible.map((step, i) => {
        const color = runToneColor(theme, step.state);
        const duration = labels.formatDuration(step.durationSec);
        const strong = step.state === 'running' ? styles.strong : null;
        const name = <Text style={[compact ? styles.compactLabel : styles.label, { color: theme.colors.text }, strong]} numberOfLines={LABEL_LINES} testID={`${testID}-name-${String(i)}`}>{step.label}</Text>;
        const time = <Text style={[styles.duration, { color: theme.colors.textSecondary }, strong]}>{duration}</Text>;
        const bar = (
          <View style={[compact ? styles.fullTrack : styles.track, { backgroundColor: theme.colors.border }]}>
            <View style={[styles.fill, { backgroundColor: color, width: `${barFraction(step.durationSec, maxSec) * PERCENT}%` }]} />
          </View>
        );
        const a11y = { accessible: true, accessibilityLabel: labels.stepA11y(step.label, duration), testID: `${testID}-row-${String(i)}` };
        return compact ? (
          <View key={`${step.label}-${String(i)}`} style={styles.stack} {...a11y}>
            <View style={styles.row}>{name}{time}</View>
            {bar}
          </View>
        ) : (
          <View key={`${step.label}-${String(i)}`} style={styles.row} {...a11y}>{name}{bar}{time}</View>
        );
      })}
      {folded || canFold ? (
        <RunCardButton
          label={folded ? labels.moreSteps(split.hiddenCount) : labels.fewerSteps}
          hint={labels.moreStepsHint}
          color={theme.colors.textSecondary}
          onPress={() => setAll(!all)}
          expanded={all}
          testID={`${testID}-more`}
        />
      ) : null}
    </View>
  );
}
