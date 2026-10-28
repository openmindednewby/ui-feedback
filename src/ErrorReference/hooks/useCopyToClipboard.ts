import { useCallback, useEffect, useRef, useState } from 'react';

import { copyText } from '../utils/copyText';
import { CopyStatus } from '../utils/CopyStatus';

export const COPY_FEEDBACK_MS = 1500;

export interface CopyToClipboard {
  status: CopyStatus;
  copy: () => void;
}

/** Copies `value` and reports Copied / Failed for {@link COPY_FEEDBACK_MS} before returning to Idle. */
export function useCopyToClipboard(value: string, writer?: (text: string) => void | Promise<void>): CopyToClipboard {
  const [status, setStatus] = useState<CopyStatus>(CopyStatus.Idle);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (timerRef.current !== null) clearTimeout(timerRef.current);
    };
  }, []);

  const copy = useCallback((): void => {
    void copyText(value, writer).then((ok) => {
      if (!mountedRef.current) return;
      setStatus(ok ? CopyStatus.Copied : CopyStatus.Failed);
      if (timerRef.current !== null) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        if (mountedRef.current) setStatus(CopyStatus.Idle);
      }, COPY_FEEDBACK_MS);
    });
  }, [value, writer]);

  return { status, copy };
}
