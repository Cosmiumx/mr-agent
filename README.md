# MR Agent

mr-agent: A Node.js service that auto-triggers AI-powered code reviews when receiving Git merge request webhook events. Integrates with GitHub/GitLab/Bitbucket to analyze changes, flag issues, and suggest improvements—streamlining reviews for teams of all sizes.

## 🚀 快速开始

### 本地开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm run start:dev

# 构建项目
pnpm run build

# 生产环境运行
pnpm run start:prod
```

### 部署到 Vercel

详细的部署指南请查看：[VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)

快速步骤：
1. 将代码推送到 Git 仓库（GitHub/GitLab/Bitbucket）
2. 在 [Vercel](https://vercel.com) 导入项目
3. 配置环境变量（见部署文档）
4. 部署完成！

## 📚 文档

- [Vercel 部署完整指南](./VERCEL_DEPLOYMENT.md) - 新手友好的详细部署教程

## 🔧 环境变量

项目需要以下环境变量（在 Vercel 后台配置）：

- `GITLAB_BASE_URL` - GitLab 服务器地址
- `AGENT_URL` - AI 服务 API 地址
- `API_KEY` - AI 服务认证密钥
- `MODEL_NAME` - 使用的模型名称
