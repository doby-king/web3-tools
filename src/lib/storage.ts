import localforage from "localforage";
import type { StateStorage } from "zustand/middleware";

export const storage = localforage.createInstance({
  name: "web3-tools",
  storeName: "tool-data",
});

/**
 * Create a StateStorage for zustand persist scoped to a single tool.
 * All data goes into localforage with a `tool:${toolId}` key prefix for isolation.
 */
export function createToolStorage(toolId: string): StateStorage {
  const prefix = `tool:${toolId}`;
  const buildKey = (name: string) => `${prefix}:${name}`;

  return {
    getItem: async (name) => {
      const value = await storage.getItem<string>(buildKey(name));
      return value ?? null;
    },
    setItem: async (name, value) => {
      await storage.setItem(buildKey(name), value);
    },
    removeItem: async (name) => {
      await storage.removeItem(buildKey(name));
    },
  };
}
