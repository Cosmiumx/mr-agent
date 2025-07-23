import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WebhookController } from './webhook/webhook.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 使配置在整个应用中可用
      envFilePath: '.env', // 指定环境变量文件路径
    }),
  ],
  controllers: [AppController, WebhookController],
  providers: [AppService],
})
export class AppModule {}
