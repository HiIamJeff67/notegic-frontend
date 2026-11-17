export class AsyncLocalStorage<T> {
  private current: T | undefined;

  getStore(): T | undefined {
    return this.current;
  }

  run<R>(store: T, callback: (...args: unknown[]) => R, ...args: unknown[]): R {
    const previous = this.current;
    this.current = store;
    try {
      return callback(...args);
    } finally {
      this.current = previous;
    }
  }

  exit<R>(callback: (...args: unknown[]) => R, ...args: unknown[]): R {
    const previous = this.current;
    this.current = undefined;
    try {
      return callback(...args);
    } finally {
      this.current = previous;
    }
  }
}
