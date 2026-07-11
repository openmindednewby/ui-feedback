import { render, screen, act } from '@testing-library/react';

import {
  FeedbackUiProvider as UiProvider,
  type FeedbackTheme as UiTheme,
  type FeedbackUiValue as UiValue,
} from '../context/FeedbackUiContext';
import { ToastHost, type ToastInput } from './ToastHost';

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

type ToastHostProps = React.ComponentProps<typeof ToastHost>;

/** A tiny in-memory emit bus standing in for the app's event bus. */
function makeBus(): { subscribe: ToastHostProps['subscribe']; emit: (toast: ToastInput) => void } {
  let handler: ((toast: ToastInput) => void) | null = null;
  return {
    subscribe: (push) => {
      handler = push;
      return () => {
        handler = null;
      };
    },
    emit: (toast) => handler?.(toast),
  };
}

function renderWithUi(ui: React.ReactElement): ReturnType<typeof render> {
  return render(<UiProvider theme={theme} t={t}>{ui}</UiProvider>);
}

describe('ToastHost', () => {
  it('renders nothing until a toast is emitted', () => {
    const bus = makeBus();
    renderWithUi(<ToastHost subscribe={bus.subscribe} />);
    expect(screen.queryByTestId('notification-toast')).toBeNull();
  });

  it('renders an emitted toast message through the subscribe port', () => {
    const bus = makeBus();
    renderWithUi(<ToastHost subscribe={bus.subscribe} />);
    act(() => bus.emit({ text: 'Saved successfully', type: 'success' }));
    expect(screen.getByTestId('notification-toast')).toBeTruthy();
    expect(screen.getByText('Saved successfully')).toBeTruthy();
  });

  it('strips control and zero-width characters from the message', () => {
    const bus = makeBus();
    renderWithUi(<ToastHost subscribe={bus.subscribe} />);
    // "Hel" + control(0x01) + "lo" + zero-width-space(0x200b) + "!"
    const dirty = `Hel${String.fromCodePoint(0x01)}lo${String.fromCodePoint(0x200b)}!`;
    act(() => bus.emit({ text: dirty }));
    expect(screen.getByText('Hello!')).toBeTruthy();
  });

  it('honours a custom toast testID', () => {
    const bus = makeBus();
    renderWithUi(<ToastHost subscribe={bus.subscribe} toastTestID="my-toast" />);
    act(() => bus.emit({ text: 'Hi' }));
    expect(screen.getByTestId('my-toast')).toBeTruthy();
  });

  it('announces a success/info toast as a polite status live region', () => {
    const bus = makeBus();
    renderWithUi(<ToastHost subscribe={bus.subscribe} />);
    act(() => bus.emit({ text: 'Saved', type: 'success' }));
    const toast = screen.getByTestId('notification-toast');
    expect(toast.getAttribute('role')).toBe('status');
    expect(toast.getAttribute('aria-live')).toBe('polite');
  });

  it('announces an error toast as an assertive alert live region', () => {
    const bus = makeBus();
    renderWithUi(<ToastHost subscribe={bus.subscribe} />);
    act(() => bus.emit({ text: 'Boom', type: 'error' }));
    const toast = screen.getByTestId('notification-toast');
    expect(toast.getAttribute('role')).toBe('alert');
    expect(toast.getAttribute('aria-live')).toBe('assertive');
  });
});
