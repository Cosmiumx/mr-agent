import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 如果不是在 Vercel 环境下，才进行监听（用于本地开发）
  if (process.env.NODE_ENV !== 'production') {
    await app.listen(3000);
  }
  
  return app; // 返回 app 实例
}

// 只有在非 Vercel 环境下才调用 bootstrap()
if (!process.env.VERCEL) {
  bootstrap();
}

// 导出 handler，给 Vercel 使用
let handler: any = null;
export default async (req: any, res: any) => {
  try {
    // 第一次调用时初始化应用并缓存 handler
    if (!handler) {
      const app = await bootstrap();
      await app.init();
      const expressApp = app.getHttpAdapter().getInstance();
      handler = expressApp;
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
