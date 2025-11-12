import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { INestApplication } from '@nestjs/common';
import express from 'express';
import { join } from 'path';

let cachedApp: INestApplication | null = null;

async function bootstrap(): Promise<INestApplication> {
  if (cachedApp) {
    return cachedApp;
  }

  try {
    // 动态导入 AppModule
    let AppModule;
    try {
      const modulePath = '../dist/src/app.module.js';
      const module = await import(modulePath);
      AppModule = module.AppModule;
    } catch (e1) {
      const distPath = join(process.cwd(), 'dist', 'src', 'app.module.js');
      const module = await import(distPath);
      AppModule = module.AppModule;
    }

    // 创建 Express 实例
    const expressApp = express();

    // 创建 NestJS 应用
    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
      { logger: ['error', 'warn', 'log'] }
    );

    // 启用 CORS
    app.enableCors();

    // 初始化应用（这会注册所有路由）
    // 注意：Express 4.x 的 app.router 已废弃，NestJS 在初始化时可能会触发错误
    // 但路由实际上已经注册成功，可以安全忽略这个错误
    try {
      await app.init();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (!errorMessage.includes("'app.router' is deprecated")) {
        console.error('Failed to initialize NestJS app:', error);
        throw error;
      }
      console.log('Ignoring app.router deprecation warning - routes are registered');
    }

    console.log('NestJS application initialized successfully');

    // 缓存 NestJS 应用实例
    cachedApp = app;
    return app;
  } catch (error) {
    console.error('Failed to bootstrap NestJS app:', error);
    throw error;
  }
}

export default async function handler(req: express.Request, res: express.Response) {
  try {
    console.log(`[${req.method}] ${req.url}`);

    // 获取 NestJS 应用实例
    const app = await bootstrap();

    // 获取底层的 Express 实例
    const httpAdapter = app.getHttpAdapter();
    const expressInstance = httpAdapter.getInstance();

    // 让 Express 处理请求
    expressInstance(req, res);
  } catch (error) {
    console.error('Handler error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }
}

