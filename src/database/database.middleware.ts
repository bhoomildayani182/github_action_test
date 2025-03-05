import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { jwtConstants } from '../auth/auth.constant';

@Injectable()
export class DatabaseMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        throw new Error('Authorization token is missing');
      }

      const token = authHeader.split(' ')[1];
      if (!token) {
        throw new Error('Token is invalid');
      }

      const decoded = jwt.verify(token, jwtConstants.secret) as any;
      if (decoded.sub) {
        req['dbName'] = atob(decoded.sub);
      }
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Unauthorized', error: error });
    }
  }
}
