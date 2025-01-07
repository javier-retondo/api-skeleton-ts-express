import { Transaction } from 'sequelize';

export abstract class EntityCreator<T> {
   abstract model: any;
   abstract entityName: string;

   async createEntities(entities: T[], transaction?: Transaction): Promise<T[]> {
      if (entities.length > 0) {
         return await this.model
            .bulkCreate(entities, { transaction })
            .then((data: any) => {
               return data.map((item: any) => item.get());
            })
            .catch(async (error: any) => {
               if (transaction) await transaction.rollback();
               console.error(`Error al crear los ${this.entityName}s`, error);
               throw error;
            });
      } else {
         return await this.model
            .create(entities[0], { transaction })
            .then((data: any) => {
               return [data.get()];
            })
            .catch(async (error: any) => {
               if (transaction) await transaction.rollback();
               console.error(`Error al crear el ${this.entityName}`, error);
               throw error;
            });
      }
   }
}
