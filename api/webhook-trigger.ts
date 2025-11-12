import express from 'express';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { join } from 'path';

let cachedApp: any = null;

async function getApp() {
  if (cachedApp) {
    return cachedApp;
  }

  try {
    // 动态导入 AppModule
    let AppModule;
    try {
      const modulePath = '../dist/src/app.module.js';
      const module = await import(modulePath);
      AppModule = (module as { AppModule: unknown }).AppModule;
    } catch (e1) {
      const distPath = join(process.cwd(), 'dist', 'src', 'app.module.js');
      const module = await import(distPath);
      AppModule = (module as { AppModule: unknown }).AppModule;
    }

    const expressApp = express();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const app = await NestFactory.create(AppModule as any, new ExpressAdapter(expressApp));
    app.enableCors();
    
    try {
      await app.init();
    } catch (error) {
      // 忽略 app.router 错误
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (!errorMessage.includes("'app.router' is deprecated")) {
        throw error;
      }
    }

    cachedApp = app;
    return app;
  } catch (error) {
    console.error('Failed to create app:', error);
    throw error;
  }
}

export default async function handler(req: express.Request, res: express.Response): Promise<void> {
  try {
    console.log('Webhook trigger called:', req.method);
    
    const app = await getApp();
    
    // 直接调用 NestJS 的 HTTP adapter 来处理请求
    // 设置请求路径为 /webhook/trigger
    req.url = '/webhook/trigger';
    
    const httpAdapter = app.getHttpAdapter();
    const instance = httpAdapter.getInstance();
    
    // 使用 Express 实例处理请求
    return instance(req, res);
  } catch (error) {
    console.error('Handler error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: errorMessage,
      });
    }
  }
}

