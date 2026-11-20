import { useEffect, useSyncExternalStore } from 'react';

import type { LocalModel, LocalModelState } from '@dloizides/text-generation';

/** Follows a local model and checks the browser on first use. */
export function useLocalModel(model: LocalModel): LocalModelState {
  const state = useSyncExternalStore(model.subscribe, model.state);
  useEffect(() => {
    model.check().catch(() => undefined);
  }, [model]);
  return state;
}
