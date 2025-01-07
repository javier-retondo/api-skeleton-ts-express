import { Request, Response } from 'express';
import { UsersFilterDTO, CreateUserDTO, UpdateUserDTO } from './dto';
import { userServices } from './service';
import { success, error } from '../../../../../utils/network/responses';
import { PAGE_LIMIT } from '../../../../../abstractions/sequelizeBases/baseFind';

export class UserController {
   async createUser(req: Request, res: Response): Promise<void> {
      const createUserDTO: CreateUserDTO = req.body;

      await userServices
         .createUser(createUserDTO)
         .then((body) => success({ req, res, body }))
         .catch((err) => {
            error({ req, res, body: err });
         });
   }

   async updateUser(req: Request, res: Response): Promise<void> {
      const updateUserDTO: UpdateUserDTO = req.body;

      await userServices
         .updateUser(updateUserDTO)
         .then((body) => success({ req, res, body }))
         .catch((err) => {
            error({ req, res, body: err });
         });
   }

   async getUsers(req: Request, res: Response): Promise<void> {
      const filter: UsersFilterDTO = JSON.parse(JSON.stringify(req.query));
      const { page, pageSize, sortBy, sortDesc } = filter;

      await userServices
         .getUsers({ page, pageSize, sortBy, sortDesc })
         .then((body) => {
            let pagination = {
               page: 1,
               limit: body.count < PAGE_LIMIT ? body.count : PAGE_LIMIT,
               total: body.count,
            };
            if (page && pageSize) {
               pagination = {
                  page: Number(page),
                  limit: Number(pageSize),
                  total: body.count,
               };
            }
            success({ req, res, body: body.rows, pagination });
         })
         .catch((err) => error({ req, res, body: err }));
   }

   async getUser(req: Request, res: Response): Promise<void> {
      await userServices
         .getUser()
         .then((body) => success({ req, res, body: body.rows[0] }))
         .catch((err) => error({ req, res, body: err }));
   }

   async deleteUser(req: Request, res: Response): Promise<void> {
      await userServices
         .softDeleteUser()
         .then((body) => success({ req, res, body }))
         .catch((err) => error({ req, res, body: err }));
   }
}
