import React from 'react';

import { StyleSheet, View } from 'react-native';

import { useFeedbackUi } from '../context/FeedbackUiContext';

const BORDER_WIDTH = 1;
const BORDER_RADIUS = 8;
const PADDING = 12;
const LINE_GAP = 4;

const styles = StyleSheet.create({
  notice: { borderWidth: BORDER_WIDTH, borderRadius: BORDER_RADIUS, padding: PADDING, gap: LINE_GAP },
});

export interface ErrorNoticeProps {
  children: React.ReactNode;
  testID?: string;
}

/** A bordered box in the theme's error colours that announces its lines politely; the caller supplies the lines. */
export const ErrorNotice = ({ children, testID }: ErrorNoticeProps): React.ReactElement => {
  const { theme } = useFeedbackUi();
  const { error } = theme.semantic;
  return (
    <View
      aria-live="polite"
      style={[styles.notice, { borderColor: error['500'], backgroundColor: error['50'] }]}
      testID={testID}
    >
      {children}
    </View>
  );
};
