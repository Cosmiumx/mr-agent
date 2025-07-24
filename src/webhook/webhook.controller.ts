import { Controller, Post, Body, Headers } from '@nestjs/common';
import { MrRequestBody } from '../git-provide/types/git-provide';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from '../types';
import { GitProvideService } from '../git-provide/git-provide.service';
import { TokenHandler } from '../tokens';
import { PatchHandler } from '../patch';
import { AgentService } from '../agent/agent.service';
import { extractFirstYamlFromMarkdown } from './utils';

@Controller('webhook')
export class WebhookController {
  constructor(
    private readonly configService: ConfigService<EnvConfig>,
    private readonly agentService: AgentService,
  ) {}

  @Post()
  async trigger(
    @Body() body: MrRequestBody,
    @Headers() header: Record<string, string>,
  ) {
    const gitlabToken = header['x-gitlab-token'] || '';
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

    const extendedDiffContent = patchHandler.getExtendedDiffContent();

    console.log('extendedDiffContent >>>', extendedDiffContent);

    const [tokenCount, availableTokenCount] =
      tokenHandler.countTokensByModel(extendedDiffContent);

    console.log('tokenCount >>>', tokenCount);
    console.log('availableTokenCount >>>', availableTokenCount);

    const response = await this.agentService.getPrediction(extendedDiffContent);

    const result = extractFirstYamlFromMarkdown(response);

    if (result?.error) {
      throw result.error;
    }

    const { parsed } = result || {};

    console.log('parsed', parsed);

    return 'trigger';
  }
}
