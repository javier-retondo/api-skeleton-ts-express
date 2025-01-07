import { User } from '../model';
import { EntityDeleter } from '../../../abstractions/sequelizeBases/baseDelete';
import { USER } from '../metadata';

class UsersDeleter extends EntityDeleter {
   model = User;
   entityName = USER.SINGULAR;
}

export const usersDeleter = new UsersDeleter();
