import React from 'react';

import { StyleSheet, View } from 'react-native';

import { FeedbackUiProvider } from '../context/FeedbackUiContext';
import { StatusTile } from '../StatusTile/StatusTile';

import type { FeedbackTheme } from '../context/FeedbackUiContext';

const styles = StyleSheet.create({ row: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 } });

export interface StatusTileShowcaseProps {
  theme: FeedbackTheme;
}

/** Showcase story: a pressable tile, an accented tile that needs a person, and a static tile. */
export const StatusTileShowcase = ({ theme }: StatusTileShowcaseProps): React.ReactElement => (
  <FeedbackUiProvider t={(key) => key} theme={theme}>
    <View style={styles.row}>
      <StatusTile accessibilityHint="showcase.statusTile.hint" accessibilityLabel="showcase.statusTile.pressable" lines={['showcase.statusTile.result', 'showcase.statusTile.meta']} testID="status-tile-pressable" title="showcase.statusTile.pressable" onPress={() => undefined} />
      <StatusTile accentColor={theme.semantic.error['500']} accessibilityHint="showcase.statusTile.hint" accessibilityLabel="showcase.statusTile.accent" lines={['showcase.statusTile.result']} testID="status-tile-accent" title="showcase.statusTile.accent" onPress={() => undefined} />
      <StatusTile accessibilityHint="showcase.statusTile.hint" accessibilityLabel="showcase.statusTile.static" lines={['showcase.statusTile.result']} testID="status-tile-static" title="showcase.statusTile.static" />
    </View>
  </FeedbackUiProvider>
);
