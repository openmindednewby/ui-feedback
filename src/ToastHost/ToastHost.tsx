/**
 * ToastHost — the shared, tokenized transient-toast overlay promoted from the
 * byte-identical erevna-web / katalogos-web `ToastContainer` twins.
 *
 * The RENDERING (animated fade-in/out, positioning, theming) lives here; the
 * EMIT pipeline stays in the app (its event bus / `@dloizides/bff-web-client`
 * toast emitter). The app wires the two together via the `subscribe` port: a
 * function that registers a push callback and returns an unsubscribe. Colours
 * come from the UiProvider theme (`useUi`) — nothing hardcoded.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Animated, Platform, StyleSheet, Text, View } from 'react-native';

import { useFeedbackUi } from '../context/FeedbackUiContext';
import { FEEDBACK_TEST_IDS } from '../constants';

// --- Defaults (ported from the twins) ---------------------------------------
const DEFAULT_DURATION_MS = 3000;
const DEFAULT_FADE_MS = 200;
const DEFAULT_MAX_LENGTH = 500;

const TOAST_TOP_WEB = 10;
const TOAST_TOP_MOBILE = 40;
const TOAST_HORIZONTAL_MARGIN = 10;
const TOAST_Z_INDEX = 9999;
const TOAST_INITIAL_TRANSLATE_Y = -6;
const TOAST_MAX_WIDTH = 600;
const TOAST_PADDING_HORIZONTAL = 16;
const TOAST_PADDING_VERTICAL = 10;
const TOAST_BORDER_RADIUS = 8;
const TOAST_MARGIN_VERTICAL = 6;

// Character-range bounds for the display sanitizer.
const C0_CONTROL_END = 0x1f;
const C1_CONTROL_START = 0x7f;
const C1_CONTROL_END = 0x9f;
const ZERO_WIDTH_START = 0x200b;
const ZERO_WIDTH_END = 0x200f;
const BYTE_ORDER_MARK = 0xfeff;

export type ToastType = 'success' | 'info' | 'error';

/** What the app pushes through the `subscribe` port. */
export interface ToastInput {
  text: string;
  type?: ToastType;
}

interface ToastMessage extends ToastInput {
  id: string;
}

interface ToastColors {
  primary: string;
  success: string;
  error: string;
  text: string;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'web' ? TOAST_TOP_WEB : TOAST_TOP_MOBILE,
    left: TOAST_HORIZONTAL_MARGIN,
    right: TOAST_HORIZONTAL_MARGIN,
    alignItems: 'center',
    zIndex: TOAST_Z_INDEX,
    pointerEvents: 'box-none',
  },
  toast: {
    paddingHorizontal: TOAST_PADDING_HORIZONTAL,
    paddingVertical: TOAST_PADDING_VERTICAL,
    borderRadius: TOAST_BORDER_RADIUS,
    marginVertical: TOAST_MARGIN_VERTICAL,
    minWidth: '40%',
    maxWidth: TOAST_MAX_WIDTH,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
    elevation: 4,
  },
  text: {},
});

/** Truncate + strip control / zero-width characters before display. */
function sanitizeToastText(input: string, maxLength: number): string {
  let stripped = '';
  for (const ch of input) {
    const code = ch.codePointAt(0) ?? 0;
    const isControl = code <= C0_CONTROL_END || (code >= C1_CONTROL_START && code <= C1_CONTROL_END);
    const isHidden = (code >= ZERO_WIDTH_START && code <= ZERO_WIDTH_END) || code === BYTE_ORDER_MARK;
    if (!isControl && !isHidden) stripped += ch;
  }
  return stripped.length > maxLength ? stripped.slice(0, maxLength) : stripped;
}

interface ToastItemProps {
  message: ToastMessage;
  onDone: (id: string) => void;
  colors: ToastColors;
  durationMs: number;
  fadeMs: number;
  testID: string;
}

const ToastItem = ({ message, onDone, colors, durationMs, fadeMs, testID }: ToastItemProps): React.ReactElement => {
  const opacityRef = useRef(new Animated.Value(0));
  const translateYRef = useRef(new Animated.Value(TOAST_INITIAL_TRANSLATE_Y));
  const opacity = opacityRef.current;
  const translateY = translateYRef.current;

  const backgroundColor = useMemo((): string => {
    if (message.type === 'success') return colors.success;
    if (message.type === 'error') return colors.error;
    return colors.primary;
  }, [colors.error, colors.primary, colors.success, message.type]);

  const handleDone = useCallback((): void => {
    onDone(message.id);
  }, [message.id, onDone]);

  useEffect(() => {
    const useNative = Platform.OS !== 'web';
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: fadeMs, useNativeDriver: useNative }),
      Animated.timing(translateY, { toValue: 0, duration: fadeMs, useNativeDriver: useNative }),
    ]).start();

    const hideTimer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: fadeMs, useNativeDriver: useNative }),
        Animated.timing(translateY, { toValue: TOAST_INITIAL_TRANSLATE_Y, duration: fadeMs, useNativeDriver: useNative }),
      ]).start(handleDone);
    }, durationMs);

    return () => clearTimeout(hideTimer);
  }, [handleDone, opacity, translateY, durationMs, fadeMs]);

  return (
    <Animated.View
      style={[styles.toast, { backgroundColor, transform: [{ translateY }], opacity }]}
      testID={testID}
    >
      <Text style={[styles.text, { color: colors.text }]}>{message.text}</Text>
    </Animated.View>
  );
};

export interface ToastHostProps {
  /**
   * Register a push callback; return an unsubscribe. The app adapts its own
   * event bus (e.g. `@dloizides/bff-web-client`'s toast emitter) to this port.
   */
  subscribe: (push: (toast: ToastInput) => void) => () => void;
  /** How long each toast stays before fading (ms). Default 3000. */
  durationMs?: number;
  /** Fade in/out animation duration (ms). Default 200. */
  fadeMs?: number;
  /** Max message length before truncation. Default 500. */
  maxLength?: number;
  /** testID for each toast (defaults to `notification-toast`). */
  toastTestID?: string;
}

let toastSeq = 0;
function nextId(): string {
  toastSeq += 1;
  return `${String(Date.now())}-${String(toastSeq)}`;
}

export const ToastHost = ({
  subscribe,
  durationMs = DEFAULT_DURATION_MS,
  fadeMs = DEFAULT_FADE_MS,
  maxLength = DEFAULT_MAX_LENGTH,
  toastTestID = FEEDBACK_TEST_IDS.notificationToast,
}: ToastHostProps): React.ReactElement | null => {
  const [messages, setMessages] = useState<ToastMessage[]>([]);
  const { theme } = useFeedbackUi();

  const colors = useMemo<ToastColors>(
    () => ({
      primary: theme.palette.primary['500'],
      success: (theme.semantic.success ?? theme.semantic.error)['500'],
      error: theme.semantic.error['500'],
      text: theme.colors.surfaceElevated,
    }),
    [theme],
  );

  const push = useCallback(
    (toast: ToastInput): void => {
      setMessages((s) => [...s, { id: nextId(), type: toast.type, text: sanitizeToastText(toast.text, maxLength) }]);
    },
    [maxLength],
  );

  const remove = useCallback((id: string): void => {
    setMessages((s) => s.filter((x) => x.id !== id));
  }, []);

  useEffect(() => subscribe(push), [subscribe, push]);

  if (messages.length === 0) return null;

  return (
    <View style={styles.container}>
      {messages.map((m) => (
        <ToastItem
          key={m.id}
          colors={colors}
          durationMs={durationMs}
          fadeMs={fadeMs}
          message={m}
          testID={toastTestID}
          onDone={remove}
        />
      ))}
    </View>
  );
};

export default ToastHost;
