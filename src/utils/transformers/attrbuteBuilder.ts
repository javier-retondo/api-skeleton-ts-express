import { ProjectionAlias, col } from 'sequelize';

type TableColumns = {
   attributes: ProjectionAlias[];
   groups: string[];
};
export const attributesBuilder = (
   tableColumns: {
      columns: string[];
      table: string;
      flat: boolean;
      optionalTable?: string;
   }[],
): TableColumns => {
   const result = tableColumns.map(({ columns, table, flat, optionalTable }) => {
      if (flat) {
         const groups: string[] = Object.values(columns).map((column) => `[${table}].[${column}]`);
         const attributes: ProjectionAlias[] = Object.values(columns).map((column) => [
            col(`${table}.${column}`),
            optionalTable ? `[${optionalTable}->${column}]` : column,
         ]);
         return { attributes, groups };
      } else {
         const groups: string[] = Object.values(columns).map((column) => `[${table}].[${column}]`);
         const attributes: ProjectionAlias[] = Object.values(columns).map((column) => [
            col(`${table}.${column}`),
            `[${table}].[${column}]`,
         ]);
         return { attributes, groups };
      }
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
