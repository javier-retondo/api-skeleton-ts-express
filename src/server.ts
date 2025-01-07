import express, { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import path from 'path';
import morgan from 'morgan';
import cors from 'cors';
import swaggerUi_admin from 'swagger-ui-express';
import swaggerUi_public from 'swagger-ui-express';
import { ConfigServer, sequelize } from './config';
import { error } from './utils/network/responses';
import { UserRouter } from './api/v1/admin/otros/user/routes';

const staticFolderPath = path.join('public');

export class Server extends ConfigServer {
   public app: express.Application;
   public port: number = this.getNumberEnvironment('PORT');

   constructor() {
      super();
      this.app = express();
      this.handleConn();
      this.config();
      this.routes();
   }

   config() {
      this.app.use(morgan('dev'));
      this.app.use(cors());
      this.app.set('view engine', 'ejs');
      this.app.set('views', path.join('templates'));
      this.app.use(express.json({ limit: '10mb' }));
      this.app.use(express.urlencoded({ extended: false }));
   }
   routes() {
      this.app.use('/static', express.static(staticFolderPath));
      this.app.use('/api/v1', this.routers_v1());
      this.app.use(
         '/api/v1/documentation/admin',
         swaggerUi_admin.serveFiles(require(path.join('..', 'documentation', 'admin.json')), {}),
         swaggerUi_admin.setup(require(path.join('..', 'documentation', 'admin.json'))),
      );
      this.app.use(
         '/api/v1/documentation/public',
         swaggerUi_public.serveFiles(require(path.join('..', 'documentation', 'public.json'))),
         swaggerUi_public.setup(require(path.join('..', 'documentation', 'public.json'))),
      );
      this.app.use((err: ErrorRequestHandler, req: Request, res: Response, next: NextFunction) =>
         error({ req, res, body: err.toString(), status: 500, next }),
      );
      this.app.use('*', (req, res) => {
         res.status(404).sendFile(path.join(staticFolderPath, 'pages', 'error404.html'));
      });
   }

   routers_v1(): express.Router[] {
      return [new UserRouter().router];
   }

   handleConn = async () => {
      try {
         await sequelize.authenticate();
         console.log('Base de datos conectada con éxito!');
      } catch (error) {
         console.error('No se ha podido conectar a la base de datos. Error:', error);
      }
   };

   start() {
      this.app.listen(this.port, () => {
         console.log('Servidor corriendo en el puerto: ', this.port);
      });
   }
}
