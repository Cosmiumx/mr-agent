import { Controller, Get, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { Request } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(@Req() req: Request): any {
    const routeMatches = req.headers['x-now-route-matches'] as string;
    let decodedPath: any = null;
    if (routeMatches) {
      try {
        const decoded = Buffer.from(routeMatches, 'base64').toString();
        decodedPath = JSON.parse(decoded);
      } catch (e) {
        decodedPath = 'decode_error: ' + String(e);
      }
    }
    
    return {
      message: 'Hello World!',
      debug: {
        url: req.url,
        originalUrl: req.originalUrl,
        'x-now-route-matches': routeMatches,
        decodedPath: decodedPath,
      }
    };
  }

  @Get('debug')
  getDebug(@Req() req: Request): any {
    const routeMatches = req.headers['x-now-route-matches'] as string;
    let decodedPath: any = null;
    if (routeMatches) {
      try {
        const decoded = Buffer.from(routeMatches, 'base64').toString();
        decodedPath = JSON.parse(decoded);
      } catch (e) {
        decodedPath = 'decode_error: ' + String(e);
      }
    }
    
    return {
      url: req.url,
      originalUrl: req.originalUrl,
      path: req.path,
      baseUrl: req.baseUrl,
      method: req.method,
      'x-now-route-matches': routeMatches,
      decodedPath: decodedPath,
      allHeaders: req.headers,
    };
  }

  @Get('*')
  catchAll(@Req() req: Request): any {
    const routeMatches = req.headers['x-now-route-matches'] as string;
    let decodedPath: any = null;
    if (routeMatches) {
      try {
        const decoded = Buffer.from(routeMatches, 'base64').toString();
        decodedPath = JSON.parse(decoded);
      } catch (e) {
        decodedPath = 'decode_error: ' + String(e);
      }
    }
    
    return {
      message: 'Catch-all route',
      debug: {
        url: req.url,
        originalUrl: req.originalUrl,
        path: req.path,
        method: req.method,
        'x-now-route-matches': routeMatches,
        decodedPath: decodedPath,
      }
    };
  }
}
