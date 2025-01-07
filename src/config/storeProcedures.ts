import { Sequelize } from 'sequelize';

export class StoreProcedures {
   private DBConnection: Sequelize;
   constructor(DBConnection: Sequelize) {
      this.DBConnection = DBConnection;
   }
}
