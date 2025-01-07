import wkhtmltopdf from 'wkhtmltopdf';
import fs from 'fs';

export const makePDFFromHTML = async (html: string, nombreArchivo: string, notDelete?: boolean) => {
   return await new Promise((resolve) => {
      wkhtmltopdf(html, { output: nombreArchivo }, (err) => {
         if (err) {
            throw new Error(err.message);
         }
         if (!notDelete) {
            setTimeout(() => {
               fs.unlinkSync(nombreArchivo);
            }, 1500);
         }
         resolve(nombreArchivo);
      }).pipe(fs.createWriteStream(nombreArchivo));
   });
};
