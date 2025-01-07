import { Transaction } from 'sequelize';

export abstract class EntityPatcher<T> {
   abstract model: any;
   abstract entityName: string;

   async patchEntities(entities: Partial<T>[], transaction?: Transaction): Promise<T[]> {
      const patchPromises = entities.map(async (partialEntity) => {
         const id = (partialEntity as any).id;
         if (!id) {
            throw new Error(
               `La entidad ${this.entityName} no tiene id. Es requerido para la modificación parcial`,
            );
         }

         return this.model
            .update(partialEntity, { where: { id }, transaction })
            .then(() => {
               return this.model.findByPk(id, { transaction });
            })
            .then((patchedEntity: any) => {
               return patchedEntity.get();
            })
            .catch(async (error: any) => {
               if (transaction) await transaction.rollback();
               console.error(
                  `Hubo un error al querer modificar parcialmente a ${this.entityName} con id ${id}`,
                  error,
               );
               throw error;
            });
      });

      return Promise.all(patchPromises);
   }
}
