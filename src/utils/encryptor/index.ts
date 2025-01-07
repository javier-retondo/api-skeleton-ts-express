import crypto from 'crypto';
import { ConfigServer } from '../../config';

const secretKey = crypto
   .createHash('sha256')
   .update(ConfigServer.prototype.secretKey || 'secretKey')
   .digest('base64')
   .substring(0, 32);

export function encrypt(text: string): { encryptedData: string; iv: Buffer } {
   const iv = crypto.randomBytes(16);
   const cipher = crypto.createCipheriv('aes-256-cbc', secretKey, iv);
   let encrypted = cipher.update(text, 'utf8', 'hex');
   encrypted += cipher.final('hex');
   return { encryptedData: encrypted, iv };
}

export function decrypt(encryptedText: string, iv: Buffer): string {
   try {
      const secretKey = crypto
         .createHash('sha256')
         .update(ConfigServer.prototype.secretKey || 'secretKey')
         .digest('base64')
         .substring(0, 32);
      const decipher = crypto.createDecipheriv('aes-256-cbc', secretKey, iv);
      let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
   } catch (error) {
      console.error('Error al desencriptar:', error);
      return '';
   }
}
