/**
 * Opt-in pieces of ErrorState: the decorative icon well and the outline secondary action.
 * Both read colours only from the injected theme.
 */
import React from 'react';

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import type { FeedbackTheme } from '../context/FeedbackUiContext';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const WELL_SIZE = 56;
const WELL_MARGIN_BOTTOM = 16;
/** Opacity of the error-colour fill behind the icon, so the well reads as a tint. */
const WELL_TINT_OPACITY = 0.12;
const BUTTON_MARGIN_TOP = 12;
const BUTTON_PADDING_V = 8;
const BUTTON_PADDING_H = 16;
const BUTTON_BORDER_RADIUS = 6;
const BUTTON_BORDER_WIDTH = 1;
const BUTTON_FONT_SIZE = 14;

const styles = StyleSheet.create({
  well: {
    width: WELL_SIZE,
    height: WELL_SIZE,
    borderRadius: WELL_SIZE / 2,
    marginBottom: WELL_MARGIN_BOTTOM,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  wellTint: {
    ...StyleSheet.absoluteFillObject,
    opacity: WELL_TINT_OPACITY,
  },
  secondaryButton: {
    marginTop: BUTTON_MARGIN_TOP,
    paddingVertical: BUTTON_PADDING_V,
    paddingHorizontal: BUTTON_PADDING_H,
    borderRadius: BUTTON_BORDER_RADIUS,
    borderWidth: BUTTON_BORDER_WIDTH,
  },
  secondaryText: {
    fontSize: BUTTON_FONT_SIZE,
    fontWeight: '600',
  },
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ErrorStateAction {
  label: string;
  hint: string;
  onPress: () => void;
  testID: string;
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

interface IconWellProps {
  icon: React.ReactNode;
  tint: string;
  testID: string;
}

/** Circular well tinted with the error colour; decorative, hidden from assistive tech. */
export const ErrorStateIconWell = ({ icon, tint, testID }: IconWellProps): React.ReactElement => (
  <View aria-hidden style={styles.well} testID={testID}>
    <View style={[styles.wellTint, { backgroundColor: tint }]} />
    {icon}
  </View>
);

interface SecondaryButtonProps {
  action: ErrorStateAction;
  theme: FeedbackTheme;
}

/** Outline-styled companion to the retry button. */
export const ErrorStateSecondaryButton = ({
  action,
  theme,
}: SecondaryButtonProps): React.ReactElement => (
  <TouchableOpacity
    accessibilityHint={action.hint}
    accessibilityLabel={action.label}
    accessibilityRole="button"
    style={[styles.secondaryButton, { borderColor: theme.colors.border }]}
    testID={action.testID}
    onPress={action.onPress}
  >
    <Text style={[styles.secondaryText, { color: theme.colors.text }]}>{action.label}</Text>
  </TouchableOpacity>
);
