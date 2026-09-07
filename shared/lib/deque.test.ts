import { Deque } from "@shared/lib/deque";

describe("Deque Unit Tests", () => {
  describe("Constructor and Basic Properties", () => {
    test("should create deque with default capacity", () => {
      const deque = new Deque<number>();
      expect(deque.length()).toBe(0);
      expect(deque.isEmpty()).toBe(true);
      expect(deque.isFull()).toBe(false);
    });

    test("should create deque with specified capacity", () => {
      const deque = new Deque<string>(5);
      expect(deque.length()).toBe(0);
      expect(deque.isEmpty()).toBe(true);
      expect(deque.isFull()).toBe(false);
    });
  });

  describe("Push Operations (unshift/push)", () => {
    test("should unshift elements to front", () => {
      const deque = new Deque<number>(5);

      deque.unshift(1);
      expect(deque.toArray()).toEqual([1]);
      expect(deque.length()).toBe(1);

      deque.unshift(2);
      expect(deque.toArray()).toEqual([2, 1]);
      expect(deque.length()).toBe(2);

      deque.unshift(3);
      expect(deque.toArray()).toEqual([3, 2, 1]);
      expect(deque.length()).toBe(3);
    });

    test("should push elements to back", () => {
      const deque = new Deque<string>(5);

      deque.push("A");
      expect(deque.toArray()).toEqual(["A"]);
      expect(deque.length()).toBe(1);

      deque.push("B");
      expect(deque.toArray()).toEqual(["A", "B"]);
      expect(deque.length()).toBe(2);

      deque.push("C");
      expect(deque.toArray()).toEqual(["A", "B", "C"]);
      expect(deque.length()).toBe(3);
    });

    test("should mix unshift and push operations", () => {
      const deque = new Deque<number>(6);

      deque.push(2); // [2]
      deque.unshift(1); // [1, 2]
      deque.push(3); // [1, 2, 3]
      deque.unshift(0); // [0, 1, 2, 3]
      deque.push(4); // [0, 1, 2, 3, 4]

      expect(deque.toArray()).toEqual([0, 1, 2, 3, 4]);
      expect(deque.length()).toBe(5);
    });

    test("should throw error when pushing to full deque", () => {
      const deque = new Deque<number>(2);

      deque.push(1);
      deque.push(2);
      expect(deque.isFull()).toBe(true);

      expect(() => deque.push(3)).toThrow("Deque is at maximum capacity");
      expect(() => deque.unshift(0)).toThrow("Deque is at maximum capacity");
    });
  });

  describe("Pop Operations (shift/pop)", () => {
    test("should shift elements from front", () => {
      const deque = new Deque<number>(5);
      deque.push(1);
      deque.push(2);
      deque.push(3);

      expect(deque.shift()).toBe(1);
      expect(deque.toArray()).toEqual([2, 3]);
      expect(deque.length()).toBe(2);

      expect(deque.shift()).toBe(2);
      expect(deque.toArray()).toEqual([3]);
      expect(deque.length()).toBe(1);

      expect(deque.shift()).toBe(3);
      expect(deque.toArray()).toEqual([]);
      expect(deque.length()).toBe(0);
      expect(deque.isEmpty()).toBe(true);
    });

    test("should pop elements from back", () => {
      const deque = new Deque<string>(5);
      deque.push("A");
      deque.push("B");
      deque.push("C");

      expect(deque.pop()).toBe("C");
      expect(deque.toArray()).toEqual(["A", "B"]);
      expect(deque.length()).toBe(2);

      expect(deque.pop()).toBe("B");
      expect(deque.toArray()).toEqual(["A"]);
      expect(deque.length()).toBe(1);

      expect(deque.pop()).toBe("A");
      expect(deque.toArray()).toEqual([]);
      expect(deque.length()).toBe(0);
      expect(deque.isEmpty()).toBe(true);
    });

    test("should throw error when popping from empty deque", () => {
      const deque = new Deque<number>(3);

      expect(() => deque.shift()).toThrow("Deque is empty");
      expect(() => deque.pop()).toThrow("Deque is empty");
    });
  });

  describe("Get and Set Operations", () => {
    test("should get elements by index", () => {
      const deque = new Deque<number>(5);
      deque.push(10);
      deque.push(20);
      deque.push(30);

      expect(deque.get(0)).toBe(10);
      expect(deque.get(1)).toBe(20);
      expect(deque.get(2)).toBe(30);
    });

    test("should set elements by index", () => {
      const deque = new Deque<number>(5);
      deque.push(10);
      deque.push(20);
      deque.push(30);

      deque.set(1, 99);
      expect(deque.toArray()).toEqual([10, 99, 30]);

      deque.set(0, 11);
      deque.set(2, 33);
      expect(deque.toArray()).toEqual([11, 99, 33]);
    });

    test("should throw error for invalid indices in get/set", () => {
      const deque = new Deque<number>(5);
      deque.push(1);
      deque.push(2);

      expect(() => deque.get(-1)).toThrow("Index -1 out of bounds [0, 2)");
      expect(() => deque.get(2)).toThrow("Index 2 out of bounds [0, 2)");
      expect(() => deque.get(5)).toThrow("Index 5 out of bounds [0, 2)");

      expect(() => deque.set(-1, 99)).toThrow("Index -1 out of bounds [0, 2)");
      expect(() => deque.set(2, 99)).toThrow("Index 2 out of bounds [0, 2)");
    });
  });

  describe("Insert Operations", () => {
    test("should insert at front (index 0)", () => {
      const deque = new Deque<number>(5);
      deque.push(1);
      deque.push(2);
      deque.push(3);

      deque.insert(0, 0);
      expect(deque.toArray()).toEqual([0, 1, 2, 3]);
      expect(deque.length()).toBe(4);
    });

    test("should insert at back (last index)", () => {
      const deque = new Deque<number>(5);
      deque.push(1); // [1]
      deque.push(2); // [1, 2]
      deque.push(3); // [1, 2, 3]

      deque.insert(2, 4); // [1, 2, 4, 3]
      expect(deque.toArray()).toEqual([1, 2, 4, 3]);
      expect(deque.length()).toBe(4);
    });

    test("should insert in middle (front half optimization)", () => {
      const deque = new Deque<number>(10);
      for (let i = 0; i < 5; i++) {
        deque.push(i);
      }
      // deque: [0, 1, 2, 3, 4]

      deque.insert(2, 99); // 在 index 2 插入，應該從前面移動
      expect(deque.toArray()).toEqual([0, 1, 99, 2, 3, 4]);
      expect(deque.length()).toBe(6);
    });

    test("should insert in middle (back half optimization)", () => {
      const deque = new Deque<number>(10);
      for (let i = 0; i < 6; i++) {
        deque.push(i);
      }
      // deque: [0, 1, 2, 3, 4, 5]

      deque.insert(4, 99); // 在 index 4 插入，應該從後面移動
      expect(deque.toArray()).toEqual([0, 1, 2, 3, 99, 4, 5]);
      expect(deque.length()).toBe(7);
    });

    test("should handle insert with circular buffer wrap-around", () => {
      const deque = new Deque<string>(5);

      // 先填滿然後彈出一些，造成 wrap-around
      deque.push("A");
      deque.push("B");
      deque.push("C");
      deque.push("D");
      deque.push("E");

      deque.shift(); // 移除 A，現在是 [B, C, D, E]
      deque.shift(); // 移除 B，現在是 [C, D, E]

      deque.unshift("X"); // 添加到前面，現在是 [X, C, D, E]

      deque.insert(2, "Y"); // 在 index 2 插入
      expect(deque.toArray()).toEqual(["X", "C", "Y", "D", "E"]);
    });

    test("should throw error for invalid insert indices", () => {
      const deque = new Deque<number>(5);
      deque.push(1); // [1]
      deque.push(2); // [1, 2]

      expect(() => deque.insert(-1, 99)).toThrow(
        "Index -1 out of bounds [0, 2]"
      );
      deque.insert(2, 99);
      expect(deque.toArray()).toEqual([1, 2, 99]); // [1, 2, 99]
    });

    test("should throw error when inserting to full deque", () => {
      const deque = new Deque<number>(3);
      deque.push(1);
      deque.push(2);
      deque.push(3);

      expect(() => deque.insert(1, 99)).toThrow("Deque is at maximum capacity");
    });
  });

  describe("Extract Operations", () => {
    test("should extract from front (index 0)", () => {
      const deque = new Deque<number>(5);
      deque.push(1);
      deque.push(2);
      deque.push(3);

      const extracted = deque.extract(0);
      expect(extracted).toBe(1);
      expect(deque.toArray()).toEqual([2, 3]);
      expect(deque.length()).toBe(2);
    });

    test("should extract from back (last index)", () => {
      const deque = new Deque<number>(5);
      deque.push(1);
      deque.push(2);
      deque.push(3);

      const extracted = deque.extract(2);
      expect(extracted).toBe(3);
      expect(deque.toArray()).toEqual([1, 2]);
      expect(deque.length()).toBe(2);
    });

    test("should extract from middle (front half optimization)", () => {
      const deque = new Deque<number>(10);
      for (let i = 0; i < 6; i++) {
        deque.push(i);
      }
      // deque: [0, 1, 2, 3, 4, 5]

      const extracted = deque.extract(1);
      expect(extracted).toBe(1);
      expect(deque.toArray()).toEqual([0, 2, 3, 4, 5]);
      expect(deque.length()).toBe(5);
    });

    test("should extract from middle (back half optimization)", () => {
      const deque = new Deque<number>(10);
      for (let i = 0; i < 6; i++) {
        deque.push(i);
      }
      // deque: [0, 1, 2, 3, 4, 5]

      const extracted = deque.extract(4);
      expect(extracted).toBe(4);
      expect(deque.toArray()).toEqual([0, 1, 2, 3, 5]);
      expect(deque.length()).toBe(5);
    });

    test("should handle extract with circular buffer wrap-around", () => {
      const deque = new Deque<string>(5);

      // 創建 wrap-around 情況
      deque.push("A");
      deque.push("B");
      deque.push("C");
      deque.push("D");
      deque.push("E");

      deque.shift(); // [B, C, D, E]
      deque.unshift("X"); // [X, B, C, D, E]

      const extracted = deque.extract(2);
      expect(extracted).toBe("C");
      expect(deque.toArray()).toEqual(["X", "B", "D", "E"]);
    });

    test("should throw error for invalid extract indices", () => {
      const deque = new Deque<number>(5);
      deque.push(1);
      deque.push(2);

      expect(() => deque.extract(-1)).toThrow("Index -1 out of bounds [0, 2)");
      expect(() => deque.extract(2)).toThrow("Index 2 out of bounds [0, 2)");
    });

    test("should throw error when extracting from empty deque", () => {
      const deque = new Deque<number>(3);

      expect(() => deque.extract(0)).toThrow("Deque is empty");
    });
  });

  describe("Clear Operation", () => {
    test("should clear deque completely", () => {
      const deque = new Deque<number>(5);
      deque.push(1);
      deque.push(2);
      deque.push(3);

      expect(deque.length()).toBe(3);
      expect(deque.isEmpty()).toBe(false);

      deque.clear();

      expect(deque.length()).toBe(0);
      expect(deque.isEmpty()).toBe(true);
      expect(deque.isFull()).toBe(false);
      expect(deque.toArray()).toEqual([]);
    });

    test("should allow operations after clear", () => {
      const deque = new Deque<string>(3);
      deque.push("A");
      deque.push("B");
      deque.clear();

      deque.push("X");
      deque.unshift("Y");

      expect(deque.toArray()).toEqual(["Y", "X"]);
      expect(deque.length()).toBe(2);
    });
  });

  describe("Edge Cases and Stress Tests", () => {
    test("should maintain consistency with complex operations", () => {
      const deque = new Deque<number>(10);

      // 填滿前 5 個位置
      for (let i = 0; i < 5; i++) {
        deque.push(i); // [0, 1, 2, 3, 4]
      }
      expect(deque.toArray()).toEqual([0, 1, 2, 3, 4]);

      // 移除前後元素
      deque.shift(); // [1, 2, 3, 4]
      deque.pop(); // [1, 2, 3]

      // 從兩端添加
      deque.unshift(0); // [0, 1, 2, 3]
      deque.push(4); // [0, 1, 2, 3, 4]

      // 現在 deque 有 5 個元素，容量是 10，還有空間
      expect(deque.length()).toBe(5);
      expect(deque.isFull()).toBe(false);

      // 移除中間元素
      const extracted = deque.extract(2);
      expect(extracted).toBe(2);
      expect(deque.toArray()).toEqual([0, 1, 3, 4]);

      // 現在可以插入
      deque.insert(2, 2.5);
      expect(deque.toArray()).toEqual([0, 1, 2.5, 3, 4]);
    });

    test("should handle alternating operations", () => {
      const deque = new Deque<number>(10);

      // 混合各種操作
      deque.push(1); // [1]
      deque.unshift(0); // [0, 1]
      deque.push(2); // [0, 1, 2]
      expect(deque.toArray()).toEqual([0, 1, 2]);

      deque.insert(1, 0.5); // [0, 0.5, 1, 2]
      expect(deque.toArray()).toEqual([0, 0.5, 1, 2]);

      const extracted = deque.extract(2); // 提取 index 2 (value 1)
      expect(extracted).toBe(1);
      expect(deque.toArray()).toEqual([0, 0.5, 2]);
    });
  });

  describe("Performance and Boundary Validation", () => {
    test("should handle large number of operations efficiently", () => {
      const deque = new Deque<number>(1000);

      // 測試大量 push/pop 操作
      for (let i = 0; i < 500; i++) {
        deque.push(i);
      }
      expect(deque.length()).toBe(500);

      for (let i = 0; i < 250; i++) {
        deque.shift();
      }
      expect(deque.length()).toBe(250);

      for (let i = 0; i < 250; i++) {
        deque.unshift(i);
      }
      expect(deque.length()).toBe(500);

      // 驗證內容正確性
      expect(deque.get(0)).toBe(249);
      expect(deque.get(499)).toBe(499);
    });

    test("should validate all boundary conditions", () => {
      const deque = new Deque<string>(3);

      // 測試空 deque 的所有邊界
      expect(() => deque.get(0)).toThrow();
      expect(() => deque.set(0, "x")).toThrow();
      expect(() => deque.extract(0)).toThrow();
      expect(() => deque.insert(1, "x")).toThrow(); // 只能在 index 0 插入
      expect(() => deque.shift()).toThrow();
      expect(() => deque.pop()).toThrow();

      // 添加一個元素後測試邊界
      deque.push("A");
      expect(() => deque.get(1)).toThrow();
      expect(() => deque.set(1, "x")).toThrow();
      expect(() => deque.extract(1)).toThrow();
      expect(() => deque.insert(2, "x")).toThrow(); // 只能在 index 0,1 插入

      // 滿容量測試
      deque.push("B");
      deque.push("C");
      expect(() => deque.push("D")).toThrow();
      expect(() => deque.unshift("Z")).toThrow();
      expect(() => deque.insert(1, "X")).toThrow();
    });
  });
});
