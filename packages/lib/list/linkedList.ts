export interface LinkedListNode<K, V> {
  key: K;
  value: V;
  prev: LinkedListNode<K, V> | null;
  next: LinkedListNode<K, V> | null;
}

export class LinkedList<K, V> {
  private map: Map<K, LinkedListNode<K, V>>; // since LinkedListNode is interface, the map will return a reference of each linked list node
  private head: LinkedListNode<K, V>; // the dummy head
  private tail: LinkedListNode<K, V>; // the dummy tail

  constructor() {
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

  get(key: K): LinkedListNode<K, V> | undefined {
    return this.map.get(key);
  }

  getHead(): LinkedListNode<K, V> {
    return this.head;
  }

  getTail(): LinkedListNode<K, V> {
    return this.tail;
  }

  insertBefore(
    targetNode: LinkedListNode<K, V>,
    key: K,
    value: V
  ): LinkedListNode<K, V> {
    if (this.map.has(key)) this.delete(key);
    const newNode = { key, value } as LinkedListNode<K, V>;
    this.map.set(key, newNode);
    this.link(newNode, targetNode.prev, targetNode);
    return newNode;
  }

  insertAfter(
    targetNode: LinkedListNode<K, V>,
    key: K,
    value: V
  ): LinkedListNode<K, V> {
    if (this.map.has(key)) this.delete(key);
    const newNode = { key, value } as LinkedListNode<K, V>;
    this.map.set(key, newNode);
    this.link(newNode, targetNode, targetNode.next);
    return newNode;
  }

  has(key: K): boolean {
    return this.map.has(key);
  }

  delete(key: K): boolean {
    const node = this.map.get(key);
    if (!node) return false;
    this.map.delete(key);
    this.unlink(node);
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

  keys(reverse: boolean = false): K[] {
    if (reverse) {
      const keys: K[] = [];
      let current = this.tail.prev;
      while (current !== null) {
        keys.push(current.key);
        current = current.prev;
      }
      return keys;
    } else {
      const keys: K[] = [];
      let current = this.head.next;
      while (current !== null) {
        keys.push(current.key);
        current = current.next;
      }
      return keys;
    }
  }

  values(reverse: boolean = false): V[] {
    if (reverse) {
      const values: V[] = [];
      let current = this.tail.prev;
      while (current !== null) {
        values.push(current.value);
        current = current.prev;
      }
      return values;
    } else {
      const values: V[] = [];
      let current = this.head.next;
      while (current !== null) {
        values.push(current.value);
        current = current.next;
      }
      return values;
    }
  }

  private link(
    node: LinkedListNode<K, V>,
    prev: LinkedListNode<K, V> | null,
    next: LinkedListNode<K, V> | null
  ) {
    node.prev = prev;
    node.next = next;
    if (prev !== null) prev.next = node;
    if (next !== null) next.prev = node;
  }

  private unlink(node: LinkedListNode<K, V>) {
    const prev = node.prev;
    const next = node.next;
    if (prev !== null) prev.next = next;
    if (next !== null) next.prev = prev;
  }
}
