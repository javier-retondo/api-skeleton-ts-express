import { IMetadata } from '../../utils/interfaces/general';
import { IUserAssociations, IUserColumnsAliases } from './interface';

export const USER: IMetadata<IUserColumnsAliases, IUserAssociations> = {
   TABLE: 'user',
   COLUMNS: {
      ID: 'id',
      USER: 'user',
      NAME: 'name',
      LASTNAME: 'lastname',
      EMAIL: 'email',
      PASS: 'pass',
   },
   PLURAL: 'Users',
   SINGULAR: 'User',
   ASSOCIATIONS: {},
};
