import { IUser, IUserAssociations, IUserColumnsAliases } from '../interface';
import { User } from '../model';
import { USER } from '../metadata';
import { EntityFinder } from '../../../abstractions/sequelizeBases/baseFind';
import { userIncludes } from '../includes';

class UsersFinder extends EntityFinder<IUser, IUserAssociations, IUserColumnsAliases> {
   model = User;
   tableName = USER.TABLE;
   columns = USER.COLUMNS;
   associations = userIncludes;
}
export const usersFinder = new UsersFinder();
