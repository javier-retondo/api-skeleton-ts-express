import { ProjectionAlias, col } from 'sequelize';

type TableColumns = {
   attributes: ProjectionAlias[];
   groups: string[];
};
export const makeArrayColumnsAlias = (
   tableColumns: {
      columns: Record<string, string>;
      table: string;
      include?: string;
      exclude?: string;
   }[],
): TableColumns => {
   const result = tableColumns.map(({ columns, table, exclude, include }) => {
      if (exclude) {
         columns = Object.entries(columns).reduce(
            (acc, [key, value]) => {
               if (!exclude.includes(key)) {
                  acc[key] = value;
               }
               return acc;
            },
            {} as Record<string, string>,
         );
      }
      if (include) {
         columns = Object.entries(columns).reduce(
            (acc, [key, value]) => {
               if (include.includes(key)) {
                  acc[key] = value;
               }
               return acc;
            },
            {} as Record<string, string>,
         );
      }
      const groups: string[] = Object.values(columns).map((column) => `[${table}].[${column}]`);
      const attributes: ProjectionAlias[] = Object.values(columns).map((column) => [
         col(`${table}.${column}`),
         column,
      ]);
      return { attributes, groups };
   });

   return result.reduce(
      (acc, { attributes, groups }) => {
         acc.attributes.push(...attributes);
         acc.groups.push(...groups);
         return acc;
      },
      { attributes: [], groups: [] } as TableColumns,
   );
};
