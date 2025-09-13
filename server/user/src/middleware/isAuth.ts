import type { Request, Response, NextFunction } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import type {IUser} from '../model/user.js';

export interface AuthenticatedRequest extends Request {
    user?: IUser | null;
}

const JWT_SECRET = process.env.JWT_SECRET || 'asdfllaldfnjlnjn';



export const isAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: 'Autherization heading is missing' });
        return;
    }

    const token = authHeader.split(" ")[1] as string;

      if (!token) {
        res.status(401).json({ message: 'Not authenticated.' });
        return;
    }

    const decodedToken = jwt.verify(token, JWT_SECRET) as JwtPayload;
   
    if (!decodedToken || !decodedToken.user) {
        res.status(401).json({ message: 'Token is missing from the authorization header.' });
        return;
    }

    req.user = decodedToken.user;
    next();
}