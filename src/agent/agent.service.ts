import { Injectable } from '@nestjs/common';
import { DeepSeekChatResponse, MRReview, YamlContent } from './types';
import { PromptService } from '../prompt/prompt.service';
import { EnvConfig } from '../types';
import { ConfigService } from '@nestjs/config';
import { parse } from 'yaml';

@Injectable()
export class AgentService {
  private readonly agentUrl: string;
  private readonly apiKey: string;
  private readonly modelName: string;
  constructor(
    private readonly promptService: PromptService,
    private readonly configService: ConfigService<EnvConfig>,
  ) {
    this.agentUrl = this.configService.get<string>('AGENT_URL') || '';
    this.apiKey = this.configService.get<string>('API_KEY') || '';
    this.modelName = this.configService.get<string>('MODEL_NAME') || '';
  }

  async getPrediction(query: string) {
    const answer = await this.callAgent(query);
    const result = this.extractFirstYamlFromMarkdown(answer);

    if (result?.error) {
      throw result.error;
    }

    return result?.parsed?.reviews;
  }

  async callAgent(query: string) {
    const url = this.agentUrl;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.modelName,
        messages: this.promptService.getMessages(query),
        temperature: 0.2,
        max_tokens: 6000,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('无法获取响应流的读取器');
    }
    const decoder = new TextDecoder('utf-8');
    let answer = '';
    let done = false;
    let buffer = '';
    while (!done) {
      const { value, done: streamDone } = await reader.read();
      done = streamDone;
      if (value) {
        buffer += decoder.decode(value, { stream: true });
        // 以 "\n\n" 分割 chunk
        const parts = buffer.split('\n\n');
        buffer = parts.pop() || '';
        for (const part of parts) {
          const match = part.match(/^data: (.+)$/);
          if (match) {
            const data = match[1].trim();
            // 检查是否为结束标记
            if (data === '[DONE]') {
              continue;
            }
            try {
              const json = JSON.parse(data) as DeepSeekChatResponse;
              // 流式数据中内容在 delta.content 字段
              if (json.choices[0].delta?.content) {
                answer += json.choices[0].delta.content;
              }
              // 兼容非流式数据格式
              else if (json.choices[0].message?.content) {
                answer += json.choices[0].message.content;
              }
            } catch (error) {
              // 忽略解析失败的 chunk
              console.log('解析 JSON 失败:', error);
            }
          }
        }
      }
    }
    return answer;
  }

  extractFirstYamlFromMarkdown(markdownText: string, isParse = true) {
    const regex = /```yaml\s*([\s\S]*?)\s*```/;
    const match = regex.exec(markdownText);

    if (!match) {
      return null;
    }

    const yamlContent = match[1];
    const result: YamlContent = {
      content: yamlContent,
      parsed: null,
      error: null,
    };

    if (isParse) {
      try {
        const mrReview = parse(yamlContent) as MRReview;
        mrReview.reviews.forEach((review) => {
          /**
           * 防止 LLM 在尾部输出一些不必要的 \n 符号，导致后续使用的时候，出现异常
           * 例如：'类型退化\n'
           */
          review.newPath = review.newPath.replace(/\n/g, '');
          review.oldPath = review.oldPath.replace(/\n/g, '');
          review.type = review.type.replace(/\n/g, '') as 'new' | 'old';
        });
        result.parsed = mrReview;
      } catch (e) {
        result.error = e instanceof Error ? e : new Error(String(e));
      }
    }

    return result;
  }
}
