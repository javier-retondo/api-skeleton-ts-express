import { IUser } from '../interface';
import { User } from '../model';
import { USER } from '../metadata';
import { EntityPatcher } from '../../../abstractions/sequelizeBases/basePatch';

class UsersPatcher extends EntityPatcher<IUser> {
   model = User;
   entityName = USER.SINGULAR;
}

export const usersPatcher = new UsersPatcher();
