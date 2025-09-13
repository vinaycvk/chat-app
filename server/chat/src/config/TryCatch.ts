import type { Request, NextFunction, RequestHandler, Response } from 'express';


const TryCatch = (handler: RequestHandler): RequestHandler => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {   
            await handler(req, res, next);
        } catch (error) {
            res.status(500).json({ message: 'Internal Server Error', error });
        }
    };
}

export default TryCatch;