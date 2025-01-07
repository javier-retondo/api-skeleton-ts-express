import { createClient, RedisClientType } from 'redis';
import { ConfigServer } from './environment';

class RedisManager {
    private client: RedisClientType;

    constructor() {
        this.client = createClient({
            password: ConfigServer.prototype.redis.password || "",
            database: ConfigServer.prototype.redis.database || 0,
            socket: {
                port: Number(ConfigServer.prototype.redis.port) || 6379,
                host: ConfigServer.prototype.redis.host || "127.0.0.1",
                family: 4
            }
        });

        this.client.connect();
        this.client.on('error', (err) => {
            console.error(`Error en la conexión a Redis: ${err}`);
        });
    }

    public async set(key: string, value: string, expitarion: number): Promise<string | null> {
        return await this.client.set(key, value, {
            EX: expitarion
        });
    }

    public async get(key: string): Promise<string | null> {
        return await this.client.get(key);
    }

    public async del(key: string): Promise<number> {
        return await this.client.del(key);
    }

    public async flushall(): Promise<string> {
        return await this.client.flushAll();
    }
}

export default RedisManager;