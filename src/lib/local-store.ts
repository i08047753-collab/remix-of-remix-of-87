import { useCallback, useSyncExternalStore } from "react";

/**
 * Tiny device-local store for the prototype (no backend yet).
 * Server render and hydration always use `initial`; the stored value appears right after.
 */
const listeners = new Map<string, Set<() => void>>();
const cache = new Map<string, unknown>();

function read<T>(key: string, initial: T): T {
  if (cache.has(key)) return cache.get(key) as T;
  let value = initial;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw != null) value = JSON.parse(raw) as T;
  } catch {
    value = initial;
  }
  cache.set(key, value);
  return value;
}

export function writeLocal<T>(key: string, value: T) {
  cache.set(key, value);
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable */
  }
  listeners.get(key)?.forEach((l) => l());
}

export function useLocalStore<T>(key: string, initial: T) {
  const subscribe = useCallback(
    (cb: () => void) => {
      if (!listeners.has(key)) listeners.set(key, new Set());
      listeners.get(key)!.add(cb);
      return () => listeners.get(key)?.delete(cb);
    },
    [key],
  );
  const value = useSyncExternalStore(
    subscribe,
    () => read(key, initial),
    () => initial,
  );
  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      const prev = read(key, initial);
      writeLocal(key, typeof next === "function" ? (next as (p: T) => T)(prev) : next);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  );
  return [value, set] as const;
}
