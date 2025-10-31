import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

let cachedApp: express.Application | null = null;

async function createServerlessApp(): Promise<express.Application> {
  if (cachedApp) {
    return cachedApp;
  }

  const expressApp = express();
  expressApp.use(express.json());

  // 动态导入编译后的 AppModule
  // @ts-ignore - dist 目录在构建时可能还不存在，但运行时存在
  const { AppModule } = await import('../dist/app.module');
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));

  // 启用 CORS（如果需要）
  app.enableCors();

  // 初始化 NestJS 应用
  await app.init();

  cachedApp = expressApp;
  return expressApp;
}

export default async function handler(req: express.Request, res: express.Response) {
  const app = await createServerlessApp();
  return app(req, res);
}

