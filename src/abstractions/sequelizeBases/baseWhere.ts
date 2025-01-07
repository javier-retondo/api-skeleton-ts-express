import { Op, WhereOptions } from 'sequelize';
type OpTypes = (typeof Op)[keyof typeof Op];
export abstract class EntityQueryBuilder<T> {
   abstract tableName: string;
   abstract columns: (keyof T)[];
   abstract where: WhereOptions<T> | any;
   addCondition(key: keyof T | string, value: any, operator?: OpTypes): void {
      if (value !== undefined && value !== null) {
         this.where = [
            ...this.where,
            operator
               ? {
                    [key]: { [operator]: value },
                 }
               : {
                    [key]: value,
                 },
         ];
      }
   }

   addDateRangeCondition(
      fromKey: keyof T,
      toKey: keyof T,
      fromDate: Date | undefined,
      toDate: Date | undefined,
   ): void {
      if (fromDate && toDate) {
         this.where = [
            ...this.where,
            {
               [Op.or]: [
                  {
                     [Op.and]: [
                        { [fromKey]: { [Op.lte]: fromDate } },
                        { [toKey]: { [Op.gte]: fromDate } },
                     ],
                  },
                  {
                     [Op.and]: [
                        { [fromKey]: { [Op.lte]: toDate } },
                        { [toKey]: { [Op.gte]: toDate } },
                     ],
                  },
               ],
            },
         ];
      } else if (fromDate) {
         this.where = [
            ...this.where,
            {
               [fromKey]: { [Op.lte]: fromDate },
            },
         ];
      } else if (toDate) {
         this.where = [
            ...this.where,
            {
               [toKey]: { [Op.gte]: toDate },
            },
         ];
      }
      return this.where;
   }
}
