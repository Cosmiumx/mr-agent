import { Controller, Post, Body, Headers } from '@nestjs/common';
import { MrRequestBody } from '../git-provide/types/git-provide';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from '../types';
import { GitProvideService } from '../git-provide/git-provide.service';
import { TokenHandler } from '../tokens';

@Controller('webhook')
export class WebhookController {
  constructor(private readonly configService: ConfigService<EnvConfig>) {}

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

    const tokenHandler = new TokenHandler('gpt-4.1');

    const diffFiles = await gitProvider.getFullDiff();

    const diffContentStr = diffFiles.reduce((pre, cur) => {
      return pre + cur.diff;
    }, '');

    const [tokenCount, availableTokenCount] =
      tokenHandler.countTokensByModel(diffContentStr);

    console.log('tokenCount', tokenCount, availableTokenCount);

    // 根据 availableTokenCount 扩容 diff 内容

    return 'trigger';
  }
}
