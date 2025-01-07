import { IUser } from '../interface';
import { User } from '../model';
import { EntityCreator } from '../../../abstractions/sequelizeBases/baseCreate';
import { USER } from '../metadata';

class UsersCreator extends EntityCreator<IUser> {
   model = User;
   entityName = USER.SINGULAR;
}

export const usersCreator = new UsersCreator();
