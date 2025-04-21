import { Request } from 'express';

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id_utente: number;
      id_studio: number;
      ruolo: string;
    };
  }
}
