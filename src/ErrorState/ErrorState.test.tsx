/**
 * ErrorState is composed by 7 portals. The new props (title, icon, secondaryAction) are
 * opt-in: the `baseline` snapshots were recorded against 1.11.0 BEFORE they existed, so a
 * caller passing none of them must keep producing that exact element tree.
 */
import { fireEvent, render, screen } from '@testing-library/react';

import {
  FeedbackUiProvider as UiProvider,
  type FeedbackTheme as UiTheme,
  type FeedbackUiValue as UiValue,
} from '../context/FeedbackUiContext';

import { ErrorState, type ErrorStateProps } from './ErrorState';

const theme: UiTheme = {
  colors: {
    background: '#ffffff',
    surface: '#f7f7f7',
    surfaceElevated: '#ffffff',
    text: '#111111',
    textSecondary: '#666666',
    border: '#dddddd',
  },
  palette: { primary: { '500': '#005f73' } },
  semantic: { error: { '500': '#ae2012' } },
};

/** Echoes the key back, so an assertion names the translation key rather than English. */
const t: UiValue['t'] = (key) => key;

function renderErrorState(props: ErrorStateProps): HTMLElement {
  const { container } = render(
    <UiProvider t={t} theme={theme}>
      <ErrorState {...props} />
    </UiProvider>,
  );
  return container;
}

function ownText(el: Element): string {
  return Array.from(el.childNodes)
    .filter((node) => node.nodeType === Node.TEXT_NODE)
    .map((node) => node.textContent ?? '')
    .join('');
}

/** Element tree as depth + tag + role + testid + aria-label + own text. Styles excluded. */
function outline(root: Element, depth = 0): string[] {
  return Array.from(root.children).flatMap((el) => {
    const attrs = ['role', 'data-testid', 'aria-label', 'aria-hidden']
      .map((name) => [name, el.getAttribute(name)] as const)
      .filter(([, value]) => value !== null)
      .map(([name, value]) => `${name}=${String(value)}`);
    const line = `${'  '.repeat(depth)}<${el.tagName.toLowerCase()} ${attrs.join(' ')}> ${ownText(el)}`;
    return [line.trimEnd(), ...outline(el, depth + 1)];
  });
}

describe('ErrorState baseline (no new props)', () => {
  it('keeps the message-only element tree', () => {
    expect(outline(renderErrorState({ message: 'Boom' }))).toMatchSnapshot();
  });

  it('keeps the message + retry element tree', () => {
    const container = renderErrorState({ message: 'Boom', onRetry: jest.fn() });
    expect(outline(container)).toMatchSnapshot();
  });
});

describe('ErrorState opt-in props', () => {
  const testID = 'import-error';

  it('renders the title as a heading', () => {
    renderErrorState({ message: 'Boom', title: 'Import failed', testID });

    const heading = screen.getByRole('heading');
    expect(heading.textContent).toBe('Import failed');
  });

  it('puts the icon inside an aria-hidden wrapper keyed off the testID', () => {
    renderErrorState({
      message: 'Boom',
      icon: <span data-testid="glyph">!</span>,
      testID,
    });

    const well = screen.getByTestId(`${testID}-icon`);
    expect(well.getAttribute('aria-hidden')).toBe('true');
    expect(well.contains(screen.getByTestId('glyph'))).toBe(true);
  });

  it('renders the secondary action with its label and testID and calls onPress', () => {
    const onPress = jest.fn();
    renderErrorState({
      message: 'Boom',
      testID,
      secondaryAction: { label: 'Back', hint: 'Returns to the library', onPress, testID: 'back' },
    });

    const button = screen.getByTestId('back');
    expect(button.getAttribute('aria-label')).toBe('Back');
    expect(button.textContent).toBe('Back');
    fireEvent.click(button);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('keeps retry working next to a secondary action', () => {
    const onRetry = jest.fn();
    renderErrorState({
      message: 'Boom',
      onRetry,
      secondaryAction: { label: 'Back', hint: 'hint', onPress: jest.fn(), testID: 'back' },
    });

    fireEvent.click(screen.getByTestId('error-state-retry'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('renders no icon wrapper or heading when those props are absent', () => {
    renderErrorState({ message: 'Boom', testID });

    expect(screen.queryByTestId(`${testID}-icon`)).toBeNull();
    expect(screen.queryByRole('heading')).toBeNull();
  });
});
