import type { FeedbackColorScale, FeedbackTheme } from '../context/FeedbackUiContext';

/** The 500 step of a named semantic scale, or undefined when the theme lacks it. */
export function semanticScale(theme: FeedbackTheme, name: string): string | undefined {
  const found = theme.semantic[name] as FeedbackColorScale | undefined;
  return found?.['500'];
}
