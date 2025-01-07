import { NextFunction, Request, Response } from 'express';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { error } from '../utils/network/responses';
import fs from 'fs';
import path from 'path';
import { redisClient } from '../config';
import { validationResult } from 'express-validator';

export class GlobalMW {
   async verifyToken(req: Request, res: Response, next: NextFunction) {
      try {
         next();
      } catch (error) {
         console.log('Token no válido - Usuario inexistente/inactivo o token expirado');
         res.status(401).json({
            error: true,
            status: 401,
            body: 'Token no válido - Usuario inexistente/inactivo o token expirado',
         });
      }
   }

   fieldsValidator(req: Request, res: Response, next: NextFunction) {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
         if (req.file) {
            const file: Express.Multer.File = req.file;
            fs.unlinkSync(path.join(file.destination, file.filename));
         }
         if (req.files) {
            const files: Express.Multer.File[] = Array.isArray(req.files)
               ? req.files.flat()
               : Object.values(req.files).flat();
            for (let i = 0; i < files.length; i++) {
               fs.unlinkSync(path.join(files[i].destination, files[i].filename));
            }
         }
         console.log('Error en los campos enviados', errors);
         return error({ req, res, body: errors, status: 400 });
      }
      next();
   }

   responseCachedStaticData = async (req: Request, res: Response, next: () => void) => {
      const key = req.originalUrl || req.url;

      const cachedData = await redisClient.get(key);
      if (cachedData) {
         const parsedData = JSON.parse(cachedData);
         console.log('---------------------------------');
         console.log('Cacheado:');
         console.log('Ruta: ', key);
         console.log('---------------------------------');
         return res
            .header({
               'Content-Type': 'application/json',
               'Cache-Control': 'public, max-age=3600',
            })
            .status(200)
            .send(parsedData);
      }

      const originalSend = res.send.bind(res);

      res.send = (body: any): Response<any> => {
         redisClient.set(key, JSON.stringify(body), 3600);
         return originalSend(body);
      };

      next();
   };

   validationMiddleware(
      type: any,
      target: 'body' | 'query' | 'params',
   ): (req: Request, res: Response, next: NextFunction) => Promise<void> {
      return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
         const errors: {
            target: 'body' | 'query' | 'params';
            error: {
               property: string;
               constraints: any;
            }[];
         }[] = [];
         if (target === 'body') {
            const dto: typeof type = plainToInstance(type, req.body);
            const bodyErrors = await validate(dto);
            bodyErrors.length > 0 &&
               errors.push({
                  target: 'body',
                  error: bodyErrors.map((err) => {
                     return {
                        property: err.property,
                        constraints: err.constraints,
                     };
                  }),
               });
            req.body = dto;
         }
         if (target === 'query') {
            const dto: typeof type = plainToInstance(type, req.query);
            const queryErrors = await validate(dto);
            queryErrors.length > 0 &&
               errors.push({
                  target: 'query',
                  error: queryErrors.map((err) => {
                     return {
                        property: err.property,
                        constraints: err.constraints,
                     };
                  }),
               });
            req.query = dto;
         }
         if (target === 'params') {
            const dto: typeof type = plainToInstance(type, req.params);
            const paramsErrors = await validate(dto);
            paramsErrors.length > 0 &&
               errors.push({
                  target: 'params',
                  error: paramsErrors.map((err) => {
                     return {
                        property: err.property,
                        constraints: err.constraints,
                     };
                  }),
               });
            req.params = dto;
         }

         if (errors.length > 0) {
            error({ req, res, body: errors, status: 400 });
         } else {
            next();
         }
      };
   }
}
