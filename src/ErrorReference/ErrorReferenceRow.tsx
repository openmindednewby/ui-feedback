import React from 'react';

import { Platform, StyleSheet, Text, TouchableOpacity, View, type StyleProp, type ViewStyle } from 'react-native';

import { MIN_TOUCH_TARGET_PX } from '@dloizides/a11y';

import { useFeedbackUi } from '../context/FeedbackUiContext';
import { useCopyToClipboard } from './hooks/useCopyToClipboard';
import { CopyStatus } from './utils/CopyStatus';

const REFERENCE_FONT_SIZE = 13;
const ROW_GAP = 8;
const COPY_MIN_WIDTH = 56;
const COPY_PADDING_H = 8;
const COPY_RADIUS = 6;

const MONO_FONT = Platform.select({
  web: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  ios: 'Menlo',
  default: 'monospace',
});

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', maxWidth: '100%' },
  reference: { flexDirection: 'row', flexWrap: 'wrap', flexShrink: 1, alignItems: 'center', columnGap: ROW_GAP },
  label: { fontSize: REFERENCE_FONT_SIZE },
  id: { fontSize: REFERENCE_FONT_SIZE, fontFamily: MONO_FONT },
  copy: {
    minWidth: COPY_MIN_WIDTH,
    minHeight: MIN_TOUCH_TARGET_PX,
    paddingHorizontal: COPY_PADDING_H,
    borderRadius: COPY_RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyText: { fontSize: REFERENCE_FONT_SIZE, fontWeight: '600' },
});

const STATUS_KEY: Record<CopyStatus, string> = {
  [CopyStatus.Idle]: 'common.copy',
  [CopyStatus.Copied]: 'common.copied',
  [CopyStatus.Failed]: 'common.copyFailed',
};

export interface ErrorReferenceRowProps {
  traceId: string | undefined;
  color: string;
  actionColor: string;
  testID: string;
  style?: StyleProp<ViewStyle>;
}

interface ReferenceProps extends ErrorReferenceRowProps {
  traceId: string;
}

const Reference = ({ traceId, color, actionColor, testID, style }: ReferenceProps): React.ReactElement => {
  const { t } = useFeedbackUi();
  const { status, copy } = useCopyToClipboard(traceId);
  const copyLabel = t(STATUS_KEY[status]);

  return (
    <View style={[styles.row, style]} testID={testID}>
      <View style={styles.reference}>
        <Text style={[styles.label, { color }]}>{t('common.errorReference')}</Text>
        <Text selectable style={[styles.id, { color }]} testID={`${testID}-id`}>
          {traceId}
        </Text>
      </View>
      <TouchableOpacity
        accessibilityHint={t('common.copyHint')}
        accessibilityLabel={copyLabel}
        accessibilityRole="button"
        style={styles.copy}
        testID={`${testID}-copy`}
        onPress={copy}
      >
        <Text style={[styles.copyText, { color: actionColor }]}>{copyLabel}</Text>
      </TouchableOpacity>
    </View>
  );
};

/** "Error reference: <trace id>" + Copy; renders nothing when there is no trace id. */
export const ErrorReferenceRow = (props: ErrorReferenceRowProps): React.ReactElement | null =>
  props.traceId === undefined ? null : <Reference {...props} traceId={props.traceId} />;
