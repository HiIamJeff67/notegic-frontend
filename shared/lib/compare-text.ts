// Match PostgreSQL's UTF-8 COLLATE "C", independently of the OS locale.
export const compareText = (left: string, right: string): number => {
  if (left === right) return 0;
  const leftPoints = Array.from(left, character => character.codePointAt(0)!);
  const rightPoints = Array.from(right, character => character.codePointAt(0)!);
  for (
    let index = 0;
    index < Math.min(leftPoints.length, rightPoints.length);
    index++
  ) {
    if (leftPoints[index] !== rightPoints[index]) {
      return leftPoints[index] < rightPoints[index] ? -1 : 1;
    }
  }
  return leftPoints.length < rightPoints.length ? -1 : 1;
};
