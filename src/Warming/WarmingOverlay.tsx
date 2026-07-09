/**
 * WarmingOverlay — a calm, branded, full-screen "warming up…" overlay for the
 * cold-start UX (Move 3a). It subscribes to the framework-agnostic warmingStore
 * via `useSyncExternalStore` and renders ONLY while `isWarming`, then disappears
 * on auto-settle (so it never permanently traps focus).
 *
 * This is intentionally NOT an error state: a title + subtitle + spinner, with an
 * optional attempt hint. Colours come from the UiProvider theme (`useFeedbackUi`)
 * or an explicit `theme` override — nothing hardcoded. Copy comes from `labels`,
 * a typed bag with English defaults merged with a partial override, so consuming
 * apps can localize but nothing breaks without it.
 */
import React, { useSyncExternalStore } from 'react';

import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useFeedbackUi, type FeedbackTheme } from '../context/FeedbackUiContext';
import { FEEDBACK_TEST_IDS } from '../constants';
import { getWarmingSnapshot, subscribeWarming } from './warmingStore';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const OVERLAY_Z_INDEX = 100000;
const CARD_GAP = 12;
const TITLE_FONT_SIZE = 20;
const SUBTITLE_FONT_SIZE = 15;
const ATTEMPT_FONT_SIZE = 13;
const CARD_PADDING = 24;
const NO_ATTEMPT = 0;

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: OVERLAY_Z_INDEX,
    elevation: OVERLAY_Z_INDEX,
    padding: CARD_PADDING,
  },
  card: {
    alignItems: 'center',
    gap: CARD_GAP,
    maxWidth: 320,
  },
  title: {
    fontSize: TITLE_FONT_SIZE,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: SUBTITLE_FONT_SIZE,
    textAlign: 'center',
  },
  attempt: {
    fontSize: ATTEMPT_FONT_SIZE,
    textAlign: 'center',
  },
});

// ---------------------------------------------------------------------------
// Labels
// ---------------------------------------------------------------------------

/** Copy for the overlay. All fields have English defaults; apps override any subset. */
export interface WarmingOverlayLabels {
  /** Big line, e.g. "Warming up…". */
  title: string;
  /** Reassuring second line, e.g. "This only takes a moment". */
  subtitle: string;
  /** Screen-reader label for the whole overlay. */
  accessibilityLabel: string;
  /** Optional per-attempt hint, given the current attempt number. */
  attemptHint: (attempt: number) => string;
}

const DEFAULT_WARMING_LABELS: WarmingOverlayLabels = {
  title: 'Warming up…',
  subtitle: 'This only takes a moment',
  accessibilityLabel: 'Warming up, please wait',
  attemptHint: (attempt) => `Attempt ${String(attempt)}`,
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface WarmingOverlayProps {
  /** Partial copy override; unset fields fall back to English defaults. */
  labels?: Partial<WarmingOverlayLabels>;
  /** Theme override; defaults to the mounted UiProvider theme. */
  theme?: FeedbackTheme;
  /** testID for the overlay container (children derive `${prefix}-title`, etc.). */
  testIdPrefix?: string;
  /** Show the "Attempt N" hint under the subtitle (default: false). */
  showAttempt?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const WarmingOverlay = ({
  labels,
  theme: themeOverride,
  testIdPrefix = FEEDBACK_TEST_IDS.warmingOverlay,
  showAttempt = false,
}: WarmingOverlayProps): React.ReactElement | null => {
  const ctx = useFeedbackUi();
  const snapshot = useSyncExternalStore(subscribeWarming, getWarmingSnapshot, getWarmingSnapshot);

  const theme = themeOverride ?? ctx.theme;
  const mergedLabels = { ...DEFAULT_WARMING_LABELS, ...labels };

  if (!snapshot.isWarming) return null;

  const colors = theme.colors;
  const primary = theme.palette.primary['500'];
  const showHint = showAttempt && snapshot.attempt > NO_ATTEMPT;

  return (
    <View
      accessibilityLabel={mergedLabels.accessibilityLabel}
      accessibilityRole="alert"
      style={[styles.overlay, { backgroundColor: colors.background }]}
      testID={testIdPrefix}
    >
      <View style={styles.card}>
        <ActivityIndicator color={primary} size="large" />
        <Text style={[styles.title, { color: colors.text }]} testID={`${testIdPrefix}-title`}>
          {mergedLabels.title}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]} testID={`${testIdPrefix}-subtitle`}>
          {mergedLabels.subtitle}
        </Text>
        {showHint ? (
          <Text style={[styles.attempt, { color: colors.textSecondary }]} testID={`${testIdPrefix}-attempt`}>
            {mergedLabels.attemptHint(snapshot.attempt)}
          </Text>
        ) : null}
      </View>
    </View>
  );
};

export default WarmingOverlay;
