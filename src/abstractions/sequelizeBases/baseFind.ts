import { Includeable, Model, ProjectionAlias, WhereOptions, col, literal } from 'sequelize';
import { attributesBuilder } from '../../utils/transformers/attrbuteBuilder';
export const PAGE_LIMIT = 1000;
export abstract class EntityFinder<T, U, V> {
   abstract model: any;
   abstract tableName: string;
   abstract columns: V | string[];
   abstract associations: {
      model: typeof Model;
      as: U[keyof U] | string;
      attributes: string[];
      include?: {
         model: typeof Model;
         as: string;
         attributes: string[];
      }[];
   }[];

   attributesBuilder = (
      tableColumns: {
         columns: (keyof T)[] | string[];
         table: string;
         flat: boolean;
      }[],
   ): { attributes: ProjectionAlias[]; groups: string[] } => {
      const result = tableColumns.map(({ columns, table, flat }) => {
         if (flat) {
            const groups: string[] = Object.values(columns).map(
               (column) => `[${table}].[${column}]`,
            );
            const attributes: ProjectionAlias[] = Object.values(columns).map((column) => [
               col(`${table}.${column}`),
               column,
            ]);
            return { attributes, groups };
         } else {
            const groups: string[] = Object.values(columns).map(
               (column) => `[${table}].[${column}]`,
            );
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
         { attributes: [], groups: [] } as { attributes: ProjectionAlias[]; groups: string[] },
      );
   };

   attributtesBuilder(
      attributesFind: (keyof T)[],
      customAttributes?: [ReturnType<typeof literal>, string][],
      includes?: {
         association: V[keyof V] | string;
         attributes: string[];
         flat: boolean;
         include?: {
            association: string;
            attributes: string[];
            flat: boolean;
         }[];
      }[],
      customIncludes?: ProjectionAlias[],
   ): { attributes: ProjectionAlias[]; groups: string[] } {
      const attributes = this.attributesBuilder([
         { columns: attributesFind, table: this.tableName, flat: true },
      ]);

      const flatIncludes = includes?.filter((attr) => attr.flat);

      const flatAssociationsAttributes = flatIncludes?.map((include) => {
         return attributesBuilder([
            {
               columns: include.attributes,
               table: include.association as string,
               flat: include.flat,
            },
         ]);
      });

      const flatAssociationsAttributesInclude = includes
         ?.filter((inc) => inc.include)
         .map((include) => {
            return include.include?.map((attr) => {
               return attributesBuilder([
                  {
                     columns: attr.attributes,
                     table: `${include.association}->${attr.association}`,
                     flat: attr.flat,
                     optionalTable: include.association as string,
                  },
               ]);
            });
         });

      console.log({ ...flatAssociationsAttributesInclude });

      const allAttributes = {
         attributes:
            flatAssociationsAttributes && includes
               ? [
                    ...attributes.attributes,
                    ...flatAssociationsAttributes.map((attr) => attr.attributes).flat(),
                 ]
               : attributes.attributes,

         groups: flatAssociationsAttributes?.length
            ? [
                 ...attributes.groups,
                 ...flatAssociationsAttributes.map((attr) => attr.groups).flat(),
              ]
            : [...attributes.groups],
      };

      if (customIncludes) {
         allAttributes.attributes = [...allAttributes.attributes, ...customIncludes];
      }
      if (flatAssociationsAttributesInclude && flatAssociationsAttributesInclude.length > 0) {
         allAttributes.attributes = [
            ...allAttributes.attributes,
            ...flatAssociationsAttributesInclude
               .map((attr) => (attr ? attr.map((a) => a.attributes).flat() : []))
               .flat(),
         ];
      }

      if (customAttributes) {
         allAttributes.attributes = [...allAttributes.attributes, ...customAttributes];
      }
      return allAttributes;
   }

   includeBuilder(
      associations: {
         model: typeof Model;
         as: U[keyof U] | string;
         attributes: string[];
         include?: {
            model: typeof Model;
            as: string;
            attributes: string[];
         }[];
      }[],
      includes?: {
         association: V[keyof V] | string;
         attributes: string[];
         flat: boolean;
         include?: {
            association: string;
            attributes: string[];
            flat: boolean;
         }[];
      }[],
   ): Includeable[] | undefined | any {
      if (!includes) return undefined;
      return associations
         ?.filter((association) => {
            return includes?.map((include) => include.association === association.as);
         })
         .map((association) => {
            if (association.include) {
               return {
                  model: association.model,
                  attributes:
                     includes?.find((attr) => attr.association === association.as && !attr.flat)
                        ?.attributes || [],
                  as: association.as,
                  include:
                     includes?.find((attr) => attr.association === association.as)?.include || [],
               };
            } else {
               return {
                  model: association.model,
                  attributes:
                     includes?.find((attr) => attr.association === association.as && !attr.flat)
                        ?.attributes || [],
                  as: association.as,
               };
            }
         });
   }

   orderBuilder(
      defaultCol: string,
      pageNumber = 1,
      pageSize = PAGE_LIMIT,
      orderBy?: string,
      sortDesc?: boolean,
   ): [any] {
      const ITEMS_PAGE = pageSize ? pageSize : 10;
      const OFFSET = (pageNumber - 1) * ITEMS_PAGE;
      return [
         literal(
            `[${this.tableName}].[${orderBy ? orderBy : defaultCol}] ${
               sortDesc ? 'DESC' : 'ASC'
            } OFFSET ${OFFSET} ROWS FETCH NEXT ${ITEMS_PAGE} ROWS ONLY`,
         ),
      ];
   }

   async findEntity(entity_id: number): Promise<T> {
      return await this.model
         .findByPk(entity_id)
         .then((data: { get: any }) => {
            return data.get();
         })
         .catch((error: any) => {
            console.error(`Error al buscar el ${this.tableName}`, error);
            throw error;
         });
   }

   async findEntities(findOptionsRequest: {
      attributesFind: (keyof T)[];
      customAttributes?: [any, string][];
      where?: WhereOptions<T>;
      includes?: {
         association: V[keyof V];
         attributes: string[];
         flat: boolean;
         include?: {
            association: string;
            attributes: string[];
            flat: boolean;
         }[];
      }[];
      sortBy?: keyof T | string;
      sortDesc?: boolean;
      page?: number;
      pageSize?: number;
      grouped?: boolean;
      customIncludes?: ProjectionAlias[];
      transformResults?: (data: T[]) => T[];
   }): Promise<{ rows: T[]; count: number }> {
      const {
         attributesFind,
         customAttributes,
         where,
         includes,
         sortBy,
         sortDesc,
         page,
         pageSize,
         grouped,
         customIncludes,
         transformResults,
      } = findOptionsRequest;

      const allAttributes = this.attributtesBuilder(
         attributesFind,
         customAttributes,
         includes,
         customIncludes,
      );

      const include = this.includeBuilder(this.associations, includes);

      const rows = await this.model
         .findAll({
            attributes: allAttributes.attributes,
            where: where,
            include: include,
            group: grouped ? allAttributes.groups : undefined,
            order: this.orderBuilder(
               Object.values(this.columns as string[])[0],
               page,
               pageSize,
               sortBy as string,
               sortDesc,
            ),
         })
         .then((data: { get: any }[]) => data.map((item) => item.get()));

      const transformedRows = transformResults ? transformResults(rows) : rows;

      const count = grouped
         ? await this.model
              .count({
                 where: where,
                 include: include,
                 group: allAttributes.groups,
              })
              .then((data: any[]) => data.length)
         : await this.model.count({ where: where, include: include });

      return { rows: transformedRows, count };
   }
}
