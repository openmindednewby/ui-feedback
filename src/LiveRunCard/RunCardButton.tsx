import React from 'react';

import { Pressable, StyleSheet, Text } from 'react-native';

import { MIN_TOUCH_TARGET_PX } from '@dloizides/a11y';

import { DISABLED_OPACITY } from '../constants';

const styles = StyleSheet.create({
  button: {
    minHeight: MIN_TOUCH_TARGET_PX,
    minWidth: MIN_TOUCH_TARGET_PX,
    paddingHorizontal: 14,
    borderRadius: 6,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  text: { fontSize: 14, fontWeight: '600' },
});

export interface RunCardButtonProps {
  label: string;
  hint: string;
  color: string;
  onPress: () => void;
  testID: string;
  disabled?: boolean;
  expanded?: boolean;
}

/** Outline button with a 48px hit box, used for Cancel and the disclosure toggles. */
export function RunCardButton({ label, hint, color, onPress, testID, disabled = false, expanded }: RunCardButtonProps): React.ReactElement {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityState={{ disabled, expanded }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.button, { borderColor: color }, disabled ? { opacity: DISABLED_OPACITY } : null]}
      testID={testID}
    >
      <Text style={[styles.text, { color }]}>{label}</Text>
    </Pressable>
  );
}
