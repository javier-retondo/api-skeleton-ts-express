export type IUser = {
   id?: number;
   user?: string;
   name?: string;
   lastname?: string;
   email?: string;
   pass?: string;
};

type UserColumnAliasKeys = 'ID' | 'USER' | 'NAME' | 'LASTNAME' | 'EMAIL' | 'PASS';
export type IUserColumnsAliases = {
   [key in UserColumnAliasKeys]: keyof IUser;
};

export type IUserAssociations = object;
