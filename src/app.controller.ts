import { Controller, Get, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { Request } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('debug')
  getDebug(@Req() req: Request): any {
    return {
      url: req.url,
      originalUrl: req.originalUrl,
      path: req.path,
      baseUrl: req.baseUrl,
      method: req.method,
      headers: req.headers,
    };
  }
}
