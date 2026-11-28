import type { ViewStyle } from 'react-native';

import type { FeedbackTheme } from '../context/FeedbackUiContext';

export const TILE_MOTION_MS = 160;
const LIFT = -2;
const EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)';
const RAISED_OPACITY = 0.12;
const PRESSED_OPACITY = 0.06;
const RAISED_RADIUS = 10;
const PRESSED_RADIUS = 4;
const RAISED_OFFSET = 4;
const PRESSED_OFFSET = 1;
const FOCUS_RING = 2;

export interface TileInteraction {
  hovered: boolean;
  pressed: boolean;
  focused: boolean;
}

export interface TileMotionInput {
  interaction: TileInteraction;
  reduced: boolean;
  interactive: boolean;
  accentColor?: string;
}

export type TileMotionStyle = ViewStyle & {
  transitionDuration?: string;
  transitionProperty?: string;
  transitionTimingFunction?: string;
};

function shadowOf(theme: FeedbackTheme, pressed: boolean): ViewStyle {
  return {
    shadowColor: theme.colors.text,
    shadowOffset: { width: 0, height: pressed ? PRESSED_OFFSET : RAISED_OFFSET },
    shadowOpacity: pressed ? PRESSED_OPACITY : RAISED_OPACITY,
    shadowRadius: pressed ? PRESSED_RADIUS : RAISED_RADIUS,
  };
}

/** The style a pressable tile takes for its hover, press and focus state under the user's motion setting. */
export function tileMotionStyle(theme: FeedbackTheme, input: TileMotionInput): TileMotionStyle {
  const { interaction, reduced, interactive, accentColor } = input;
  if (!interactive) return {};
  const active = interaction.hovered || interaction.focused || interaction.pressed;
  const transition: TileMotionStyle = reduced ? {} : { transitionDuration: `${String(TILE_MOTION_MS)}ms`, transitionProperty: 'transform, box-shadow, border-color', transitionTimingFunction: EASE_OUT };
  const lift: TileMotionStyle = reduced || !active || interaction.pressed ? {} : { transform: [{ translateY: LIFT }] };
  const tone: TileMotionStyle = !active || accentColor !== undefined ? {} : { borderColor: theme.colors.textSecondary };
  const ring: TileMotionStyle = !interaction.focused ? {} : { outlineColor: theme.palette.primary['500'], outlineStyle: 'solid', outlineWidth: FOCUS_RING };
  return { ...transition, ...(active ? shadowOf(theme, interaction.pressed) : {}), ...lift, ...tone, ...ring };
}
