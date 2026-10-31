interface LRUNode<K, V> {
  key: K;
  value: V;
  prev: LRUNode<K, V> | null;
  next: LRUNode<K, V> | null;
}

export class LRUCache<K, V> {
  private capacity: number;
  private map: Map<K, LRUNode<K, V>>;
  private head: LRUNode<K, V>; // dummy head (direction of MRU)
  private tail: LRUNode<K, V>; // dummy tail (direction of LRU)

  constructor(capacity: number) {
    if (capacity <= 0) throw new Error("LRU cache capacity must be > 0");
    this.capacity = capacity;
    this.map = new Map();
    this.head = {
      key: null as any,
      value: null as any,
      prev: null,
      next: null,
    };
    this.tail = {
      key: null as any,
      value: null as any,
      prev: null,
      next: null,
    };
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  get(key: K): V | undefined {
    const node = this.map.get(key);
    if (!node) return undefined;
    this.moveToFront(node);
    return node.value;
  }

  set(key: K, value: V): void {
    let node = this.map.get(key);
    if (node) {
      node.value = value;
      this.moveToFront(node);
      return;
    }
    node = { key, value, prev: null, next: null };
    this.map.set(key, node);
    this.insertAfterHead(node);
    if (this.map.size > this.capacity) {
      this.evictLRU();
    }
  }

  has(key: K): boolean {
    return this.map.has(key);
  }

  delete(key: K): boolean {
    const node = this.map.get(key);
    if (!node) return false;
    this.removeFromList(node);
    this.map.delete(key);
    return true;
  }

  clear(): void {
    this.map.clear();
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  size(): number {
    return this.map.size;
  }

  keys(): K[] {
    return Array.from(this.map.keys());
  }

  values(): V[] {
    return Array.from(this.map.values(), node => node.value);
  }

  private moveToFront(node: LRUNode<K, V>) {
    this.removeFromList(node);
    this.insertAfterHead(node);
  }

  private insertAfterHead(node: LRUNode<K, V>) {
    node.next = this.head.next;
    node.prev = this.head;
    if (this.head.next) this.head.next.prev = node;
    this.head.next = node;
  }

  private removeFromList(node: LRUNode<K, V>) {
    if (node.prev) node.prev.next = node.next;
    if (node.next) node.next.prev = node.prev;
    node.prev = null;
    node.next = null;
  }

  private evictLRU() {
    const lru = this.tail.prev;
    if (lru && lru !== this.head) {
      this.removeFromList(lru);
      this.map.delete(lru.key);
    }
  }
}
