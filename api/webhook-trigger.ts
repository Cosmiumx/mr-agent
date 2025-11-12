import express from 'express';
import { join } from 'path';

export default async function handler(req: express.Request, res: express.Response) {
  try {
    console.log('Webhook trigger called:', req.method, req.url);

    // 启用 CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-gitlab-token, x-ai-mode, x-push-url, x-qwx-robot-url');

    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    if (req.method === 'GET') {
      res.json({
        status: 'ok',
        message: 'Webhook endpoint is ready. Please use POST method to trigger webhook.',
        endpoint: 'POST /api/webhook-trigger',
      });
      return;
    }

    if (req.method === 'POST') {
      // 动态导入编译后的模块（运行时导入，不会在编译时检查）
      let WebhookController, ConfigService, AgentService, PublishService;
      try {
        const distPath = join(process.cwd(), 'dist', 'src');
        const webhookModule = await import(join(distPath, 'webhook', 'webhook.controller.js'));
        const configModule = await import('@nestjs/config');
        const agentModule = await import(join(distPath, 'agent', 'agent.service.js'));
        const publishModule = await import(join(distPath, 'publish', 'publish.service.js'));
        
        WebhookController = webhookModule.WebhookController;
        ConfigService = configModule.ConfigService;
        AgentService = agentModule.AgentService;
        PublishService = publishModule.PublishService;
      } catch (e) {
        console.error('Failed to import modules:', e);
        res.status(500).json({ error: 'Failed to load application modules', details: String(e) });
        return;
      }

      // 创建配置服务实例
      const configService = new ConfigService({
        GITLAB_BASE_URL: process.env.GITLAB_BASE_URL,
        AGENT_URL: process.env.AGENT_URL,
        API_KEY: process.env.API_KEY,
        MODEL_NAME: process.env.MODEL_NAME,
      });

      // 创建服务实例
      const agentService = new AgentService(configService);
      const publishService = new PublishService(configService);

      // 创建控制器实例
      const controller = new WebhookController(configService, agentService, publishService);

      // 调用 trigger 方法
      const result = await controller.trigger(req.body, req.headers as Record<string, string>);
      
      res.json({ result });
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
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

