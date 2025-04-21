import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ errore: 'Token mancante o non valido' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'bricklysecret');
    (req as any).user = decoded; // oppure crea un tipo personalizzato se vuoi evitare 'any'
    next();
  } catch (err) {
    return res.status(401).json({ errore: 'Token non valido' });
  }
}
