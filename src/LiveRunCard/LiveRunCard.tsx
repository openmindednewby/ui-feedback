import React, { useState } from 'react';

import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { useFeedbackUi } from '../context/FeedbackUiContext';
import { ProgressBar } from '../ProgressBar/ProgressBar';
import { RunCardButton } from './RunCardButton';
import { RunGroupChips, RunGroupSummary } from './RunGroupChips';
import { RunStepBars } from './RunStepBars';
import { defaultGroupId, progressPercent } from './runGroups';
import { runToneColor } from './runTone';

import type { LiveRunCardProps } from './types';

/** Below this window width the card renders compact: summary chips, step timings behind a toggle. */
export const LIVE_RUN_CARD_COMPACT_MAX_PX = 640;
const DEFAULT_MAX_BARS = 4;

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 8, padding: 14, gap: 10 },
  head: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 10 },
  titleBox: { flexGrow: 1, flexShrink: 1, flexBasis: 200, minWidth: 0, gap: 2 },
  pill: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 2, alignSelf: 'flex-start' },
  pillText: { fontSize: 12, fontWeight: '700' },
  title: { fontSize: 16, fontWeight: '700' },
  meta: { fontSize: 13 },
  step: { fontSize: 14, fontWeight: '600' },
});

/** Presentational card for one active run: status, progress, per-group chips and step-time bars. */
export function LiveRunCard(props: LiveRunCardProps): React.ReactElement {
  const { title, status = 'running', currentStep = null, progress = null, groups, labels, onCancel, cancelDisabled = false } = props;
  const { maxBars = DEFAULT_MAX_BARS, testID = 'live-run-card' } = props;
  const { theme } = useFeedbackUi();
  const { width } = useWindowDimensions();
  const compact = props.compact ?? width < LIVE_RUN_CARD_COMPACT_MAX_PX;
  const [picked, setPicked] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const selectedId = groups.some((g) => g.id === picked) ? picked : defaultGroupId(groups);
  const selected = groups.find((g) => g.id === selectedId);
  const tone = runToneColor(theme, status);
  const percent = progressPercent(progress);
  const showTimings = !compact || open;
  const muted = { color: theme.colors.textSecondary };

  return (
    <View style={[styles.card, { borderColor: tone, backgroundColor: theme.colors.surface }]} testID={testID}>
      <View style={styles.head}>
        <View style={[styles.pill, { borderColor: tone }]}>
          <Text style={[styles.pillText, { color: tone }]} testID={`${testID}-status`}>{labels.status}</Text>
        </View>
        <View style={styles.titleBox}>
          <Text style={[styles.title, { color: theme.colors.text }]} testID={`${testID}-title`}>{title}</Text>
          <Text style={[styles.meta, muted]} testID={`${testID}-meta`}>{labels.meta}</Text>
        </View>
        {onCancel !== undefined ? (
          <RunCardButton label={labels.cancel} hint={labels.cancelHint} color={theme.semantic.error['500']} onPress={onCancel} disabled={cancelDisabled} testID={`${testID}-cancel`} />
        ) : null}
      </View>
      {currentStep !== null && currentStep !== '' ? (
        <Text style={[styles.step, { color: theme.colors.text }]} testID={`${testID}-step`}>{currentStep}</Text>
      ) : null}
      {percent !== null ? (
        <ProgressBar percent={percent} label={labels.progress} accessibilityLabel={labels.progressA11y} color={tone} testID={`${testID}-progress`} />
      ) : null}
      {percent === null && labels.progress !== undefined ? <Text style={[styles.meta, muted]} testID={`${testID}-progress-text`}>{labels.progress}</Text> : null}
      {compact ? <RunGroupSummary groups={groups} labels={labels} testID={`${testID}-summary`} /> : null}
      {compact ? (
        <RunCardButton label={labels.stepTimings} hint={labels.stepTimingsHint} color={theme.colors.textSecondary} onPress={() => setOpen(!open)} expanded={open} testID={`${testID}-timings-toggle`} />
      ) : null}
      {showTimings ? <RunGroupChips groups={groups} labels={labels} selectedId={selectedId} onSelect={setPicked} testID={`${testID}-groups`} /> : null}
      {showTimings && selected !== undefined && selected.steps.length > 0 ? (
        <RunStepBars key={selected.id} steps={selected.steps} maxBars={maxBars} labels={labels} testID={`${testID}-steps`} />
      ) : null}
    </View>
  );
}
