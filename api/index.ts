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

    // 创建 Express 应用实例
    const expressApp = express();

    // 使用 ExpressAdapter 创建 NestJS 应用
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const app = await NestFactory.create(AppModule as any, new ExpressAdapter(expressApp));

    // 不设置全局前缀，让路由保持原样（如 /webhook/trigger）
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
    // 打印请求路径信息用于调试
    console.log('=== Request Path Debug ===');
    console.log('req.method:', req.method);
    console.log('req.url:', req.url);
    console.log('========================');

    // 使用 setGlobalPrefix('api') 后，所有路由都会匹配 /api/* 路径
    // Vercel 会自动把 /api/* 请求路由到这个函数
    // 不需要任何路径转换，直接传递给 NestJS 处理
    const app = await createServerlessApp();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (app as any)(req, res);
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
