# TODO

- [x] 完善评论模式
- [x] 完善报告模式
- [ ] 完善企微机器人的对接
- [ ] 处理 LLM 回复的异常边界问题
      tokenCount >>> 16701
      availableTokenCount >>> 42299
      error >>> TypeError: Cannot read properties of undefined (reading 'replace')
      at <anonymous> (/Users/tangzhicheng/development/github/mr-agent/src/agent/agent.service.ts:124:43)
      at Array.forEach (<anonymous>)
      at AgentService.extractFirstYamlFromMarkdown (/Users/tangzhicheng/development/github/mr-agent/src/agent/agent.service.ts:118:26)
      at AgentService.getPrediction (/Users/tangzhicheng/development/github/mr-agent/src/agent/agent.service.ts:24:25)
      at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
      at async WebhookController.trigger (/Users/tangzhicheng/development/github/mr-agent/src/webhook/webhook.controller.ts:51:23)
- [ ] 增加超出 max_tokens 的上下文分割逻辑
- [ ] 增加上下文的扩容逻辑
