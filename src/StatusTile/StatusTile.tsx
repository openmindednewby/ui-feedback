import React from 'react';

import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useReducedMotion } from '@dloizides/ui-motion';

import { useFeedbackUi } from '../context/FeedbackUiContext';
import { tileMotionStyle } from './tileMotion';

import type { TileInteraction } from './tileMotion';
import type { StyleProp, ViewStyle } from 'react-native';

const RADIUS = 8;
const PAD = 12;
const ACCENT = 3;
const MIN_HIT = 44;

const styles = StyleSheet.create({
  head: { alignItems: 'center', flexDirection: 'row', gap: 6 },
  line: { fontSize: 13 },
  meta: { fontSize: 12 },
  status: { alignSelf: 'flex-start' },
  muted: { borderStyle: 'dashed' },
  title: { flexShrink: 1, fontSize: 14, fontWeight: '700' },
  wrap: { borderRadius: RADIUS, borderWidth: 1, gap: 6, minHeight: MIN_HIT, minWidth: 0, padding: PAD },
});

export interface StatusTileProps {
  title: string;
  icon?: React.ReactNode;
  status?: React.ReactNode;
  lines: readonly string[];
  accentColor?: string;
  muted?: boolean;
  onPress?: () => void;
  accessibilityLabel: string;
  accessibilityHint: string;
  testID?: string;
}

type PressState = Partial<TileInteraction> & { pressed: boolean };

/** A status tile with title, status chip, result line and meta line that lifts on hover and focus; muted greys it for a check that cannot run. */
export const StatusTile = ({ title, icon, status, lines, accentColor, muted = false, onPress, accessibilityLabel, accessibilityHint, testID }: StatusTileProps): React.ReactElement => {
  const { theme } = useFeedbackUi();
  const reduced = useReducedMotion();
  const accent = accentColor === undefined ? { borderColor: theme.colors.border } : { borderColor: accentColor, borderTopWidth: ACCENT, paddingTop: PAD - ACCENT + 1 };
  const interactive = onPress !== undefined;
  const styleOf = (state: PressState): StyleProp<ViewStyle> => [
    styles.wrap,
    { backgroundColor: muted ? theme.colors.background : theme.colors.surface },
    accent,
    muted ? styles.muted : null,
    tileMotionStyle(theme, { interaction: { hovered: state.hovered === true, pressed: state.pressed, focused: state.focused === true }, reduced, interactive, accentColor }),
  ];
  return (
    <Pressable accessibilityHint={accessibilityHint} accessibilityLabel={accessibilityLabel} accessibilityRole={interactive ? 'button' : undefined} disabled={!interactive} style={styleOf} dataSet={{ muted: muted ? 'true' : 'false' }} testID={testID} onPress={onPress}>
      <View style={styles.head}>
        {icon}
        <Text numberOfLines={1} style={[styles.title, { color: muted ? theme.colors.textSecondary : theme.colors.text }]}>{title}</Text>
      </View>
      {status === undefined ? null : <View style={styles.status}>{status}</View>}
      {lines.map((line, index) => (
        <Text key={`${String(index)}-${line}`} numberOfLines={2} style={[index === 0 ? styles.line : styles.meta, { color: index === 0 && !muted ? theme.colors.text : theme.colors.textSecondary }]}>{line}</Text>
      ))}
    </Pressable>
  );
};

export default StatusTile;
