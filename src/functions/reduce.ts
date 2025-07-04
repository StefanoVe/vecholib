export const asyncReduce = async <T, U>(
  array: T[],
  callback: (acc: U, curr: T, index: number, array: T[]) => U,
  initialValue: U
) => {
  let accumulator = initialValue;
  for (let i = 0; i < array.length; i++) {
    accumulator = await callback(accumulator, array[i], i, array);
  }

  return accumulator;
};
