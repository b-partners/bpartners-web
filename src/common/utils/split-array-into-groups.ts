/**
 * Splits an array into smaller groups of the specified size.
 *
 * @param array - The input array to be grouped.
 * @param groupSize - The size of each group.
 * @returns A two-dimensional array where each sub-array has at most `groupSize` elements.
 */
export const splitArrayIntoGroups = <T>(array: T[], groupSize: number): T[][] => {
  return array.reduce((acc: T[][], current, index) => {
    if (index % groupSize === 0) {
      acc.push([]);
    }
    acc[acc.length - 1].push(current);
    return acc;
  }, []);
};
