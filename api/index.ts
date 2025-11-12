import { NestFactory } from '@nestjs/core';
import { join } from 'path';

// 按照文章的方式：缓存 Express handler 实例
let handler: any = null;

async function bootstrap() {
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

    // 创建 NestJS 应用（不需要手动创建 Express 实例）
    const app = await NestFactory.create(AppModule, { logger: ['error', 'warn', 'log'] });

    // 启用 CORS
    app.enableCors();

    // 初始化应用（这会注册所有路由）
    await app.init();

    // 获取底层的 Express 实例并返回
    const expressApp = app.getHttpAdapter().getInstance();
    
    console.log('NestJS application bootstrapped successfully');
    
    return expressApp;
  } catch (error) {
    console.error('Failed to bootstrap app:', error);
    throw error;
  }
}

// 按照文章的模式导出 handler
export default async (req: any, res: any) => {
  try {
    console.log(`[${req.method}] ${req.url}`);
    
    // 第一次调用时初始化应用并缓存 handler
    if (!handler) {
      handler = await bootstrap();
    }
    
    // 使用缓存的 Express 实例处理请求
    return handler(req, res);
  } catch (error) {
    console.error('Handler error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }
};

