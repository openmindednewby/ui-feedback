import type { FeedbackColorScale, FeedbackTheme } from '../context/FeedbackUiContext';
import type { RunStepState } from './runGroups';

function scale(theme: FeedbackTheme, name: string): string | undefined {
  const found = theme.semantic[name] as FeedbackColorScale | undefined;
  return found?.['500'];
}

/** The theme colour for a step or group state; falls back to primary/text when a semantic scale is absent. */
export function runToneColor(theme: FeedbackTheme, state: RunStepState): string {
  if (state === 'failed') return theme.semantic.error['500'];
  if (state === 'running') return scale(theme, 'warning') ?? theme.palette.primary['500'];
  if (state === 'done') return scale(theme, 'success') ?? theme.colors.text;
  return theme.colors.textSecondary;
}
