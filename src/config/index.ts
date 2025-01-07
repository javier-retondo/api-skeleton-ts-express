import { sequelize } from './database';
import { ConfigServer } from './environment';
import { StoreProcedures } from './storeProcedures';
import RedisClient from './redisManager';

const storeProcedures = new StoreProcedures(sequelize)
const redisClient = new RedisClient()

export {
    sequelize,
    ConfigServer,
    storeProcedures,
    redisClient
}