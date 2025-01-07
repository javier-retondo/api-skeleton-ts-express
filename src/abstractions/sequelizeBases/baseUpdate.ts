import { Transaction, WhereOptions } from 'sequelize';

export abstract class EntityUpdater<T> {
   abstract model: any;
   abstract entityName: string;

   async updateEntities(
      entity: Partial<T>,
      where: WhereOptions<T>,
      transaction?: Transaction,
   ): Promise<T[]> {
      return this.model
         .update(entity, { where, transaction })
         .then(() => {
            return this.model.findAll({ where, transaction });
         })
         .catch(async (error: any) => {
            if (transaction) await transaction.rollback();
            console.error(
               `Hubo un error al modificar ${this.entityName}, controle los datos de entrada.`,
               error,
            );
            throw error;
         });
   }
}
