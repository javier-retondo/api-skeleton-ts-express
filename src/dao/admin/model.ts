import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config';
import { USER } from './metadata';
import { IUser } from './interface';

type UserCreationAttributes = Optional<IUser, 'id'>;

class User extends Model<IUser, UserCreationAttributes> {}

User.init(
   {
      id: {
         type: DataTypes.INTEGER,
         primaryKey: true,
         autoIncrement: true,
      },
      user: {
         type: DataTypes.STRING(50),
         allowNull: false,
      },
      name: {
         type: DataTypes.STRING(100),
         allowNull: false,
      },
      lastname: {
         type: DataTypes.STRING(100),
         allowNull: false,
      },
      email: {
         type: DataTypes.STRING(150),
         allowNull: false,
      },
      pass: {
         type: DataTypes.STRING(255),
         allowNull: false,
      },
   },
   {
      sequelize: sequelize,
      tableName: USER.TABLE,
      timestamps: false,
      modelName: USER.SINGULAR,
      name: {
         plural: USER.PLURAL,
         singular: USER.SINGULAR,
      },
   },
);

export { User };
