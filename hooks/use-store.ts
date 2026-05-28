import { useEffect, useState } from "react";
import { loadStore, subscribeStore, type AppStore } from "@/lib/store";

export function useStore(): AppStore {
  const [store, setStore] = useState<AppStore>(() => loadStore());

  useEffect(() => {
    setStore(loadStore());
    return subscribeStore(() => setStore(loadStore()));
  }, []);

  return store;
}
