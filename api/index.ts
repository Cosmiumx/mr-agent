import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { join } from 'path';

let cachedApp: express.Application | null = null;

async function createServerlessApp(): Promise<express.Application> {
  if (cachedApp) {
    return cachedApp;
  }

  try {
    // 创建 Express 应用实例
    const expressApp = express();

    // 动态导入编译后的 AppModule
    // 在 Vercel serverless 环境中，使用相对路径更可靠
    // 尝试多个可能的路径以确保兼容性
    let AppModule;
    try {
      // 尝试相对路径（从 api/ 目录到 dist/src/）
      // 使用字符串变量避免 TypeScript 编译时检查
      const modulePath = '../dist/src/app.module.js';
      const module = await import(modulePath);
      AppModule = (module as { AppModule: unknown }).AppModule;
    } catch (e1) {
      try {
        // 如果失败，尝试使用 process.cwd()
        const distPath = join(process.cwd(), 'dist', 'src', 'app.module.js');
        const module = await import(distPath);
        AppModule = (module as { AppModule: unknown }).AppModule;
      } catch (e2) {
        console.error('Failed to import AppModule:', {
          e1: e1 instanceof Error ? e1.message : String(e1),
          e2: e2 instanceof Error ? e2.message : String(e2),
          cwd: process.cwd(),
        });
        throw e2;
      }
    }

    // 使用 ExpressAdapter 创建 NestJS 应用
    // 让 NestJS 完全控制 Express 应用的配置，避免 app.router 警告
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const app = await NestFactory.create(AppModule as any, new ExpressAdapter(expressApp));

    // 启用 CORS（如果需要）
    app.enableCors();

    // 初始化 NestJS 应用
    await app.init();

    cachedApp = expressApp;
    return expressApp;
  } catch (error) {
    console.error('Failed to create serverless app:', error);
    throw error;
  }
}

export default async function handler(req: express.Request, res: express.Response): Promise<void> {
  try {
    const app = await createServerlessApp();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (app as any)(req, res);
  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
