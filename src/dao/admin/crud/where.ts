import { WhereOptions } from 'sequelize';
import { EntityQueryBuilder } from '../../../abstractions/sequelizeBases/baseWhere';
import { IUser, IUserColumnsAliases } from '../interface';

export class UserWhere extends EntityQueryBuilder<IUser> {
   columns: (keyof IUser)[];
   tableName: string;
   where: WhereOptions<IUser> = [];
   constructor(columns: IUserColumnsAliases, tableName: string) {
      super();
      this.tableName = tableName;
      this.columns = Object.values(columns);
   }
}
