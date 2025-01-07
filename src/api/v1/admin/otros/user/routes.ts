import { BaseRouter } from '../../../../../abstractions/baseRouter';
import { UserController } from './controller';
import { UsersFilterDTO, CreateUserDTO, UpdateUserDTO } from './dto';
import { UserMiddleware } from './middleware';

const USER_ROUTES = {
   SINGULAR: '/admin/otros/user',
   PLURAL: '/admin/otros/users',
};

export class UserRouter extends BaseRouter<UserController, UserMiddleware, typeof USER_ROUTES> {
   constructor() {
      super(UserController, UserMiddleware, USER_ROUTES);
   }

   routes() {
      this.router
         .get(
            this.routesNames.SINGULAR + '/:Id', // cambiar por el id correspondiente al modelo
            this.middleware.verifyToken,
            // validar id
            this.controller.getUser,
         )
         .get(
            this.routesNames.PLURAL,
            this.middleware.verifyToken,
            this.middleware.validationMiddleware(UsersFilterDTO, 'query'),
            this.controller.getUsers,
         )
         .post(
            this.routesNames.SINGULAR,
            this.middleware.verifyToken,
            this.middleware.validationMiddleware(CreateUserDTO, 'body'),
            this.controller.createUser,
         )
         .put(
            this.routesNames.SINGULAR + '/:Id', // cambiar por el id correspondiente al modelo
            this.middleware.verifyToken,
            // validar id
            this.middleware.validationMiddleware(UpdateUserDTO, 'body'),
            this.controller.updateUser,
         )
         .delete(
            this.routesNames.SINGULAR + '/:Id', // cambiar por el id correspondiente al modelo
            this.middleware.verifyToken,
            // validar id
            this.controller.deleteUser,
         );
   }
}
