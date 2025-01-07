import 'reflect-metadata';
import { Server } from './server';
import { initAllAssociations } from './dao/associations';

const server = new Server();

initAllAssociations();
server.start();
