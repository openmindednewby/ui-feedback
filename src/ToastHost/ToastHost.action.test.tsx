import { render, screen, act, fireEvent } from '@testing-library/react';

import {
  FeedbackUiProvider as UiProvider,
  type FeedbackTheme as UiTheme,
  type FeedbackUiValue as UiValue,
} from '../context/FeedbackUiContext';
import { MIN_TOUCH_TARGET } from '../constants';
import { createToastBus } from '../toastBus/createToastBus';
import { ToastHost } from './ToastHost';

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
  semantic: { error: { '500': '#ae2012' }, success: { '500': '#16a34a' } },
};
const t: UiValue['t'] = (key) => key;

function renderHost(bus: ReturnType<typeof createToastBus>): void {
  render(<UiProvider theme={theme} t={t}><ToastHost subscribe={bus.subscribe} /></UiProvider>);
}

describe('ToastHost action', () => {
  it('with an action, renders a labelled button with a hint and a 44x44 hit box', () => {
    const bus = createToastBus();
    renderHost(bus);

    act(() => bus.show({ text: 'Link deleted', action: { label: 'Undo', hint: 'Restores the link', onPress: jest.fn() } }));

    const button = screen.getByTestId('notification-toast-action');
    expect(button.getAttribute('aria-label')).toBe('Undo');
    expect(screen.getByText('Undo')).toBeTruthy();
    expect(parseFloat(window.getComputedStyle(button).minWidth)).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
    expect(parseFloat(window.getComputedStyle(button).minHeight)).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
  });

  it('when the action is pressed, runs onPress once and dismisses the toast', () => {
    const onPress = jest.fn();
    const bus = createToastBus();
    renderHost(bus);
    act(() => bus.show({ text: 'Link deleted', action: { label: 'Undo', onPress } }));

    act(() => {
      fireEvent.click(screen.getByTestId('notification-toast-action'));
    });

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId('notification-toast')).toBeNull();
  });

  it('without an action, renders no action button', () => {
    const bus = createToastBus();
    renderHost(bus);

    act(() => bus.success('Saved'));

    expect(screen.getByTestId('notification-toast')).toBeTruthy();
    expect(screen.queryByTestId('notification-toast-action')).toBeNull();
  });
});
