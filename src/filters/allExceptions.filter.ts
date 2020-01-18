import {
  Catch,
  ArgumentsHost,
  Inject,
  HttpServer,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { BaseExceptionFilter, HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  constructor(@Inject(HttpAdapterHost) applicationRef: HttpServer) {
    super(applicationRef);
  }

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    // const request = ctx.getRequest();
    // const status = exception.getStatus();

    const message =
      exception instanceof Error ? exception.message : exception.message.error;

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    response.status(status).json({
      status,
      success: false,
      data: [],
      message,
    });
  }
}
