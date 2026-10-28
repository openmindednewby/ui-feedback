import { act, fireEvent, render, screen } from '@testing-library/react';

import { FeedbackUiProvider, type FeedbackTheme, type FeedbackUiValue } from '../context/FeedbackUiContext';

import { ErrorReferenceRow } from './ErrorReferenceRow';
import { COPY_FEEDBACK_MS } from './hooks/useCopyToClipboard';

const theme: FeedbackTheme = {
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

const t: FeedbackUiValue['t'] = (key) => key;
const TRACE_ID = '4bf92f3577b34da6a3ce929d0e0e4736';

function renderRow(traceId: string | undefined): void {
  render(
    <FeedbackUiProvider t={t} theme={theme}>
      <ErrorReferenceRow actionColor="#005f73" color="#666666" testID="ref" traceId={traceId} />
    </FeedbackUiProvider>,
  );
}

function setClipboard(value: unknown): void {
  Object.defineProperty(navigator, 'clipboard', { value, configurable: true, writable: true });
}

async function pressCopy(): Promise<void> {
  await act(async () => {
    fireEvent.click(screen.getByTestId('ref-copy'));
  });
}

describe('ErrorReferenceRow', () => {
  const originalClipboard = navigator.clipboard;

  afterEach(() => {
    setClipboard(originalClipboard);
    Reflect.deleteProperty(document, 'execCommand');
    jest.useRealTimers();
  });

  it('with no trace id, renders nothing', () => {
    renderRow(undefined);

    const row = screen.queryByTestId('ref');

    expect(row).toBeNull();
  });

  it('with a trace id, shows the full id', () => {
    renderRow(TRACE_ID);

    const id = screen.getByTestId('ref-id');

    expect(id.textContent).toBe(TRACE_ID);
  });

  it('on Copy press, writes the trace id and labels the button copied', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    setClipboard({ writeText });
    renderRow(TRACE_ID);

    await pressCopy();

    expect(writeText).toHaveBeenCalledWith(TRACE_ID);
    expect(screen.getByTestId('ref-copy').textContent).toBe('common.copied');
  });

  it('after the feedback window, returns the button label to copy', async () => {
    jest.useFakeTimers();
    setClipboard({ writeText: jest.fn().mockResolvedValue(undefined) });
    renderRow(TRACE_ID);
    await pressCopy();

    act(() => {
      jest.advanceTimersByTime(COPY_FEEDBACK_MS);
    });

    expect(screen.getByTestId('ref-copy').textContent).toBe('common.copy');
  });

  it('with the clipboard refusing, labels the button copy failed', async () => {
    setClipboard({ writeText: jest.fn().mockRejectedValue(new Error('NotAllowedError')) });
    Object.defineProperty(document, 'execCommand', { value: () => false, configurable: true, writable: true });
    renderRow(TRACE_ID);

    await pressCopy();

    expect(screen.getByTestId('ref-copy').textContent).toBe('common.copyFailed');
  });

  it('with a trace id, gives Copy a hit box of at least 56x48', () => {
    renderRow(TRACE_ID);

    const style = window.getComputedStyle(screen.getByTestId('ref-copy'));

    expect([style.minWidth, style.minHeight]).toEqual(['56px', '48px']);
  });
});
