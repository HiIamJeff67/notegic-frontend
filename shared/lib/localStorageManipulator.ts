import {
  LocalStorageItem,
  LocalStorageKey,
} from "@shared/types/localStorage.type";

export class LocalStorageManipulator {
  private static readonly LocalStoragePrefix = "notegic_";

  private static getStorageKey(
    key: LocalStorageKey,
    publicId?: string
  ): string {
    if (publicId !== undefined) {
      return this.LocalStoragePrefix + publicId.toString() + "_" + key;
    }
    return this.LocalStoragePrefix + key;
  }

  static isLocalStorageAvailable = (): boolean => {
    if (typeof window === "undefined" || typeof localStorage === "undefined") {
      return false;
    }

    try {
      const testKey = "__test__";
      localStorage.setItem(testKey, "test");
      localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      // In some browser/privacy modes localStorage exists but is not writable.
      console.warn("localStorage exists but is not available.", error);
      return false;
    }
  };

  // get an item from local storage by providing a key
  static getItemByKey = <K extends LocalStorageKey>(
    key: K,
    publicId?: string
  ): LocalStorageItem[K] | null => {
    try {
      if (!this.isLocalStorageAvailable()) return null;

      const storageKey = this.getStorageKey(key, publicId);
      const item = localStorage.getItem(storageKey);

      return item === null ? null : JSON.parse(item);
    } catch (error) {
      console.error(
        `Failed to get localStorage item with key of "${key}":`,
        error
      );
      return null;
    }
  };

  // get items from local storage by providing the keys of them
  static getItemsByKeys = <K extends LocalStorageKey>(
    keys: K[],
    publicId?: string
  ): Pick<LocalStorageItem, K> => {
    if (!this.isLocalStorageAvailable()) return {} as Pick<LocalStorageItem, K>;

    const result = {} as Pick<LocalStorageItem, K>;

    keys.forEach(key => {
      result[key] = this.getItemByKey(key, publicId);
    });

    return result;
  };

  // get all items from local storage
  static getAllItems = <
    K extends LocalStorageKey,
  >(): Partial<LocalStorageItem> => {
    if (!this.isLocalStorageAvailable()) return {} as Partial<LocalStorageItem>;

    const result = {} as Partial<LocalStorageItem>;

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const keyString = localStorage.key(i);
        if (keyString && keyString.startsWith(this.LocalStoragePrefix)) {
          const cleanKey = keyString.replace(this.LocalStoragePrefix, "") as K;
          result[cleanKey] = localStorage.getItem(
            keyString
          ) as LocalStorageItem[K];
        }
      }
    } catch (error) {
      console.error("Failed to get all localStorage items:", error);
    }

    return result;
  };

  static hasItem = <K extends LocalStorageKey>(
    key: K,
    publicId?: string
  ): boolean => {
    if (!this.isLocalStorageAvailable()) return false;

    return this.getItemByKey(key, publicId) !== null;
  };

  // set an item to local storage by providing a key-value pair
  static setItem = <K extends LocalStorageKey>(
    key: K,
    value: LocalStorageItem[K], // use the key of the Storage
    publicId?: string
  ): boolean => {
    if (!this.isLocalStorageAvailable()) return false;

    try {
      const storageKey = this.getStorageKey(key, publicId);
      localStorage.setItem(storageKey, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(
        `Failed to set localStorage item with key of "${key}":`,
        error
      );
      return false;
    }
  };

  // set items to local storage by providing key-value pairs
  static setItems = (
    items: Partial<LocalStorageItem>,
    publicId?: string
  ): number => {
    if (!this.isLocalStorageAvailable()) return 0;

    let count = 0;
    Object.entries(items).forEach(([key, value]) => {
      if (value !== undefined) {
        count += this.setItem(key as LocalStorageKey, value, publicId) ? 1 : 0;
      }
    });
    return count;
  };

  static removeItem = <K extends LocalStorageKey>(
    key: K,
    publicId?: string
  ): boolean => {
    if (!this.isLocalStorageAvailable()) return false;

    try {
      const storageKey = this.getStorageKey(key, publicId);
      localStorage.removeItem(storageKey);
      return true;
    } catch (error) {
      console.error(
        `Failed to remove localStorage item with key of "${key}": `,
        error
      );
      return false;
    }
  };

  static removeItems = <K extends LocalStorageKey>(
    keys: K[],
    publicId?: string
  ): number => {
    if (!this.isLocalStorageAvailable()) return 0;

    let count = 0;
    keys.forEach((key, _) => (count += this.removeItem(key, publicId) ? 1 : 0));
    return count;
  };

  static ensureItem = <K extends LocalStorageKey>(
    key: K,
    value: LocalStorageItem[K] | null | undefined,
    publicId?: string
  ): boolean => {
    if (!this.isLocalStorageAvailable()) return false;
    else if (!value) return false;

    try {
      this.removeItem(key, publicId);
      this.setItem(key, value, publicId);
      return true;
    } catch (error) {
      console.error(`Failed to ensure localStorage item "${key}":`, error);
      return false;
    }
  };

  static ensureItems = (
    items: Partial<LocalStorageItem>,
    publicId?: string
  ): number => {
    if (!this.isLocalStorageAvailable()) return 0;

    let count = 0;
    Object.entries(items).forEach(([key, value]) => {
      if (value !== undefined) {
        count += this.ensureItem(key as LocalStorageKey, value, publicId)
          ? 1
          : 0;
      }
    });
    return count;
  };

  static clearAllItems = (): boolean => {
    if (!this.isLocalStorageAvailable()) return false;

    let success = true;
    try {
      const keysToRemove: string[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.LocalStoragePrefix)) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error("Failed to clear all localStorage items:", error);
      success = false;
    }

    return success;
  };
}
