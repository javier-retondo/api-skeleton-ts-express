import multer, { Multer } from 'multer';
import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { error } from '../utils/network/responses';

class FileUploader {
   private storage: Multer;
   private folderDest: string;
   private fileType?: string;
   constructor(folderDest: string, fileType?: string) {
      this.fileType = fileType || undefined;
      this.folderDest = folderDest || 'uploads/';
      this.storage = multer({
         storage: multer.diskStorage({
            destination: (req, file, callback) => {
               callback(null, this.folderDest);
            },
            filename: (req, file, callback) => {
               const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
               callback(
                  null,
                  file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname),
               );
            },
         }),
      });
   }

   singleUpload(fieldName: string) {
      return (req: Request, res: Response, next: NextFunction) => {
         if (!fs.existsSync(this.folderDest)) {
            fs.mkdir(this.folderDest, (error) => {
               if (error) {
                  console.error(`Error al crear el directorio: ${error}`);
                  throw new Error(`Error al crear el directorio: ${error}`);
               } else {
                  console.log(`El directorio '${this.folderDest}' se ha creado exitosamente.`);
               }
            });
         }

         this.storage.single(fieldName)(req, res, (err: string) => {
            const file: any = req.file;
            if (!this.checkType(file, this.fileType)) {
               fs.unlinkSync(file.path);
               return error({
                  req,
                  res,
                  body: `El archivo no es del tipo correcto. El archivo debe ser de tipo: ${this.fileType}`,
                  status: 400,
               });
            }
            if (err) {
               console.error('Error de carga de archivo:', err);
               return error({
                  req,
                  res,
                  body: 'Error al cargar el archivo. Error: ' + err.toString(),
                  status: 500,
               });
            }
            next();
         });
      };
   }

   multipleUpload(fieldName: string, maxCount: number) {
      return (req: Request, res: Response, next: NextFunction) => {
         if (!fs.existsSync(this.folderDest)) {
            fs.mkdir(this.folderDest, (error) => {
               if (error) {
                  console.error(`Error al crear el directorio: ${error}`);
                  throw new Error(`Error al crear el directorio: ${error}`);
               } else {
                  console.log(`El directorio '${this.folderDest}' se ha creado exitosamente.`);
               }
            });
         }
         this.storage.array(fieldName, maxCount)(req, res, (err: string) => {
            const files: any = req.files;
            let isBadFormat = false;
            files?.forEach((file: any) => {
               if (!this.checkType(file, this.fileType)) {
                  isBadFormat = true;
               }
            });
            if (isBadFormat && files) {
               files.forEach((file: any) => {
                  fs.unlinkSync(file.path);
               });
               return error({
                  req,
                  res,
                  body: `Uno de los archivos no es del formato correcto. El archivo debe ser de tipo: ${this.fileType}`,
                  status: 400,
               });
            }
            if (err) {
               console.error('Error de carga de los archivos:', err);
               return error({ req, res, body: 'Error al cargar los archivos', status: 500 });
            }
            next();
         });
      };
   }

   private checkType(file?: Express.Multer.File, fileType?: string): boolean {
      if (!fileType || !file) {
         return true;
      }
      return file.mimetype.includes(fileType);
   }
}

export default FileUploader;
