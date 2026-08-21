import { IndexedDBItem, IndexedDBKey } from "@shared/types/indexedDB.type";
import {
  clear,
  del,
  delMany,
  entries,
  get,
  getMany,
  set,
  setMany,
  update,
} from "idb-keyval";

export class IndexedDBManipulator {
  private static readonly IndexedDBPrefix = "notegic_";

  private static getIndexedDBKey(key: IndexedDBKey, publicId?: string): string {
    if (publicId !== undefined) {
      return this.IndexedDBPrefix + publicId.toString() + "_" + key;
    }
    return this.IndexedDBPrefix + key;
  }

  static isIndexedDBAvailable = (): boolean => {
    try {
      const testKey = "__test__";
      set(testKey, "test");
      del(testKey);
      return true;
    } catch {
      console.error(`The indexedDB is not available`);
      return false;
    }
  };

  static getItemByKey = async <K extends IndexedDBKey>(
    key: K,
    publicId?: string
  ): Promise<IndexedDBItem[K] | null> => {
    if (!this.isIndexedDBAvailable()) return null;

    try {
      const indexedDBKey = this.getIndexedDBKey(key, publicId);
      const result = await get(indexedDBKey);
      return result === undefined ? null : (result as IndexedDBItem[K] | null);
    } catch (error) {
      console.error(
        `Failed to get indexedDB item with key of "${key}":`,
        error
      );
      return null;
    }
  };

  static getItemsByKeys = async <K extends IndexedDBKey>(
    keys: K[],
    publicId?: string
  ): Promise<IndexedDBItem[K][] | null> => {
    if (!this.isIndexedDBAvailable()) return null;

    try {
      const indexedDBKeys = keys.map(key =>
        this.getIndexedDBKey(key, publicId)
      );
      const result = await getMany(indexedDBKeys);
      return result === undefined
        ? null
        : (result as IndexedDBItem[K][] | null);
    } catch (error) {
      console.error(
        `Failed to get indexedDB items with keys of "${keys}":`,
        error
      );
      return null;
    }
  };

  static getAllItems = async (): Promise<Partial<IndexedDBItem>> => {
    if (!this.isIndexedDBAvailable()) return {} as Partial<IndexedDBItem>;

    const result = {} as Partial<IndexedDBItem>;
    try {
      const allEntries = await entries();
      allEntries.forEach(([key, value]) => {
        if (typeof key === "string" && key.startsWith(this.IndexedDBPrefix)) {
          const cleanKey = key.replace(
            this.IndexedDBPrefix,
            ""
          ) as IndexedDBKey;
          result[cleanKey] = value;
        }
      });
    } catch (error) {
      console.error("Failed to get all indexedDB items:", error);
    }
    return result;
  };

  static hasItem = async <K extends IndexedDBKey>(
    key: K,
    publicId?: string
  ): Promise<boolean> => {
    if (!this.isIndexedDBAvailable()) return false;

    const item = await this.getItemByKey(key, publicId);
    return item !== null && item !== undefined;
  };

  static setItem = async <K extends IndexedDBKey>(
    key: K,
    value: IndexedDBItem[K],
    publicId?: string
  ): Promise<boolean> => {
    if (!this.isIndexedDBAvailable()) return false;

    try {
      const indexedDBKey = this.getIndexedDBKey(key, publicId);
      await set(indexedDBKey, value);
      return true;
    } catch (error) {
      console.error(
        `Failed to set indexedDB item with key of "${key}":`,
        error
      );
      return false;
    }
  };

  static updateItem = async <K extends IndexedDBKey>(
    key: K,
    updater: (value: IndexedDBItem[K] | undefined) => IndexedDBItem[K],
    publicId?: string
  ): Promise<boolean> => {
    if (!this.isIndexedDBAvailable()) return false;

    try {
      await update(
        this.getIndexedDBKey(key, publicId),
        updater as (value: unknown) => unknown
      );
      return true;
    } catch (error) {
      console.error(
        `Failed to update indexedDB item with key of "${key}":`,
        error
      );
      return false;
    }
  };

  static setItems = async (
    items: Partial<IndexedDBItem>,
    publicId?: string
  ): Promise<boolean> => {
    if (!this.isIndexedDBAvailable()) return false;

    try {
      const entriesArr: [string, any][] = Object.entries(items)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => [
          this.getIndexedDBKey(key as IndexedDBKey, publicId),
          value,
        ]);
      await setMany(entriesArr);
      return true;
    } catch (error) {
      console.error("Failed to set multiple indexedDB items:", error);
      return false;
    }
  };

  static removeItem = async <K extends IndexedDBKey>(
    key: K,
    publicId?: string
  ): Promise<boolean> => {
    if (!this.isIndexedDBAvailable()) return false;

    try {
      const indexedDBKey = this.getIndexedDBKey(key, publicId);
      await del(indexedDBKey);
      return true;
    } catch (error) {
      console.error(
        `Failed to remove indexedDB item with key of "${key}":`,
        error
      );
      return false;
    }
  };

  static removeItems = async <K extends IndexedDBKey>(
    keysArr: K[],
    publicId?: string
  ): Promise<boolean> => {
    if (!this.isIndexedDBAvailable()) return false;

    try {
      const indexedDBKeys = keysArr.map(key =>
        this.getIndexedDBKey(key, publicId)
      );
      await delMany(indexedDBKeys);
      return true;
    } catch (error) {
      console.error("Failed to remove indexedDB items:", error);
      return false;
    }
  };

  static ensureItem = async <K extends IndexedDBKey>(
    key: K,
    value: IndexedDBItem[K] | null | undefined,
    publicId?: string
  ): Promise<boolean> => {
    if (!this.isIndexedDBAvailable()) return false;
    else if (!value) return false;

    try {
      this.removeItem(key, publicId);
      this.setItem(key, value, publicId);
      return true;
    } catch (error) {
      console.debug(`Failed to ensure indexedDB item "${key}":`, error);
      return false;
    }
  };

  static ensureItems = async (
    items: Partial<IndexedDBItem>,
    publicId?: string
  ): Promise<number> => {
    if (!this.isIndexedDBAvailable()) return 0;

    let count = 0;
    Object.entries(items).forEach(async ([key, value]) => {
      if (value !== undefined) {
        count += (await this.ensureItem(key as IndexedDBKey, value, publicId))
          ? 1
          : 0;
      }
    });
    return count;
  };

  static clearAllItems = async (): Promise<boolean> => {
    if (!this.isIndexedDBAvailable()) return false;

    try {
      await clear();
      return true;
    } catch (error) {
      console.error("Failed to clear all indexedDB items:", error);
      return false;
    }
  };
}
