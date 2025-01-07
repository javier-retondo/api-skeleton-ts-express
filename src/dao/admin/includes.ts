import { IUserAssociations } from './interface';

export const userIncludes: {
   model: any;
   as: IUserAssociations[keyof IUserAssociations];
   attributes: string[];
   include?: {
      model: any;
      as: string;
      attributes: string[];
   }[];
}[] = [];
