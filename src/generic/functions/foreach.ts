/**
 * a for loop that waits for the callback to finish before moving on to the next iteration.
 * @param {any[]} array - the array you want to loop through
 * @param callback - The function to execute on each element in the array.
 */
export const asyncForEach = async <T>(
  array: T[],
  callback: (curr: T, index: number, array: unknown[]) => unknown
) => {
  if (!array) return;
  for (let i = 0; i < array.length; i++) {
    await callback(array[i], i, array);
  }

  return array;
};
