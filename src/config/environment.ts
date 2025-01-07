import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({
   path: path.join(__dirname, '..', '..', '.env'),
});

export abstract class ConfigServer {
   public getEnvironment(env: string) {
      return process.env[env];
   }
   public getNumberEnvironment(env: string): number {
      return Number(this.getEnvironment(env));
   }
   public get nodeEnv() {
      return this.getEnvironment('NODE_ENV');
   }
   public get secretKey() {
      return this.getEnvironment('SECRET_KEY');
   }
   public get dbConnection() {
      return {
         database: this.getEnvironment('MYSQL_DATABASE'),
         user: this.getEnvironment('MYSQL_USER'),
         password: this.getEnvironment('MYSQL_PASS'),
         host: this.getEnvironment('MYSQL_HOST'),
         port: this.getNumberEnvironment('MYSQL_PORT'),
      };
   }
   public get redis() {
      return {
         host: this.getEnvironment('REDIS_HOST'),
         port: this.getNumberEnvironment('REDIS_PORT'),
         password: this.getEnvironment('REDIS_PASSWORD'),
         database: this.getNumberEnvironment('REDIS_DATABASE'),
      };
   }
}
