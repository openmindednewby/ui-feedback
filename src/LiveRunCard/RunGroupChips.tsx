import React from 'react';

import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MIN_TOUCH_TARGET_PX } from '@dloizides/a11y';

import { useFeedbackUi } from '../context/FeedbackUiContext';
import { summariseDoneGroups } from './runGroups';
import { runToneColor } from './runTone';

import type { RunGroup, RunStepState } from './runGroups';
import type { LiveRunCardLabels } from './types';

const MARK: Record<RunStepState, string> = { done: '✓', running: '●', pending: '○', failed: '✕' };

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { borderWidth: 1, borderRadius: 6, paddingHorizontal: 10, justifyContent: 'center' },
  tap: { minHeight: MIN_TOUCH_TARGET_PX },
  still: { paddingVertical: 4 },
  text: { fontSize: 13, fontVariant: ['tabular-nums'] },
  strong: { fontWeight: '700' },
});

interface ChipsProps {
  groups: readonly RunGroup[];
  labels: LiveRunCardLabels;
  testID: string;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}

function chipText(group: RunGroup, labels: LiveRunCardLabels): string {
  return `${MARK[group.state]} ${group.label} ${labels.formatDuration(group.durationSec)}`;
}

/** One chip per group; tappable chips (48px) choose which group's step times show. */
export function RunGroupChips({ groups, labels, testID, selectedId = null, onSelect }: ChipsProps): React.ReactElement {
  const { theme } = useFeedbackUi();
  return (
    <View style={styles.row} testID={testID}>
      {groups.map((group) => {
        const color = runToneColor(theme, group.state);
        const selected = group.id === selectedId;
        const a11y = labels.groupA11y(group.label, group.state, labels.formatDuration(group.durationSec));
        const body = (
          <Text style={[styles.text, { color }, selected || group.state === 'running' ? styles.strong : null]}>
            {chipText(group, labels)}
          </Text>
        );
        const look = [styles.chip, { borderColor: color, backgroundColor: selected ? theme.colors.surfaceElevated : theme.colors.surface }];
        if (onSelect === undefined) {
          return (
            <View key={group.id} style={[look, styles.still]} accessible accessibilityLabel={a11y} testID={`${testID}-${group.id}`}>
              {body}
            </View>
          );
        }
        return (
          <Pressable
            key={group.id}
            accessibilityRole="button"
            accessibilityLabel={a11y}
            accessibilityHint={labels.groupHint}
            accessibilityState={{ selected }}
            onPress={() => onSelect(group.id)}
            style={[look, styles.tap]}
            testID={`${testID}-${group.id}`}
          >
            {body}
          </Pressable>
        );
      })}
    </View>
  );
}

/** Compact: every finished group folds into one "done" chip; the rest keep their own chip. */
export function RunGroupSummary({ groups, labels, testID }: ChipsProps): React.ReactElement {
  const { theme } = useFeedbackUi();
  const done = summariseDoneGroups(groups);
  const open = groups.filter((g) => g.state !== 'done');
  const doneColor = runToneColor(theme, 'done');
  const doneText = labels.doneSummary(done.count, labels.formatDuration(done.durationSec));
  return (
    <View style={styles.row} testID={testID}>
      {done.count > 0 ? (
        <View style={[styles.chip, styles.still, { borderColor: doneColor }]} accessible accessibilityLabel={doneText} testID={`${testID}-done`}>
          <Text style={[styles.text, { color: doneColor }]}>{`${MARK.done} ${doneText}`}</Text>
        </View>
      ) : null}
      <RunGroupChips groups={open} labels={labels} testID={`${testID}-open`} />
    </View>
  );
}
