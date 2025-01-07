import { Transaction } from 'sequelize';

export abstract class EntityDeleter {
   abstract model: any;
   abstract entityName: string;

   async deleteEntities(ids: number[], transaction?: Transaction): Promise<void> {
      const deletePromises = ids.map(async (id) => {
         return this.model
            .destroy({ where: { id }, transaction })
            .then((deletedCount: number) => {
               if (deletedCount === 0) {
                  throw new Error(
                     `No se pudo eliminar la entidad ${this.entityName} con id ${id}. No se encontró el Id.`,
                  );
               }
            })
            .catch(async (error: any) => {
               if (transaction) await transaction.rollback();
               console.error(
                  `Hubo un error al eliminar la entidad ${this.entityName} con id ${id}`,
                  error,
               );
               throw error;
            });
      });

      return Promise.all(deletePromises).then(() => {});
   }
}
