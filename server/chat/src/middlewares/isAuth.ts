import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "asdfllaldfnjlnjn";

interface IUser extends Document {
    _id: string;
    name: string;
    email: string;
}


export interface AuthenticatedRequest extends Request {
    user?: IUser | null;
}


export const isAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction)
    : Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({ message: "Please Login - No Auth headers" });
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
    catch (error) {
        console.error("Authentication error:", error);
        res.status(401).json({ message: "Please Login - Invalid Token" });
    }
}



export default isAuth;