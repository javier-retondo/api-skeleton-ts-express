import { sequelize } from '../../../../../config';
import { UsersFilterDTO, CreateUserDTO, UpdateUserDTO } from './dto';

class UserServices {
   private async handleTransaction<T>(operation: (transaction: any) => Promise<T>): Promise<T> {
      const transaction = await sequelize.transaction();
      const result = await operation(transaction);
      await transaction.commit();
      return result;
   }

   async createUser(createUserDTO: CreateUserDTO) {
      console.log('createUser', createUserDTO);
      return this.handleTransaction(async (transaction) => {
         console.log(transaction);
         return 'createUser';
      });
   }

   async updateUser(updateUserDTO: UpdateUserDTO) {
      console.log('updateUser', updateUserDTO);
      return this.handleTransaction(async (transaction) => {
         console.log(transaction);
         return 'updateUser';
      });
   }

   async getUsers(UsersFilterDTO: UsersFilterDTO) {
      //  const { page, pageSize, sortBy, sortDesc } = UsersFilterDTO;
      console.log('getUsers', UsersFilterDTO);
      return {
         count: 1,
         rows: ['getUsers'],
      };
   }

   async getUser() {
      return {
         rows: ['getUser'],
      };
   }

   async softDeleteUser() {
      return this.handleTransaction(async (transaction) => {
         console.log(transaction);
         return 'softDeleteUser';
      });
   }
}

const userServices = new UserServices();
export { userServices };
