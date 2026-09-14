/**
 * ErrorState - generic error display with optional retry button.
 *
 * Opt-in (1.12.0): `title`, a decorative `icon` well and a `secondaryAction`. A caller
 * passing none of them renders the same element tree as before.
 */
import React from 'react';

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useFeedbackUi } from '../context/FeedbackUiContext';
import { FEEDBACK_TEST_IDS } from '../constants';

import { ErrorStateIconWell, ErrorStateSecondaryButton, type ErrorStateAction } from './ErrorStateParts';

export type { ErrorStateAction } from './ErrorStateParts';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MESSAGE_FONT_SIZE = 16;
const CONTAINER_PADDING = 20;
const BUTTON_MARGIN_TOP = 12;
const BUTTON_PADDING_V = 8;
const BUTTON_PADDING_H = 16;
const BUTTON_BORDER_RADIUS = 6;
const BUTTON_FONT_SIZE = 14;
const TITLE_FONT_SIZE = 20;
const TITLE_MARGIN_BOTTOM = 8;
const ACTION_GAP = 12;

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: CONTAINER_PADDING,
  },
  title: {
    fontSize: TITLE_FONT_SIZE,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: TITLE_MARGIN_BOTTOM,
  },
  message: {
    fontSize: MESSAGE_FONT_SIZE,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    columnGap: ACTION_GAP,
  },
  retryButton: {
    marginTop: BUTTON_MARGIN_TOP,
    paddingVertical: BUTTON_PADDING_V,
    paddingHorizontal: BUTTON_PADDING_H,
    borderRadius: BUTTON_BORDER_RADIUS,
  },
  retryText: {
    fontSize: BUTTON_FONT_SIZE,
    fontWeight: '600',
  },
});

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  testID?: string;
  /** Heading above the message (role="heading" on web). */
  title?: string;
  /** Rendered inside a circular well above the title; decorative (aria-hidden). */
  icon?: React.ReactNode;
  /** Outline button beside retry, e.g. "Back to library". */
  secondaryAction?: ErrorStateAction;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const ErrorState = ({
  message,
  onRetry,
  testID = FEEDBACK_TEST_IDS.errorState,
  title,
  icon,
  secondaryAction,
}: ErrorStateProps): React.ReactElement => {
  const { theme, t } = useFeedbackUi();
  const errorColor = theme.semantic.error['500'];
  const primary = theme.palette.primary['500'];
  const hasTitle = typeof title === 'string' && title !== '';
  const hasIcon = icon !== undefined && icon !== null;
  // Under a heading the message is body copy; alone it stays error-coloured as before.
  const messageColor = hasTitle ? theme.colors.textSecondary : errorColor;

  const retry =
    typeof onRetry === 'function' ? (
      <TouchableOpacity
        accessibilityHint={t('common.retryHint')}
        accessibilityLabel={t('common.retry')}
        accessibilityRole="button"
        style={[styles.retryButton, { backgroundColor: primary }]}
        testID={FEEDBACK_TEST_IDS.errorStateRetry}
        onPress={onRetry}
      >
        <Text style={[styles.retryText, { color: theme.colors.surfaceElevated }]}>
          {t('common.retry')}
        </Text>
      </TouchableOpacity>
    ) : null;

  return (
    <View style={styles.container} testID={testID}>
      {hasIcon ? <ErrorStateIconWell icon={icon} testID={`${testID}-icon`} tint={errorColor} /> : null}
      {hasTitle ? (
        <Text
          accessibilityRole="header"
          style={[styles.title, { color: theme.colors.text }]}
          testID={`${testID}-title`}
        >
          {title}
        </Text>
      ) : null}
      <Text style={[styles.message, { color: messageColor }]}>{message}</Text>
      {secondaryAction === undefined ? (
        retry
      ) : (
        <View style={styles.actions}>
          {retry}
          <ErrorStateSecondaryButton action={secondaryAction} theme={theme} />
        </View>
      )}
    </View>
  );
};

export default ErrorState;
