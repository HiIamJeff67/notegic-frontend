import { GetMySubShelvesByRootShelfIdResponse } from "@shared/api/interfaces/subShelf.interface";
import {
  BytesOfArrayHeader,
  BytesOfDate,
  BytesOfMapHeader,
  BytesOfObjectHeader,
  BytesOfPtr,
  BytesOfUUIDString,
  MaxMaterialsOfRootShelf,
  MaxSubShelvesOfRootShelf,
} from "@shared/constants";
import { AnalysisStatus } from "@shared/enums";
import { MaterialNode } from "@shared/types/itemNodes.type";
import { RootShelfNode, SubShelfNode } from "@shared/types/shelfNodes.type";
import { ShelfTreeSummary } from "@shared/types/shelfTreeSummary.type";
import type { UUID } from "crypto";

export class RootShelfManipulator {
  private static maxTraverseCount: number =
    MaxSubShelvesOfRootShelf + MaxMaterialsOfRootShelf;

  constructor(
    maxTraverseCount: number = MaxSubShelvesOfRootShelf +
      MaxMaterialsOfRootShelf
  ) {
    RootShelfManipulator.maxTraverseCount = Math.min(
      MaxSubShelvesOfRootShelf + MaxMaterialsOfRootShelf,
      maxTraverseCount
    );
  }

  /* ============================== Max Traverse Count Getter & Setter ============================== */

  public static getMaxTraverseCount(): number {
    return RootShelfManipulator.maxTraverseCount;
  }

  public static setMaxTraverseCount(value: number): void {
    RootShelfManipulator.maxTraverseCount = Math.min(
      MaxSubShelvesOfRootShelf + MaxMaterialsOfRootShelf,
      value
    );
  }

  /* ============================== Estimate Functions ============================== */

  public static estimateSubShelfNode(subShelfNode: SubShelfNode): number {
    const nameBytes = (subShelfNode.name?.length ?? 0) * 2;
    const pathCount = subShelfNode.path?.length ?? 0;
    const childrenCount = Object.keys(subShelfNode.children).length;
    const materialCount = Object.keys(subShelfNode.materialNodes).length;

    let size =
      BytesOfObjectHeader + // SubShelfNode 物件本身
      BytesOfUUIDString + // id
      BytesOfUUIDString + // rootShelfId
      (subShelfNode.prevSubShelfId ? BytesOfUUIDString : BytesOfPtr) + // prevSubShelfId or null
      3 * BytesOfDate + // deletedAt/updatedAt/createdAt
      nameBytes;

    // path: 陣列 header + 每個元素（ref + UUID 字串）
    size += BytesOfArrayHeader + pathCount * (BytesOfPtr + BytesOfUUIDString);

    // children: 物件作為 map（header + 每個 entry：key(UUID字串) + value 指標）
    size += BytesOfMapHeader + childrenCount * (BytesOfUUIDString + BytesOfPtr);

    // materialNodes: 同上
    size += BytesOfMapHeader + materialCount * (BytesOfUUIDString + BytesOfPtr);

    return size;
  }

  public static estimateMaterialNode(materialNode: MaterialNode): number {
    return (
      BytesOfObjectHeader + // 物件本身
      2 * BytesOfUUIDString + // id + parentSubShelfId
      (materialNode.name?.length ?? 0) * 2 +
      (materialNode.contentType?.length ?? 0) * 2 +
      (materialNode.parseMediaType?.length ?? 0) * 2 +
      (materialNode.downloadURL?.length ?? 0) * 2 +
      3 * BytesOfDate // deletedAt/updatedAt/createdAt
    );
  }

  /* ============================== Initialization ============================== */

  public static initializeSubShelfNodeTreeByResponse(
    newRootShelfNode: RootShelfNode,
    responseOfSubShelves: GetMySubShelvesByRootShelfIdResponse
  ): RootShelfNode {
    let i = 0,
      prevSubShelfNodes: Record<UUID, SubShelfNode> = {},
      curSubShelfNodes: Record<UUID, SubShelfNode> = {};
    const visitedSubShelfIds: Set<UUID> = new Set();
    responseOfSubShelves.data.sort((a, b) => a.path.length - b.path.length);
    // initialize the first layer
    for (const subShelf of responseOfSubShelves.data) {
      if (subShelf.prevSubShelfId !== null || subShelf.path.length !== 0) break;

      if (visitedSubShelfIds.has(subShelf.id as UUID)) {
        throw new Error(`Duplicate subShelf id: ${subShelf.id}`);
      }
      visitedSubShelfIds.add(subShelf.id as UUID);

      const newSubShelfNode: SubShelfNode = {
        id: subShelf.id as UUID,
        rootShelfId: newRootShelfNode.id,
        prevSubShelfId: null,
        name: subShelf.name,
        path: [],
        updatedAt: subShelf.updatedAt,
        createdAt: subShelf.createdAt,
        isExpanded: false,
        children: {},
        materialNodes: {},
        blockPackNodes: {},
        isOpen: false,
        nodeType: "SubShelf",
      };
      newRootShelfNode.children[subShelf.id as UUID] = newSubShelfNode;
      prevSubShelfNodes[newSubShelfNode.id] =
        newRootShelfNode.children[subShelf.id as UUID];
      i++;
    }

    if (Object.entries(prevSubShelfNodes).length === 0) return newRootShelfNode;

    // construct the entire sub shelf structure
    const n = responseOfSubShelves.data.length;
    const maxPathLength =
      responseOfSubShelves.data[responseOfSubShelves.data.length - 1]?.path
        ?.length ?? 0;
    for (
      let pathLength = 1;
      i < n && pathLength <= maxPathLength;
      pathLength++
    ) {
      if (responseOfSubShelves.data[i].path.length !== pathLength) continue; // it is impossible that lhs < rhs

      while (i < n && responseOfSubShelves.data[i].path.length === pathLength) {
        if (responseOfSubShelves.data[i].prevSubShelfId === null) {
          throw new Error(`Null prev sub shelf id detected`);
        }
        if (visitedSubShelfIds.has(responseOfSubShelves.data[i].id as UUID)) {
          throw new Error(
            `Duplicate subShelf id: ${responseOfSubShelves.data[i].id}`
          );
        }
        visitedSubShelfIds.add(responseOfSubShelves.data[i].id as UUID);

        const newSubShelfNode: SubShelfNode = {
          id: responseOfSubShelves.data[i].id as UUID,
          rootShelfId: newRootShelfNode.id,
          prevSubShelfId: responseOfSubShelves.data[i].prevSubShelfId as UUID,
          name: responseOfSubShelves.data[i].name,
          path: responseOfSubShelves.data[i].path as UUID[],
          updatedAt: responseOfSubShelves.data[i].updatedAt,
          createdAt: responseOfSubShelves.data[i].createdAt,
          isExpanded: false,
          children: {},
          materialNodes: {},
          blockPackNodes: {},
          isOpen: false,
          nodeType: "SubShelf",
        };

        if (
          !prevSubShelfNodes[newSubShelfNode.prevSubShelfId as UUID] ||
          !prevSubShelfNodes[
            newSubShelfNode.path[newSubShelfNode.path.length - 1]
          ]
        ) {
          throw new Error(
            `Parent subShelf with ID ${newSubShelfNode.prevSubShelfId} not found for child ${newSubShelfNode.id}`
          );
        }
        prevSubShelfNodes[newSubShelfNode.prevSubShelfId as UUID].children[
          newSubShelfNode.id as UUID
        ] = newSubShelfNode;
        curSubShelfNodes[newSubShelfNode.id] = newSubShelfNode;
        i++;
      }

      prevSubShelfNodes = curSubShelfNodes;
      curSubShelfNodes = {};
    }

    return newRootShelfNode;
  }

  /* ============================== Algorithms ============================== */

  /* Check if `desiredChild` is a child of `desiredParent` */
  public static isChild(
    desiredParent: RootShelfNode,
    desiredChild: SubShelfNode
  ): boolean {
    let traverseCount: number = 0,
      maxWidth: number = 0,
      maxDepth: number = 0;

    const visited: Set<UUID> = new Set<UUID>();
    const queue: SubShelfNode[] = [];
    for (const child of Object.values(desiredParent.children)) {
      queue.push(child);
    }

    while (queue.length > 0) {
      let levelSize = queue.length;
      maxWidth = Math.max(maxWidth, levelSize);
      maxDepth++;

      while (levelSize--) {
        if (traverseCount > RootShelfManipulator.maxTraverseCount) {
          throw new Error(
            `Maximum iterations of ${traverseCount} exceeded the limit of ${RootShelfManipulator.maxTraverseCount}`
          );
        }

        const current = queue.shift()!;
        traverseCount++;

        if (visited.has(current.id)) {
          throw new Error(`Cycle detected at node: ${current.id}`);
        }
        visited.add(current.id);

        if (current.id == desiredChild.id) {
          return true;
        }

        for (const child of Object.values(current.children)) {
          if (child) {
            queue.push(child);
          }
        }
      }
    }

    return false;
  }

  /* Try to get the information of the `desiredChild` from the `desiredParent`
   * if the `desiredChild` is a child of `desiredParent`,
   * then return the width of the layer of `desiredChild`, and the depth from the parent to the child as an object,
   *      and the subWidth to indicate the width of the child layer of `desiredChild`
   * else return { width: -1, subWidth: -1, depth: -1 } to indicate that the `desiredChild` is not a child of `desiredParent`.
   * Note that if it return { width: 1, subWidth: x, depth: 0 }, x is the width of the child layer of `desiredParent`,
   *      then the `desiredChild` == `desiredParent`.
   */
  public static getChildInformation(
    desiredParent: RootShelfNode,
    desiredChild: SubShelfNode
  ): { width: number; subWidth: number; depth: number } {
    let traverseCount: number = 0,
      maxWidth: number = 0,
      maxDepth: number = 0;

    const visited: Set<UUID> = new Set<UUID>();
    const queue: SubShelfNode[] = [];
    for (const child of Object.values(desiredParent.children)) {
      queue.push(child);
    }

    while (queue.length > 0) {
      let levelSize = queue.length;
      const currentWidth = levelSize;
      let isFound = false;
      maxWidth = Math.max(maxWidth, levelSize);
      maxDepth++;

      while (levelSize--) {
        if (traverseCount > RootShelfManipulator.maxTraverseCount) {
          throw new Error(
            `Maximum iterations of ${traverseCount} exceeded the limit of ${RootShelfManipulator.maxTraverseCount}`
          );
        }

        const current = queue.shift()!;
        traverseCount++;

        if (visited.has(current.id)) {
          throw new Error(`Cycle detected at node: ${current.id}`);
        }
        visited.add(current.id);

        if (current.id == desiredChild.id) {
          isFound = true;
          // don't return here, wait until the while(the current layer) done
        }

        for (const child of Object.values(current.children)) {
          if (child) {
            queue.push(child);
          }
        }
      }

      if (isFound) {
        return { width: currentWidth, subWidth: queue.length, depth: maxDepth };
      }
    }

    return { width: -1, subWidth: -1, depth: -1 };
  }

  public static getAllChildSubShelfNodesAndMaterialNodes(
    rootShelfNode: RootShelfNode
  ): {
    childSubShelfNodes: SubShelfNode[];
    materialNodes: MaterialNode[];
  } {
    let traverseCount: number = 0,
      maxWidth: number = 0,
      maxDepth: number = 0;

    const visited: Set<UUID> = new Set<UUID>();
    const uniqueSubShelfNodes: Record<UUID, SubShelfNode> = {};
    const uniqueMaterialNodes: Record<UUID, MaterialNode> = {};
    const queue: SubShelfNode[] = [];
    for (const child of Object.values(rootShelfNode.children)) {
      queue.push(child);
    }

    while (queue.length > 0) {
      let levelSize = queue.length;
      maxWidth = Math.max(maxWidth, levelSize);
      maxDepth++;

      while (levelSize--) {
        if (traverseCount > RootShelfManipulator.maxTraverseCount) {
          throw new Error(
            `Maximum iterations of ${traverseCount} exceeded the limit of ${RootShelfManipulator.maxTraverseCount}`
          );
        }
        traverseCount++;

        const current = queue.shift();
        if (current === undefined) continue; // this should be never executed

        if (visited.has(current.id)) {
          return { childSubShelfNodes: [], materialNodes: [] };
        }
        visited.add(current.id);

        for (const [materialId, materialNode] of Object.entries(
          current.materialNodes
        )) {
          uniqueMaterialNodes[materialId as UUID] = materialNode;
        }

        for (const [childId, child] of Object.entries(current.children)) {
          uniqueSubShelfNodes[childId as UUID] = child;
          queue.push(child);
        }
      }
    }

    return {
      childSubShelfNodes: Object.values(uniqueSubShelfNodes),
      materialNodes: Object.values(uniqueMaterialNodes),
    };
  }

  public static isChildrenSimple(rootShelfNode: RootShelfNode): {
    isSimple: boolean;
    cycleNode: SubShelfNode | null;
  } {
    let traverseCount: number = 0,
      maxWidth: number = 0,
      maxDepth: number = 0;

    const visited: Set<UUID> = new Set<UUID>();
    const queue: SubShelfNode[] = [];
    for (const child of Object.values(rootShelfNode.children)) {
      queue.push(child);
    }

    while (queue.length > 0) {
      let levelSize = queue.length;
      maxWidth = Math.max(maxWidth, levelSize);
      maxDepth++;

      while (levelSize--) {
        if (traverseCount > RootShelfManipulator.maxTraverseCount) {
          throw new Error(
            `Maximum iterations of ${traverseCount} exceeded the limit of ${RootShelfManipulator.maxTraverseCount}`
          );
        }

        const current = queue.shift()!;
        traverseCount++;

        if (visited.has(current.id)) {
          return { isSimple: false, cycleNode: current };
        }
        visited.add(current.id);

        for (const child of Object.values(current.children)) {
          if (child) {
            queue.push(child);
          }
        }
      }
    }

    return {
      isSimple: true,
      cycleNode: null,
    };
  }

  public static analysisAndGenerateSummary(
    rootShelfNode: RootShelfNode
  ): ShelfTreeSummary {
    let subShelfCount: number = 0,
      maxWidth: number = 0,
      maxDepth: number = 0,
      estimatedByteSize: number = 0;

    const queue: SubShelfNode[] = [];
    for (const subShelf of Object.values(rootShelfNode.children)) {
      queue.push(subShelf);
    }
    const visited: Set<UUID> = new Set<UUID>();
    const uniqueItemIdsSet: Set<UUID> = new Set<UUID>();

    while (queue.length > 0) {
      let levelSize = queue.length;
      maxWidth = Math.max(maxWidth, levelSize);
      maxDepth++;

      while (levelSize--) {
        if (subShelfCount > RootShelfManipulator.maxTraverseCount) {
          throw new Error(
            `Maximum iterations (${RootShelfManipulator.maxTraverseCount}) exceeded`
          );
        }

        const current = queue.shift()!;
        subShelfCount++;

        if (visited.has(current.id)) {
          throw new Error(`Cycle detected at node: ${current.id}`);
        }
        visited.add(current.id);

        for (const [materialId, material] of Object.entries(
          current.materialNodes
        )) {
          if (uniqueItemIdsSet.has(materialId as UUID)) {
            throw new Error(
              `Repeated material ids detected in the same shelf tree`
            );
          }
          uniqueItemIdsSet.add(materialId as UUID);

          estimatedByteSize += this.estimateMaterialNode(material);
        }

        estimatedByteSize += this.estimateSubShelfNode(current);

        for (const child of Object.values(current.children)) {
          if (child) queue.push(child);
        }
      }
    }
    rootShelfNode.subShelfCount = subShelfCount;
    rootShelfNode.itemCount = uniqueItemIdsSet.size;

    return {
      root: rootShelfNode,
      estimatedByteSize: estimatedByteSize,
      hasChanged: false,
      analysisStatus: AnalysisStatus.Explored,
      maxWidth: maxWidth,
      maxDepth: maxDepth,
    };
  }
}
