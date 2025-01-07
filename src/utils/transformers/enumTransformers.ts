export const enumToNumbersValues = (enumObject: any): number[] => {
   return Object.values(enumObject)
      .slice(Object.keys(enumObject).length / 2, Object.keys(enumObject).length)
      .filter((value) => typeof value === 'number')
      .map((value) => Number(value));
};
