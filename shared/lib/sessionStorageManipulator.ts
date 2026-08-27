import {
  SessionStorageItem,
  SessionStorageKey,
} from "@shared/types/sessionStorage.type";

export class SessionStorageManipulator {
  private static readonly SessionStoragePrefix = "notegic_";

  private static getStorageKey(key: SessionStorageKey): string {
    return this.SessionStoragePrefix + key;
  }

  static isSessionStorageAvailable = (): boolean => {
    try {
      const testKey = "__test__";
      sessionStorage.setItem(testKey, "test");
      sessionStorage.removeItem(testKey);
      return true;
    } catch {
      console.error(`The sessionStorage is not available`);
      return false;
    }
  };

  static getItemByKey = <K extends SessionStorageKey>(
    key: K
  ): SessionStorageItem[K] | null => {
    if (!this.isSessionStorageAvailable()) return null;
    try {
      const storageKey = this.getStorageKey(key);
      const item = sessionStorage.getItem(storageKey);

      return item === null ? null : JSON.parse(item);
    } catch (error) {
      console.error(`Failed to get sessionStorage item "${key}":`, error);
      return null;
    }
  };

  static getItemsByKeys = <K extends SessionStorageKey>(
    keys: K[]
  ): Pick<SessionStorageItem, K> => {
    if (!this.isSessionStorageAvailable())
      return {} as Pick<SessionStorageItem, K>;

    const result = {} as Pick<SessionStorageItem, K>;

    keys.forEach(key => {
      result[key] = this.getItemByKey(key);
    });

    return result;
  };

  static getAllItems = <
    K extends SessionStorageKey,
  >(): Partial<SessionStorageItem> => {
    if (!this.isSessionStorageAvailable())
      return {} as Partial<SessionStorageItem>;

    const result = {} as Partial<SessionStorageItem>;

    try {
      for (let i = 0; i < sessionStorage.length; i++) {
        const keyString = sessionStorage.key(i);
        if (keyString && keyString.startsWith(this.SessionStoragePrefix)) {
          const cleanKey = keyString.replace(
            this.SessionStoragePrefix,
            ""
          ) as K;
          result[cleanKey] = sessionStorage.getItem(
            keyString
          ) as SessionStorageItem[K];
        }
      }
    } catch (error) {
      console.error("Failed to get all sessionStorage items:", error);
    }

    return result;
  };

  static hasItem = <K extends SessionStorageKey>(key: K): boolean => {
    if (!this.isSessionStorageAvailable()) return false;

    return this.getItemByKey(key) !== null;
  };

  static setItem = <K extends SessionStorageKey>(
    key: K,
    value: SessionStorageItem[K] // use the key of the Storage
  ): boolean => {
    if (!this.isSessionStorageAvailable()) return false;

    try {
      const storageKey = this.getStorageKey(key);
      sessionStorage.setItem(storageKey, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Failed to set sessionStorage item "${key}":`, error);
      return false;
    }
  };

  static setItems = (items: Partial<SessionStorageKey>): number => {
    if (!this.isSessionStorageAvailable()) return 0;

    let count = 0;
    Object.entries(items).forEach(([key, value]) => {
      if (value !== undefined) {
        count += this.setItem(key as SessionStorageKey, value) ? 1 : 0;
      }
    });
    return count;
  };

  static removeItem = <K extends SessionStorageKey>(key: K): boolean => {
    if (!this.isSessionStorageAvailable()) return false;

    try {
      const storageKey = this.getStorageKey(key);
      sessionStorage.removeItem(storageKey);
      return true;
    } catch (error) {
      return false;
    }
  };

  static removeItems = <K extends SessionStorageKey>(keys: K[]): number => {
    if (!this.isSessionStorageAvailable()) return 0;

    let count = 0;
    keys.forEach((key, _) => (count += this.removeItem(key) ? 1 : 0));
    return count;
  };

  static ensureItem = <K extends SessionStorageKey>(
    key: K,
    value: SessionStorageItem[K] | null | undefined
  ): boolean => {
    if (!this.isSessionStorageAvailable()) return false;
    else if (!value) return false;

    try {
      this.removeItem(key);
      this.setItem(key, value);
      return true;
    } catch (error) {
      console.error(`Failed to ensure sessionStorage item "${key}":`, error);
      return false;
    }
  };

  static ensureItems = (items: Partial<SessionStorageItem>): number => {
    if (!this.isSessionStorageAvailable()) return 0;

    let count = 0;
    Object.entries(items).forEach(([key, value]) => {
      if (value !== undefined) {
        count += this.ensureItem(key as SessionStorageKey, value) ? 1 : 0;
      }
    });
    return count;
  };

  static clearAllItems = (): boolean => {
    if (!this.isSessionStorageAvailable()) return false;

    let success = true;
    try {
      const keysToRemove: string[] = [];

      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith(this.SessionStoragePrefix)) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => {
        sessionStorage.removeItem(key);
      });
    } catch (error) {
      console.error("Failed to clear all sessionStorage items:", error);
      success = false;
    }

    return success;
  };
}
