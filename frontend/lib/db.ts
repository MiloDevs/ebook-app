import Storage from "expo-sqlite/kv-store";

class DatabaseClient {
  async get<T>(key: string): Promise<T | null> {
    const value = await Storage.getItemAsync(key);
    if (value) {
      try {
        const data = JSON.parse(value);
        return data as T;
      } catch (error) {
        console.error(`Error parsing data for key ${key}:`, error);
        return null;
      }
    }
    return null;
  }

  async set(key: string, value: any): Promise<boolean> {
    let finalValue: string;
    if (typeof value !== "string") {
      finalValue = JSON.stringify(value);
    } else {
      finalValue = value;
    }

    try {
      await Storage.setItemAsync(key, finalValue);
      return true;
    } catch (error) {
      console.error("Error setting data for:", key, error);
      return false;
    }
  }

  async init<T>(key: string, defaultValue: T): Promise<T> {
    const existingData = await this.get<T>(key);

    if (existingData !== null) {
      console.log(`[DB] Found existing data for key '${key}'.`);
      return existingData;
    } else {
      console.log(
        `[DB] Key '${key}' not found. Setting and returning default value.`,
      );
      await this.set(key, defaultValue);
      return defaultValue;
    }
  }
}

export const db = new DatabaseClient();
