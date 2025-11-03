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

    // 创建 Express 应用实例，但不进行任何配置
    // 让 NestJS 通过 ExpressAdapter 完全控制
    const expressApp = express();

    // 抑制 app.router 弃用警告
    // 这个警告来自 Express 4.x，但不影响功能
    // 通过重写 console.warn 来过滤这个特定的警告
    const originalWarn = console.warn;
    console.warn = (...args: unknown[]) => {
      const message = args.join(' ');
      if (!message.includes("'app.router' is deprecated") && 
          !message.includes("app.router' is deprecated")) {
        originalWarn.apply(console, args);
      }
    };

    try {
      // 使用 ExpressAdapter 创建 NestJS 应用
      // 让 NestJS 完全控制 Express 应用的配置
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const app = await NestFactory.create(AppModule as any, new ExpressAdapter(expressApp));

      // 启用 CORS（如果需要）
      app.enableCors();

      // 初始化 NestJS 应用
      await app.init();
    } finally {
      // 恢复原始 console.warn
      console.warn = originalWarn;
    }

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
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // 过滤 app.router 弃用警告，不将其作为错误返回
    if (errorMessage.includes("'app.router' is deprecated") || 
        errorMessage.includes("app.router' is deprecated")) {
      console.warn('Suppressed app.router deprecation warning:', errorMessage);
      // 如果响应还没有发送，尝试重新初始化应用
      if (!res.headersSent) {
        try {
          // 清除缓存的应用，强制重新创建
          cachedApp = null;
          const app = await createServerlessApp();
          return (app as any)(req, res);
        } catch (retryError) {
          console.error('Retry failed:', retryError);
        }
      }
      return;
    }
    
    console.error('Handler error:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: errorMessage
      });
    }
  }
}
