import { Controller, Post, Body, Headers } from '@nestjs/common';
import { MrRequestBody } from '../git-provide/types/git-provide';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from '../types';
import { GitProvideService } from '../git-provide/git-provide.service';
import { TokenHandler } from '../tokens';
import { PatchHandler } from '../patch';
import { AgentService } from '../agent/agent.service';
import { PublishService } from 'src/publish/publish.service';

@Controller('webhook')
export class WebhookController {
  constructor(
    private readonly configService: ConfigService<EnvConfig>,
    private readonly agentService: AgentService,
    private readonly publishService: PublishService,
  ) {}

  @Post()
  async trigger(@Body() body: MrRequestBody, @Headers() header: Record<string, string>) {
    const gitlabToken = header['x-gitlab-token'] || '';
    const mode = (header['x-ai-mode'] || 'report') as 'report' | 'comment';
    const baseUrl = this.configService.get<string>('GITLAB_BASE_URL') || '';

    if (!gitlabToken) {
      throw new Error('gitlab token 不能为空');
    }

    const gitProvider = new GitProvideService(body, {
      gitlabToken,
      baseUrl,
    });

    const tokenHandler = new TokenHandler('gpt2');

    const diffFiles = await gitProvider.getFullDiff();

    const patchHandler = new PatchHandler(diffFiles);

    const extendedDiffContent = patchHandler.getExtendedDiffContent(gitProvider);

    const [tokenCount, availableTokenCount] = tokenHandler.countTokensByModel(extendedDiffContent);

    console.log('tokenCount >>>', tokenCount);
    console.log('availableTokenCount >>>', availableTokenCount);

    const reviews = await this.agentService.getPrediction(extendedDiffContent);

    if (reviews) {
      this.publishService.publish(mode, reviews, gitProvider);
    }

    return `ok`;
  }
}
