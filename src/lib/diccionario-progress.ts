import { useCallback, useEffect, useState } from "react";

const KEY = "diccionario-js-progress-v1";

type Store = {
  learned: string[];
  favorites: string[];
};

function read(): Store {
  if (typeof window === "undefined") return { learned: [], favorites: [] };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { learned: [], favorites: [] };
    const parsed = JSON.parse(raw) as Store;
    return {
      learned: Array.isArray(parsed.learned) ? parsed.learned : [],
      favorites: Array.isArray(parsed.favorites) ? parsed.favorites : [],
    };
  } catch {
    return { learned: [], favorites: [] };
  }
}

function write(store: Store) {
  localStorage.setItem(KEY, JSON.stringify(store));
}

export function useDiccionarioProgress() {
  const [store, setStore] = useState<Store>({ learned: [], favorites: [] });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setStore(read());
    setReady(true);
  }, []);

  const persist = useCallback((next: Store) => {
    setStore(next);
    write(next);
  }, []);

  const toggleLearned = useCallback(
    (id: string) => {
      const has = store.learned.includes(id);
      persist({
        ...store,
        learned: has ? store.learned.filter((x) => x !== id) : [...store.learned, id],
      });
    },
    [persist, store],
  );

  const toggleFavorite = useCallback(
    (id: string) => {
      const has = store.favorites.includes(id);
      persist({
        ...store,
        favorites: has ? store.favorites.filter((x) => x !== id) : [...store.favorites, id],
      });
    },
    [persist, store],
  );

  const isLearned = useCallback((id: string) => store.learned.includes(id), [store.learned]);
  const isFavorite = useCallback((id: string) => store.favorites.includes(id), [store.favorites]);

  return {
    ready,
    learned: store.learned,
    favorites: store.favorites,
    toggleLearned,
    toggleFavorite,
    isLearned,
    isFavorite,
  };
}
