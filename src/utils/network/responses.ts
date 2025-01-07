import { NextFunction, Request, Response } from 'express';
import fs from 'fs';
class Responses {
   success = (props: {
      req: Request;
      res: Response;
      status?: number;
      body?: any;
      pagination?: { page: number; limit: number; total: number };
   }) => {
      const { pagination } = props;
      if (pagination) {
         const page = Number(pagination.page);
         const limit = Number(pagination.limit);
         const total = Number(pagination.total);
         const totalPages = Math.ceil(total / limit);
         props.res.status(props.status || 200).send({
            error: false,
            status: props.status || 200,
            body: props.body || '',
            pagination: {
               totalCount: total,
               pageCount: limit,
               currentPage: page,
               totalPages: Math.ceil(total / limit),
               previousPage: page - 1 < 1 ? 1 : page - 1,
               nextPage: page + 1 > totalPages ? totalPages : page + 1,
            },
         });
      } else {
         props.res.status(props.status || 200).send({
            error: false,
            status: props.status || 200,
            body: props.body || '',
         });
      }
   };

   error = (props: {
      req: Request;
      res: Response;
      status?: number;
      body?: any;
      next?: NextFunction;
   }) => {
      props.res.status(props.status || 500).send({
         error: true,
         status: props.status || 500,
         body: !props.status || props.status === 500 ? String(props.body) : props.body || '',
      });
   };

   file = (props: {
      req: Request;
      res: Response;
      filePath: string;
      contentType: string;
      fileName: string;
      data?: object;
   }) => {
      const { res, filePath, contentType, fileName, data } = props;
      const file = fs.createReadStream(filePath);
      const stat = fs.statSync(filePath);
      data && res.setHeader('dataJson', JSON.stringify(data));
      res.setHeader('Content-Length', stat.size);
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', 'attachment; filename=' + fileName);
      file.pipe(res);
   };
}

export const { success, error, file } = new Responses();
