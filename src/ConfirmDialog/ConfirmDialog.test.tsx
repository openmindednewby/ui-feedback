import '@testing-library/jest-dom';
import { act, fireEvent, render, screen } from '@testing-library/react';

import { FEEDBACK_TEST_IDS, MIN_TOUCH_TARGET } from '../constants';

import { ConfirmDialog } from './ConfirmDialog';

const TITLE = 'Disconnect Stripe?';

const renderDialog = (onCancel = jest.fn()): jest.Mock => {
  render(
    <ConfirmDialog visible message="Payments stop until you reconnect." title={TITLE} onCancel={onCancel} onConfirm={jest.fn()} />
  );
  return onCancel;
};

const flushModalAnimation = (): void => {
  act(() => {
    document.querySelectorAll('*').forEach((node) => fireEvent.animationEnd(node));
  });
};

describe('ConfirmDialog', () => {
  it('names the modal dialog by its title through aria-labelledby', () => {
    renderDialog();
    flushModalAnimation();

    const dialog = document.querySelector('[aria-modal="true"]');
    const titleId = dialog?.getAttribute('aria-labelledby') ?? '';

    expect(document.getElementById(titleId)?.textContent).toBe(TITLE);
  });

  it('exposes exactly one dialog role, so the name is not split across nested dialogs', () => {
    renderDialog();
    flushModalAnimation();

    expect(screen.getAllByRole('dialog').map((node) => node.getAttribute('aria-labelledby') !== null)).toEqual([true]);
  });

  it('gives both action buttons a 44px minimum height', () => {
    renderDialog();

    const heights = [FEEDBACK_TEST_IDS.cancelConfirmButton, FEEDBACK_TEST_IDS.confirmButton].map(
      (id) => window.getComputedStyle(screen.getByTestId(id)).minHeight
    );

    expect(heights).toEqual([`${MIN_TOUCH_TARGET}px`, `${MIN_TOUCH_TARGET}px`]);
  });

  it('calls onCancel when Escape is released', () => {
    const onCancel = renderDialog();
    flushModalAnimation();

    fireEvent.keyUp(document, { key: 'Escape' });

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
