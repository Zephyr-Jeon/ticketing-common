import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

interface UserPayload {
  id: string;
  email: string;
}

// modify an existing interface
// telling TypeScript that inside of Express project find the interface of Request that already defined and modify it
// https://www.typescriptlang.org/docs/handbook/declaration-files/templates/global-modifying-module-d-ts.html
declare global {
  namespace Express {
    interface Request {
      currentUser?: UserPayload;
    }
  }
}

export const currentUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.session?.jwt) {
    return next();
  }

  try {
    const payload = jwt.verify(
      req.session.jwt,
      process.env.JWT_KEY!
    ) as UserPayload;
    req.currentUser = payload;
  } catch (e) {
    //
  }

  next();
};
