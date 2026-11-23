import React from 'react';

import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useFeedbackUi } from '../context/FeedbackUiContext';

export type CheckStatusVariant = 'tile' | 'row';

const RADIUS = 8;
const PAD = 12;
const GAP = 8;
const MIN_HIT = 44;
const TITLE_FONT = 14;
const DETAIL_FONT = 12;

const styles = StyleSheet.create({
  detail: { fontSize: DETAIL_FONT },
  row: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  tile: { flexBasis: 0, flexGrow: 1, minWidth: 0 },
  title: { fontSize: TITLE_FONT, fontWeight: '600' },
  words: { flexShrink: 1, gap: 2 },
  wrap: { borderRadius: RADIUS, borderWidth: 1, gap: GAP, minHeight: MIN_HIT, padding: PAD },
});

export interface CheckStatusProps {
  title: string;
  detail?: string;
  status?: React.ReactNode;
  variant?: CheckStatusVariant;
  onPress?: () => void;
  accessibilityLabel: string;
  accessibilityHint: string;
  testID?: string;
}

/** One check as a tile (equal share of a row) or a row (title left, status right); pressing it opens the check. */
export const CheckStatus = (props: CheckStatusProps): React.ReactElement => {
  const { title, detail, status, variant = 'tile', onPress, accessibilityLabel, accessibilityHint, testID } = props;
  const { theme } = useFeedbackUi();
  const style = [styles.wrap, variant === 'tile' ? styles.tile : styles.row, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }];
  const body = (
    <>
      <View style={styles.words}>
        <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
        {detail === undefined ? null : <Text style={[styles.detail, { color: theme.colors.textSecondary }]}>{detail}</Text>}
      </View>
      {status}
    </>
  );
  if (onPress === undefined) {
    return <View accessibilityHint={accessibilityHint} accessibilityLabel={accessibilityLabel} style={style} testID={testID}>{body}</View>;
  }
  return (
    <Pressable accessibilityHint={accessibilityHint} accessibilityLabel={accessibilityLabel} accessibilityRole="button" style={style} testID={testID} onPress={onPress}>
      {body}
    </Pressable>
  );
};

export default CheckStatus;
