export class Deque<T> {
  private buffer: (T | undefined)[];
  private head: number = 0;
  private tail: number = 0;
  private size: number = 0;
  private capacity: number;

  constructor(initialCapacity: number = 10) {
    this.capacity = initialCapacity;
    this.buffer = new Array(this.capacity);
  }

  // Get the element with index of `index`.
  // Time Complexity of O(1).
  public get(index: number): T | undefined {
    if (index < 0 || index >= this.size) {
      throw new Error(`Index ${index} out of bounds [0, ${this.size})`);
    }
    const actualIndex = (this.head + index) % this.capacity;
    return this.buffer[actualIndex];
  }

  // Set or update the element with index of `index` and the value of `element`.
  // Time Complexity of O(1).
  public set(index: number, element: T | undefined) {
    if (index < 0 || index >= this.size) {
      throw new Error(`Index ${index} out of bounds [0, ${this.size})`);
    }
    const actualIndex = (this.head + index) % this.capacity;
    this.buffer[actualIndex] = element;
  }

  // Get the length of the deque.
  // Time Complexity of O(1).
  public length(): number {
    return this.size;
  }

  public isEmpty(): boolean {
    return this.size === 0;
  }

  public isFull(): boolean {
    return this.size === this.capacity;
  }

  // Clear the entire deque to an list with all elements set to undefined.
  // Note the length is remain the same as we construct the deque.
  // Time Complexity of O(n).
  public clear(): void {
    this.buffer.fill(undefined);
    this.head = 0;
    this.tail = 0;
    this.size = 0;
  }

  // Only use for testing.
  // Time Complexity of O(n).
  public toArray(): T[] {
    const result: T[] = [];
    for (let i = 0; i < this.size; i++) {
      const element = this.get(i);
      if (element !== undefined) {
        result.push(element);
      }
    }
    return result;
  }

  public map<U>(callback: (value: T, index: number) => U): U[] {
    const result: U[] = [];
    for (let i = 0; i < this.size; i++) {
      const element = this.get(i);
      if (element !== undefined) {
        result.push(callback(element, i));
      }
    }
    return result;
  }

  public forEach(callback: (value: T, index: number) => void): void {
    for (let i = 0; i < this.size; i++) {
      const element = this.get(i);
      if (element !== undefined) {
        callback(element, i);
      }
    }
  }

  public filter(predicate: (value: T, index: number) => boolean): T[] {
    const result: T[] = [];
    for (let i = 0; i < this.size; i++) {
      const element = this.get(i);
      if (element !== undefined && predicate(element, i)) {
        result.push(element);
      }
    }
    return result;
  }

  public *[Symbol.iterator](): Iterator<T> {
    for (let i = 0; i < this.size; i++) {
      const element = this.get(i);
      if (element !== undefined) {
        yield element;
      }
    }
  }

  // Push an element to the front of the deque.
  // Time complexity of O(1).
  public unshift(element: T): void {
    if (this.isFull()) {
      throw new Error("Deque is at maximum capacity");
    }

    this.head = (this.head - 1 + this.capacity) % this.capacity;
    this.buffer[this.head] = element;
    this.size++;
  }

  // Push an element to the back of the deque.
  // Time Complexity of O(1).
  public push(element: T): void {
    if (this.isFull()) {
      throw new Error("Deque is at maximum capacity");
    }

    this.buffer[this.tail] = element;
    this.tail = (this.tail + 1) % this.capacity;
    this.size++;
  }

  // Insert an element to the position with the index of `index`.
  // The range of index is from 0 (included) to its length (included).
  // Time Complexity of O(n).
  public insert(index: number, element: T): void {
    if (this.isFull()) {
      throw new Error("Deque is at maximum capacity");
    }
    if (index < 0 || index > this.size) {
      throw new Error(`Index ${index} out of bounds [0, ${this.size}]`);
    }

    if (index === 0) {
      this.unshift(element);
      return;
    }
    if (index === this.size) {
      this.push(element);
      return;
    }

    if (index <= this.size / 2) {
      this.head = (this.head - 1 + this.capacity) % this.capacity;

      for (let i = 0; i < index; i++) {
        const srcIndex = (this.head + i + 1) % this.capacity;
        const destIndex = (this.head + i) % this.capacity;
        this.buffer[destIndex] = this.buffer[srcIndex];
      }

      const insertIndex = (this.head + index) % this.capacity;
      this.buffer[insertIndex] = element;
    } else {
      const newTail = (this.tail + 1) % this.capacity;

      for (let i = this.size - 1; i >= index; i--) {
        const srcIndex = (this.head + i) % this.capacity;
        const destIndex = (this.head + i + 1) % this.capacity;
        this.buffer[destIndex] = this.buffer[srcIndex];
      }

      const insertIndex = (this.head + index) % this.capacity;
      this.buffer[insertIndex] = element;

      this.tail = newTail;
    }

    this.size++;
  }

  // Pop an element from the front of the deque.
  // Time Complexity of O(1).
  public shift(): T {
    if (this.isEmpty()) {
      throw new Error("Deque is empty");
    }

    const element = this.buffer[this.head];
    this.buffer[this.head] = undefined;
    this.head = (this.head + 1) % this.capacity;
    this.size--;
    return element as T;
  }

  // Pop an element from the back of the deque.
  // Time Complexity of O(1).
  public pop(): T {
    if (this.isEmpty()) {
      throw new Error("Deque is empty");
    }

    this.tail = (this.tail - 1 + this.capacity) % this.capacity;
    const element = this.buffer[this.tail];
    this.buffer[this.tail] = undefined;
    this.size--;
    return element as T;
  }

  // Extract(include deletion) an element in the position with the index of `index`.
  // The range of index is from 0 (included) to its length (excluded).
  // Time Complexity of O(n).
  public extract(index: number): T {
    if (this.isEmpty()) {
      throw new Error("Deque is empty");
    }
    if (index < 0 || index >= this.size) {
      throw new Error(`Index ${index} out of bounds [0, ${this.size})`);
    }

    if (index === 0) {
      return this.shift();
    }
    if (index === this.size - 1) {
      return this.pop();
    }

    const targetIndex = (this.head + index) % this.capacity;
    const targetElement = this.buffer[targetIndex];

    if (index <= this.size / 2) {
      for (let i = index; i > 0; i--) {
        const srcIndex = (this.head + i - 1) % this.capacity;
        const destIndex = (this.head + i) % this.capacity;
        this.buffer[destIndex] = this.buffer[srcIndex];
      }

      this.buffer[this.head] = undefined;
      this.head = (this.head + 1) % this.capacity;
    } else {
      for (let i = index; i < this.size - 1; i++) {
        const srcIndex = (this.head + i + 1) % this.capacity;
        const destIndex = (this.head + i) % this.capacity;
        this.buffer[destIndex] = this.buffer[srcIndex];
      }

      this.tail = (this.tail - 1 + this.capacity) % this.capacity;
      this.buffer[this.tail] = undefined;
    }

    this.size--;
    return targetElement as T;
  }
}
