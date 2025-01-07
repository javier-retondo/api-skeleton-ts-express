import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function generateAPI(name, moduleSingular, modulePlural, pathDir) {
   const crudDir = path.join(
      __dirname,
      '..',
      '..',
      'src',
      'api',
      'v1',
      pathDir,
      toLowerSnakeCase(name),
   );

   fs.mkdirSync(crudDir, { recursive: true });

   const controllerContent = generateController(moduleSingular, modulePlural, pathDir);
   fs.writeFileSync(path.join(crudDir, 'controller.ts'), controllerContent);

   const dtoContent = generateDto(moduleSingular, modulePlural);
   fs.writeFileSync(path.join(crudDir, 'dto.ts'), dtoContent);

   const middlewareContent = generateMiddleware(moduleSingular, pathDir);
   fs.writeFileSync(path.join(crudDir, 'middleware.ts'), middlewareContent);

   const routesContent = generateRoutes(
      moduleSingular,
      modulePlural,
      pathDir,
      toLowerSnakeCase(name),
   );
   fs.writeFileSync(path.join(crudDir, 'routes.ts'), routesContent);

   const serviceContent = generateService(moduleSingular, modulePlural, pathDir);
   fs.writeFileSync(path.join(crudDir, 'service.ts'), serviceContent);

   console.log(`Los servicios del módulo ${moduleSingular} se generaron con éxito en ${crudDir}`);
   exec(`npx prettier --write ${crudDir}`, (error, stdout, stderr) => {
      if (error) {
         console.error(`Hubo un error al aplicar formato: ${stderr}`);
         return;
      }
      console.log(`Archivos formateados con éxito: ${stdout}`);
   });
}

function generateController(moduleSingular, modulePlural, pathDir) {
   const lastFolder = pathDir.split('/');
   return `
      import { Request, Response } from 'express';
      import { ${capitalizeFirstLetter(modulePlural)}FilterDTO, Create${capitalizeFirstLetter(moduleSingular)}DTO, Update${capitalizeFirstLetter(moduleSingular)}DTO } from './dto';
      import { ${camellFirstLetter(moduleSingular)}Services } from './service';
      import { success, error } from '${lastFolder.map(() => '../').join('')}../../../utils/network/responses';
      import { PAGE_LIMIT } from '${lastFolder.map(() => '../').join('')}../../../abstractions/sequelizeBases/baseFind';

      export class ${capitalizeFirstLetter(moduleSingular)}Controller {
         async create${capitalizeFirstLetter(moduleSingular)}(req: Request, res: Response): Promise<void> {
            const create${capitalizeFirstLetter(moduleSingular)}DTO: Create${capitalizeFirstLetter(moduleSingular)}DTO = req.body;

            await ${camellFirstLetter(moduleSingular)}Services
               .create${capitalizeFirstLetter(moduleSingular)}(create${capitalizeFirstLetter(moduleSingular)}DTO)
               .then((body) => success({ req, res, body }))
               .catch((err) => {
                  error({ req, res, body: err });
               });
         }

         async update${capitalizeFirstLetter(moduleSingular)}(req: Request, res: Response): Promise<void> {
            const update${capitalizeFirstLetter(moduleSingular)}DTO: Update${capitalizeFirstLetter(moduleSingular)}DTO = req.body;

            await ${camellFirstLetter(moduleSingular)}Services
               .update${capitalizeFirstLetter(moduleSingular)}(update${capitalizeFirstLetter(moduleSingular)}DTO)
               .then((body) => success({ req, res, body }))
               .catch((err) => {
                  error({ req, res, body: err });
               });
         }

         async get${capitalizeFirstLetter(modulePlural)}(req: Request, res: Response): Promise<void> {
            const filter: ${capitalizeFirstLetter(modulePlural)}FilterDTO = JSON.parse(JSON.stringify(req.query));
            const { page, pageSize, sortBy, sortDesc } = filter;

            await ${camellFirstLetter(moduleSingular)}Services
               .get${capitalizeFirstLetter(modulePlural)}({ page, pageSize, sortBy, sortDesc })
               .then((body) => {
                  let pagination = {
                     page: 1,
                     limit: body.count < PAGE_LIMIT ? body.count : PAGE_LIMIT,
                     total: body.count,
                  };
                  if (page && pageSize) {
                     pagination = {
                        page: Number(page),
                        limit: Number(pageSize),
                        total: body.count,
                     };
                  }
                  success({ req, res, body: body.rows, pagination });
               })
               .catch((err) => error({ req, res, body: err }));
         }

         async get${capitalizeFirstLetter(moduleSingular)}(req: Request, res: Response): Promise<void> {    

            await ${camellFirstLetter(moduleSingular)}Services
               .get${capitalizeFirstLetter(moduleSingular)}()
               .then((body) => success({ req, res, body: body.rows[0] }))
               .catch((err) => error({ req, res, body: err }));
         }

         async delete${capitalizeFirstLetter(moduleSingular)}(req: Request, res: Response): Promise<void> {

            await ${camellFirstLetter(moduleSingular)}Services
               .softDelete${capitalizeFirstLetter(moduleSingular)}()
               .then((body) => success({ req, res, body }))
               .catch((err) => error({ req, res, body: err }));
         }         
      }
    `;
}

function generateDto(moduleSingular, modulePlural) {
   return `
      import { Type } from 'class-transformer';
      import {
         IsInt,
         IsPositive,
         IsOptional,
         IsBoolean,
         IsEnum,
      // IsBoolean, IsEnum, IsInt, IsOptional, IsPositive, IsString, etc.
      } from 'class-validator';

      export enum ${capitalizeFirstLetter(moduleSingular)}Order {
         
      }

      export class Create${capitalizeFirstLetter(moduleSingular)}DTO {
        
         // constructor() {
           
         // }
      }     
      
      export class Update${capitalizeFirstLetter(moduleSingular)}DTO {
        
         // constructor() {
          
         // }
      }     

      export class ${capitalizeFirstLetter(modulePlural)}FilterDTO {
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

         @IsEnum(${capitalizeFirstLetter(moduleSingular)}Order)
         @IsOptional()
         public sortBy: ${capitalizeFirstLetter(moduleSingular)}Order;

         @IsBoolean()
         @IsOptional()
         public sortDesc: boolean;

         constructor(
            page: number,
            pageSize: number,
            sortBy: ${capitalizeFirstLetter(moduleSingular)}Order,
            sortDesc: boolean
         ) {
            this.page = page;
            this.pageSize = pageSize;
            this.sortBy = sortBy;
            this.sortDesc = sortDesc;
         }
      }

   `;
}

function generateMiddleware(moduleSingular, pathDir) {
   const lastFolder = pathDir.split('/');
   return `
         // import { NextFunction, Request, Response } from 'express';
         import { GlobalMW } from '${lastFolder.map(() => '../').join('')}../../../middlewares/global';
         // import { error } from '${lastFolder.map(() => '../').join('')}../../../../../utils/network/responses';

         export class ${capitalizeFirstLetter(moduleSingular)}Middleware extends GlobalMW {
           
         }
   `;
}

function generateRoutes(moduleSingular, modulePlural, pathDir) {
   const lastFolder = pathDir.split('/');
   return `
      import { BaseRouter } from '${lastFolder.map(() => '../').join('')}../../../abstractions/baseRouter';
      import {${capitalizeFirstLetter(moduleSingular)}Controller } from './controller';
      import {
         ${capitalizeFirstLetter(modulePlural)}FilterDTO,
         Create${capitalizeFirstLetter(moduleSingular)}DTO,        
         Update${capitalizeFirstLetter(moduleSingular)}DTO,
      } from './dto';
      import { ${capitalizeFirstLetter(moduleSingular)}Middleware } from './middleware';

      const ${toSnakeCase(moduleSingular)}_ROUTES = {
         SINGULAR: '/${pathDir}/${moduleSingular.toLowerCase()}',
         PLURAL: '/${pathDir}/${modulePlural.toLowerCase()}',
      };

      export class ${capitalizeFirstLetter(moduleSingular)}Router extends BaseRouter<
        ${capitalizeFirstLetter(moduleSingular)}Controller,
         ${capitalizeFirstLetter(moduleSingular)}Middleware,
         typeof ${toSnakeCase(moduleSingular)}_ROUTES
      > {
         constructor() {
            super(${capitalizeFirstLetter(moduleSingular)}Controller, ${capitalizeFirstLetter(moduleSingular)}Middleware, ${toSnakeCase(moduleSingular)}_ROUTES);
         }

         routes() {
            this.router
               .get(
                  this.routesNames.SINGULAR + '/:Id', // cambiar por el id correspondiente al modelo
                  this.middleware.verifyToken,
                  // validar id
                  this.controller.get${capitalizeFirstLetter(moduleSingular)},
               )
               .get(
                  this.routesNames.PLURAL,
                  this.middleware.verifyToken,
                  this.middleware.validationMiddleware(${capitalizeFirstLetter(modulePlural)}FilterDTO, 'query'),
                  this.controller.get${capitalizeFirstLetter(modulePlural)},
               )
               .post(
                  this.routesNames.SINGULAR,
                  this.middleware.verifyToken,
                  this.middleware.validationMiddleware(Create${capitalizeFirstLetter(moduleSingular)}DTO, 'body'),
                  this.controller.create${capitalizeFirstLetter(moduleSingular)},
               )              
               .put(
                  this.routesNames.SINGULAR + '/:Id', // cambiar por el id correspondiente al modelo
                  this.middleware.verifyToken,
                  // validar id
                  this.middleware.validationMiddleware(Update${capitalizeFirstLetter(moduleSingular)}DTO, 'body'),
                  this.controller.update${capitalizeFirstLetter(moduleSingular)},
               )               
               .delete(
                  this.routesNames.SINGULAR + '/:Id', // cambiar por el id correspondiente al modelo
                  this.middleware.verifyToken,
                  // validar id
                  this.controller.delete${capitalizeFirstLetter(moduleSingular)},
               );
         }
      }

   `;
}

function generateService(moduleSingular, modulePlural, pathDir) {
   const lastFolder = pathDir.split('/');
   return `
      import { sequelize } from '${lastFolder.map(() => '../').join('')}../../../config';
      import { ${capitalizeFirstLetter(modulePlural)}FilterDTO, Create${capitalizeFirstLetter(moduleSingular)}DTO, Update${capitalizeFirstLetter(moduleSingular)}DTO } from './dto';

      class ${capitalizeFirstLetter(moduleSingular)}Services {
         private async handleTransaction<T>(operation: (transaction: any) => Promise<T>): Promise<T> {
            const transaction = await sequelize.transaction();
            const result = await operation(transaction);
            await transaction.commit();
            return result;
         }

         async create${capitalizeFirstLetter(moduleSingular)}(create${capitalizeFirstLetter(moduleSingular)}DTO: Create${capitalizeFirstLetter(moduleSingular)}DTO) {
            console.log('create${capitalizeFirstLetter(moduleSingular)}', create${capitalizeFirstLetter(moduleSingular)}DTO);
            return this.handleTransaction(async (transaction) => {
               console.log(transaction);
               return 'create${capitalizeFirstLetter(moduleSingular)}';
            });
         }

         async update${capitalizeFirstLetter(moduleSingular)}(update${capitalizeFirstLetter(moduleSingular)}DTO: Update${capitalizeFirstLetter(moduleSingular)}DTO) {
            console.log('update${capitalizeFirstLetter(moduleSingular)}', update${capitalizeFirstLetter(moduleSingular)}DTO);
            return this.handleTransaction(async (transaction) => {
               console.log(transaction);
               return 'update${capitalizeFirstLetter(moduleSingular)}';
            });
         }

         async get${capitalizeFirstLetter(modulePlural)}(${capitalizeFirstLetter(modulePlural)}FilterDTO: ${capitalizeFirstLetter(modulePlural)}FilterDTO) {
            //  const { page, pageSize, sortBy, sortDesc } = ${capitalizeFirstLetter(modulePlural)}FilterDTO;
            console.log('get${capitalizeFirstLetter(modulePlural)}', ${capitalizeFirstLetter(modulePlural)}FilterDTO);
            return {
               count: 1,
               rows: ['get${capitalizeFirstLetter(modulePlural)}'],
            };
         }

         async get${capitalizeFirstLetter(moduleSingular)}() {
            return {
               rows: ['get${capitalizeFirstLetter(moduleSingular)}'],
            };
         }

         async softDelete${capitalizeFirstLetter(moduleSingular)}() {
            return this.handleTransaction(async (transaction) => {
               console.log(transaction);
               return 'softDelete${capitalizeFirstLetter(moduleSingular)}';
            });
         }
      }

      const ${moduleSingular}Services = new ${capitalizeFirstLetter(moduleSingular)}Services();
      export { ${moduleSingular}Services };
   `;
}

function capitalizeFirstLetter(string) {
   return string.charAt(0).toUpperCase() + string.slice(1);
}

function camellFirstLetter(string) {
   return string.charAt(0).toLowerCase() + string.slice(1);
}

function toSnakeCase(string) {
   return string
      .replace(/([A-Z])/g, '_$1')
      .toUpperCase()
      .replace(/^_/, '');
}

function toLowerSnakeCase(string) {
   return string
      .replace(/([A-Z])/g, '_$1')
      .toLowerCase()
      .replace(/^_/, '');
}

export default generateAPI;
