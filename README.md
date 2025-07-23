# MR Agent

mr-agent: A Node.js service that auto-triggers AI-powered code reviews when receiving Git merge request webhook events. Integrates with GitHub/GitLab/Bitbucket to analyze changes, flag issues, and suggest improvements—streamlining reviews for teams of all sizes.

## 环境变量配置

本项目使用环境变量来管理配置。请按照以下步骤设置：

1. 复制 `.env.example` 文件并重命名为 `.env`
2. 在 `.env` 文件中填入实际的配置值

### 可用的环境变量

| 变量名 | 描述 | 默认值 |
|-------|------|-------|
| API_KEY | API密钥 | - |
| API_SECRET | API密钥对应的秘钥 | - |
| APP_PORT | 应用运行端口 | 3000 |
| APP_ENV | 应用环境（development/production） | development |

### 在代码中使用环境变量

本项目使用 `@nestjs/config` 包来管理环境变量。在需要使用环境变量的地方，可以通过注入 `ConfigService` 来访问：

```typescript
import { ConfigService } from '@nestjs/config';

@Injectable()
export class YourService {
  constructor(private configService: ConfigService) {}

  yourMethod() {
    // 读取环境变量
    const apiKey = this.configService.get<string>('API_KEY');
    // 使用环境变量...
  }
}
```
