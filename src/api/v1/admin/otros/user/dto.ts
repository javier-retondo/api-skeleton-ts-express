import { Type } from 'class-transformer';
import {
   IsInt,
   IsPositive,
   IsOptional,
   IsBoolean,
   IsEnum,
   // IsBoolean, IsEnum, IsInt, IsOptional, IsPositive, IsString, etc.
} from 'class-validator';

export enum UserOrder {}

export class CreateUserDTO {
   // constructor() {
   // }
}

export class UpdateUserDTO {
   // constructor() {
   // }
}

export class UsersFilterDTO {
   @IsInt()
   @IsPositive()
   @IsOptional()
   @Type(() => Number)
   public page: number;

   @IsInt()
   @IsPositive()
   @IsOptional()
   @Type(() => Number)
   public pageSize: number;

   @IsEnum(UserOrder)
   @IsOptional()
   public sortBy: UserOrder;

   @IsBoolean()
   @IsOptional()
   public sortDesc: boolean;

   constructor(page: number, pageSize: number, sortBy: UserOrder, sortDesc: boolean) {
      this.page = page;
      this.pageSize = pageSize;
      this.sortBy = sortBy;
      this.sortDesc = sortDesc;
   }
}
