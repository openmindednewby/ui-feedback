/**
 * EmptyListState - empty-collection message with an optional call-to-action.
 *
 * The CTA navigates via the `navigate` callback supplied through FeedbackUiProvider
 * (the host app adapts its router, e.g. expo-router's `router.push`).
 */
import React, { useCallback } from 'react';

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useFeedbackUi } from '../context/FeedbackUiContext';
import { FEEDBACK_TEST_IDS } from '../constants';

const MESSAGE_FONT_SIZE = 16;
const CTA_MARGIN_TOP = 16;
const CTA_PADDING_VERTICAL = 10;
const CTA_PADDING_HORIZONTAL = 20;
const CTA_BORDER_RADIUS = 8;
const CTA_FONT_SIZE = 14;
const CONTAINER_PADDING = 32;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: CONTAINER_PADDING,
  },
  message: {
    fontSize: MESSAGE_FONT_SIZE,
    textAlign: 'center',
  },
  ctaButton: {
    marginTop: CTA_MARGIN_TOP,
    paddingVertical: CTA_PADDING_VERTICAL,
    paddingHorizontal: CTA_PADDING_HORIZONTAL,
    borderRadius: CTA_BORDER_RADIUS,
  },
  ctaText: {
    fontSize: CTA_FONT_SIZE,
    fontWeight: '600',
  },
});

export interface EmptyListStateProps {
  messageKey: string;
  ctaTextKey?: string;
  ctaHintKey?: string;
  ctaRoute?: string;
  testID: string;
}

export const EmptyListState = ({
  messageKey,
  ctaTextKey,
  ctaHintKey,
  ctaRoute,
  testID,
}: EmptyListStateProps): React.ReactElement => {
  const { theme, t, navigate } = useFeedbackUi();
  const { colors } = theme;
  const primary = theme.palette.primary['500'];

  const handlePress = useCallback((): void => {
    if (typeof ctaRoute === 'string' && typeof navigate === 'function') navigate(ctaRoute);
  }, [navigate, ctaRoute]);

  const showCta = typeof ctaTextKey === 'string'
    && typeof ctaHintKey === 'string'
    && typeof ctaRoute === 'string';

  return (
    <View style={styles.container} testID={testID}>
      <Text style={[styles.message, { color: colors.textSecondary }]}>
        {t(messageKey)}
      </Text>
      {showCta ? (
        <TouchableOpacity
          accessibilityHint={t(ctaHintKey as string)}
          accessibilityLabel={t(ctaTextKey as string)}
          accessibilityRole="button"
          style={[styles.ctaButton, { backgroundColor: primary }]}
          testID={FEEDBACK_TEST_IDS.emptyListCta}
          onPress={handlePress}
        >
          <Text style={[styles.ctaText, { color: colors.background }]}>
            {t(ctaTextKey as string)}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export default EmptyListState;
