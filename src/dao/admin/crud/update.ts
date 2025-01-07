import { IUser } from '../interface';
import { User } from '../model';
import { USER } from '../metadata';
import { EntityUpdater } from '../../../abstractions/sequelizeBases/baseUpdate';

class UsersUpdater extends EntityUpdater<IUser> {
   model = User;
   entityName = USER.SINGULAR;
}

export const usersUpdater = new UsersUpdater();
