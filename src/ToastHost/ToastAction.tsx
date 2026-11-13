import React from 'react';

import { Pressable, StyleSheet, Text } from 'react-native';

import { MIN_TOUCH_TARGET } from '../constants';

const ACTION_PADDING_HORIZONTAL = 12;
const ACTION_BORDER_RADIUS = 6;
const ACTION_FONT_SIZE = 14;

export interface ToastActionSpec {
  label: string;
  hint?: string;
  onPress: () => void;
}

interface ToastActionProps {
  action: ToastActionSpec;
  color: string;
  testID: string;
  onDismiss: () => void;
}

const styles = StyleSheet.create({
  button: {
    minWidth: MIN_TOUCH_TARGET,
    minHeight: MIN_TOUCH_TARGET,
    paddingHorizontal: ACTION_PADDING_HORIZONTAL,
    borderRadius: ACTION_BORDER_RADIUS,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontSize: ACTION_FONT_SIZE, fontWeight: '700' },
});

/** The toast's action button: runs the action, then dismisses the toast. */
export const ToastAction = ({ action, color, testID, onDismiss }: ToastActionProps): React.ReactElement => {
  const handlePress = (): void => {
    action.onPress();
    onDismiss();
  };

  return (
    <Pressable
      accessibilityHint={action.hint ?? action.label}
      accessibilityLabel={action.label}
      accessibilityRole="button"
      style={[styles.button, { borderColor: color }]}
      testID={testID}
      onPress={handlePress}
    >
      <Text style={[styles.label, { color }]}>{action.label}</Text>
    </Pressable>
  );
};
