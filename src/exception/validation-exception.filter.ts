import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
} from '@nestjs/common';
import { Request } from 'express';

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req: Request = ctx.getRequest();
    const res = ctx.getResponse();

    const status = 400;

    res.status(status).json({
      statusCode: status,
      message: exception['response']['message'][0],
      path: req.path,
      timestamp: new Date().toString(),
    });
  }
}
