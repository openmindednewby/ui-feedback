/**
 * ConfirmDialog - modal confirm/cancel dialog with optional destructive + loading states.
 */
import React, { useMemo } from 'react';

import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useFeedbackUi } from '../context/FeedbackUiContext';
import { DISABLED_OPACITY, MODAL_OVERLAY_COLOR, FEEDBACK_TEST_IDS } from '../constants';

const DIALOG_MAX_WIDTH = 400;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: MODAL_OVERLAY_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialog: {
    width: '100%',
    maxWidth: DIALOG_MAX_WIDTH,
    borderRadius: 12,
    padding: 20,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.25)',
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  confirmButton: {},
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: DISABLED_OPACITY,
  },
});

export interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmDisabled?: boolean;
  loading?: boolean;
  destructive?: boolean;
}

export const ConfirmDialog = ({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel,
  cancelLabel,
  confirmDisabled = false,
  loading = false,
  destructive = false,
}: ConfirmDialogProps): React.ReactElement | null => {
  const { theme, t } = useFeedbackUi();

  const colorStyles = useMemo(
    () => ({
      dialog: { backgroundColor: theme.colors.surfaceElevated },
      title: { color: theme.colors.text },
      message: { color: theme.colors.textSecondary },
      cancelButton: { borderColor: theme.colors.border },
      cancelButtonText: { color: theme.colors.text },
      confirmButton: {
        backgroundColor: destructive ? theme.semantic.error['500'] : theme.palette.primary['500'],
      },
      confirmButtonText: { color: theme.colors.surfaceElevated },
    }),
    [theme, destructive]
  );

  const resolvedConfirmLabel = confirmLabel ?? t('common.confirm');
  const resolvedCancelLabel = cancelLabel ?? t('common.cancel');

  const isConfirmDisabled = confirmDisabled || loading;

  if (!visible)
    return null;

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.overlay} testID={FEEDBACK_TEST_IDS.confirmDialog}>
        <View
          accessibilityViewIsModal
          aria-label={title}
          role="dialog"
          style={[styles.dialog, colorStyles.dialog]}
        >
          <Text style={[styles.title, colorStyles.title]}>{title}</Text>
          <Text style={[styles.message, colorStyles.message]}>{message}</Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              accessibilityHint={t('common.cancelHint')}
              accessibilityLabel={resolvedCancelLabel}
              accessibilityRole="button"
              style={[
                styles.button,
                styles.cancelButton,
                colorStyles.cancelButton,
              ]}
              testID={FEEDBACK_TEST_IDS.cancelConfirmButton}
              onPress={onCancel}
            >
              <Text style={[styles.buttonText, colorStyles.cancelButtonText]}>
                {resolvedCancelLabel}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              accessibilityHint={t('common.confirmHint')}
              accessibilityLabel={resolvedConfirmLabel}
              accessibilityRole="button"
              accessibilityState={{ disabled: isConfirmDisabled }}
              disabled={isConfirmDisabled}
              style={[
                styles.button,
                styles.confirmButton,
                colorStyles.confirmButton,
                isConfirmDisabled && styles.disabledButton,
              ]}
              testID={FEEDBACK_TEST_IDS.confirmButton}
              onPress={onConfirm}
            >
              {loading ? (
                <ActivityIndicator
                  color={theme.colors.surfaceElevated}
                  size="small"
                  testID="confirm-loading"
                />
              ) : (
                <Text
                  style={[styles.buttonText, colorStyles.confirmButtonText]}
                >
                  {resolvedConfirmLabel}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ConfirmDialog;
