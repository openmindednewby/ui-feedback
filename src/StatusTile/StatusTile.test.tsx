import { fireEvent, render, screen } from '@testing-library/react';

import { FeedbackUiProvider } from '../context/FeedbackUiContext';
import { StatusTile } from './StatusTile';

import type { FeedbackTheme } from '../context/FeedbackUiContext';

const theme: FeedbackTheme = {
  colors: { background: '#fff', surface: '#f7f7f7', surfaceElevated: '#fff', text: '#111', textSecondary: '#666', border: '#ddd' },
  palette: { primary: { '500': '#005f73' } },
  semantic: { error: { '500': '#ae2012' } },
};

function renderTile(onPress?: () => void): void {
  render(
    <FeedbackUiProvider t={(key) => key} theme={theme}>
      <StatusTile accessibilityHint="hint" accessibilityLabel="Face match: Failed" lines={['A run failed', '1 run']} testID="tile" title="Face match" onPress={onPress} />
    </FeedbackUiProvider>,
  );
}

describe('StatusTile', () => {
  it('with an onPress, calls it when the tile is clicked', () => {
    const onPress = jest.fn();
    renderTile(onPress);

    fireEvent.click(screen.getByTestId('tile'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('with no onPress, exposes no button role', () => {
    renderTile();

    const role = screen.getByTestId('tile').getAttribute('role');

    expect(role).not.toBe('button');
  });
});
