import React from 'react';

import { StyleSheet, Text, View } from 'react-native';

import { useFeedbackUi } from '../context/FeedbackUiContext';

const RADIUS = 12;
const PAD = 16;
const GAP = 8;
const STACK_GAP = 12;
const TITLE_FONT = 15;
const HEADING_FONT = 16;
const MESSAGE_FONT = 14;

const styles = StyleSheet.create({
  card: { borderRadius: RADIUS, borderWidth: 1, gap: GAP, minWidth: 0, padding: PAD },
  head: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: GAP, justifyContent: 'space-between' },
  heading: { flexShrink: 1, fontSize: HEADING_FONT, fontWeight: '700' },
  message: { fontSize: MESSAGE_FONT },
  stack: { gap: STACK_GAP },
  title: { fontSize: TITLE_FONT, fontWeight: '700' },
});

export interface AttentionCardProps {
  title: string;
  heading?: string;
  status?: React.ReactNode;
  message: string;
  evidence?: React.ReactNode;
  action?: React.ReactNode;
  testID?: string;
}

/** The one item that needs a person first: its name and status, a line on why, optional evidence and the next action. */
export const AttentionCard = ({ title, heading, status, message, evidence, action, testID }: AttentionCardProps): React.ReactElement => {
  const { theme } = useFeedbackUi();
  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]} testID={testID}>
      <Text accessibilityRole="header" style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
      <View style={styles.stack}>
        {heading === undefined ? null : (
          <View style={styles.head} testID={testID === undefined ? undefined : `${testID}-head`}>
            <Text style={[styles.heading, { color: theme.colors.text }]}>{heading}</Text>
            {status}
          </View>
        )}
        <Text style={[styles.message, { color: theme.colors.textSecondary }]}>{message}</Text>
        {evidence}
        {action}
      </View>
    </View>
  );
};

export default AttentionCard;
