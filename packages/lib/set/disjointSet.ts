export class HybridDisjointSet<K, P> {
  private parents: Map<K, K>;
  private ranks: Map<K, number>;
  private payloads: Map<K, P>;

  constructor() {
    this.parents = new Map<K, K>();
    this.ranks = new Map<K, number>();
    this.payloads = new Map<K, P>();
  }

  public add(item: K, initialRank = 0): void {
    if (!this.parents.has(item)) {
      this.parents.set(item, item);
      this.ranks.set(item, initialRank);
    }
  }

  public find(item: K): K {
    if (!this.parents.has(item)) {
      this.add(item);
      return item;
    }

    if (this.parents.get(item) !== item) {
      const root = this.find(this.parents.get(item)!);
      this.parents.set(item, root);
      return root;
    }

    return item;
  }

  public union(item1: K, item2: K): void {
    const root1 = this.find(item1);
    const root2 = this.find(item2);

    if (root1 === root2) return;

    const rank1 = this.ranks.get(root1)!;
    const rank2 = this.ranks.get(root2)!;

    let newRoot: K;
    let oldRoot: K;

    if (rank1 < rank2) {
      this.parents.set(root1, root2);
      newRoot = root2;
      oldRoot = root1;
    } else {
      this.parents.set(root2, root1);
      if (rank1 === rank2) {
        this.ranks.set(root1, rank1 + 1);
      }
      newRoot = root1;
      oldRoot = root2;
    }

    if (this.payloads.has(oldRoot) && !this.payloads.has(newRoot)) {
      this.payloads.set(newRoot, this.payloads.get(oldRoot) as P);
    }
    this.payloads.delete(oldRoot);
  }

  // only use this function to set the payload for the actual roots
  public setPayload(item: K, payload: P): void {
    const root = this.find(item);
    this.payloads.set(root, payload);
  }

  public getPayload(item: K): P | undefined {
    const root = this.find(item);
    return this.payloads.get(root);
  }

  public hasPayload(item: K): boolean {
    const root = this.find(item);
    return this.payloads.has(root);
  }

  public contains(item: K): boolean {
    return this.parents.has(item);
  }
}
