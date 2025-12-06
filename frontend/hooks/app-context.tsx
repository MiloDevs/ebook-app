import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { Settings } from "@/types/settings";
import { db } from "@/lib/db";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
}

export interface AppState {
  user: UserProfile;
  settings: Settings;
}

const defaultSettings: Settings = {
  keepawake: true,
  volumeupturnpages: true,
  readertheme: "system",
  openlastbook: false,
};

const STORAGE_KEYS: {
  key: keyof AppState;
  storageKey: string;
  defaultValue: any;
}[] = [
  {
    key: "user",
    storageKey: "APP_USER_PROFILE",
    defaultValue: { name: "Guest", email: "" } as UserProfile,
  },
  {
    key: "settings",
    storageKey: "APP_SETTINGS",
    defaultValue: defaultSettings,
  },
];

export type PartialSetterFunction<T> = (
  newValue: Partial<T> | ((prevState: T) => T),
) => Promise<void>;

export interface AppContextType {
  state: AppState | null;
  isLoading: boolean;
  setUser: PartialSetterFunction<UserProfile>;
  setSettings: PartialSetterFunction<Settings>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const [state, setState] = useState<AppState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadInitialData = async () => {
      console.log("Starting initial data load...");
      const initialData: Partial<AppState> = {};
      const promises = STORAGE_KEYS.map(
        async ({ key, storageKey, defaultValue }) => {
          // Use the init function to get existing data or set default
          const data = await db.init(storageKey, defaultValue);
          initialData[key] = data;
        },
      );

      await Promise.all(promises);

      // We are confident initialData has all keys now
      setState(initialData as AppState);
      setIsLoading(false);
      console.log("Initial data load complete.");
    };

    loadInitialData();
  }, []); // Run only once on mount

  // --- Generic Setter Function ---
  // This function handles updating both the React state and the KV store
  const createSetter = useCallback(
    <K extends keyof AppState>(
      key: K,
      storageKey: string,
    ): PartialSetterFunction<AppState[K]> =>
      async (newValueOrFn) => {
        // 1. Update React State
        setState((prevState) => {
          if (!prevState) return null;

          const actualNewValue =
            typeof newValueOrFn === "function"
              ? (newValueOrFn as (prevState: AppState[K]) => AppState[K])(
                  prevState[key],
                )
              : ({
                  ...prevState[key],
                  ...(newValueOrFn as Partial<AppState[K]>),
                } as AppState[K]);

          const newState = {
            ...prevState,
            [key]: actualNewValue,
          } as AppState;

          // 2. Persist to KV Store (asynchronously, without blocking UI)
          db.set(storageKey, actualNewValue).then((success) => {
            if (!success) {
              console.error(`Failed to save key: ${storageKey}`);
            }
          });

          return newState;
        });
      },
    [],
  );

  // --- Context Value ---
  const contextValue: AppContextType = {
    state,
    isLoading,
    // Provide specific setters mapped to the state keys
    setUser: createSetter(
      "user",
      STORAGE_KEYS.find((k) => k.key === "user")!.storageKey,
    ),
    setSettings: createSetter(
      "settings",
      STORAGE_KEYS.find((k) => k.key === "settings")!.storageKey,
    ),
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
