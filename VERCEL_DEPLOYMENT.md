# Vercel 部署完整指南

本指南将帮助你从零开始将 MR Agent 项目部署到 Vercel。

## 📋 目录

1. [前置准备](#前置准备)
2. [项目配置检查](#项目配置检查)
3. [创建 Vercel 账号](#创建-vercel-账号)
4. [准备代码仓库](#准备代码仓库)
5. [部署到 Vercel](#部署到-vercel)
6. [配置环境变量](#配置环境变量)
7. [测试部署](#测试部署)
8. [常见问题排查](#常见问题排查)

---

## 前置准备

### 1. 安装必要的工具

确保你的电脑上已安装：

- **Node.js** (版本 18 或更高)
  - 检查：打开终端运行 `node -v`
  - 如果未安装：访问 [nodejs.org](https://nodejs.org/) 下载安装

- **pnpm** 包管理器
  - 检查：运行 `pnpm -v`
  - 如果未安装：运行 `npm install -g pnpm`

- **Git** 版本控制
  - 检查：运行 `git --version`
  - 如果未安装：访问 [git-scm.com](https://git-scm.com/) 下载安装

### 2. 准备代码仓库

项目需要托管在 Git 仓库中（GitHub、GitLab 或 Bitbucket）。

- 如果还没有仓库，可以在 GitHub 上创建一个
- 确保 `.env` 文件已添加到 `.gitignore`（不要提交敏感信息）

---

## 项目配置检查

### 1. 验证项目结构

确保项目根目录包含以下文件：

```
mr-agent/
├── package.json          # 项目依赖配置
├── vercel.json           # Vercel 部署配置（已创建）
├── src/
│   ├── api.ts           # Serverless 入口文件（已创建）
│   └── ...
├── tsconfig.json        # TypeScript 配置
└── nest-cli.json        # NestJS 配置
```

### 2. 验证构建命令

在项目根目录运行以下命令，确保项目能正常构建：

```bash
# 安装依赖
pnpm install

# 构建项目
pnpm run build
```

如果构建成功，会在 `dist/` 目录下生成编译后的文件，包括 `dist/api.js`。

**如果构建失败：**
- 检查是否有 TypeScript 错误
- 检查依赖是否完整安装

---

## 创建 Vercel 账号

### 方式一：使用 GitHub 账号（推荐）

1. 访问 [vercel.com](https://vercel.com)
2. 点击右上角 **"Sign Up"** 或 **"Login"**
3. 选择 **"Continue with GitHub"**
4. 授权 Vercel 访问你的 GitHub 账号

### 方式二：使用邮箱注册

1. 访问 [vercel.com](https://vercel.com)
2. 点击 **"Sign Up"**
3. 输入邮箱和密码
4. 验证邮箱后完成注册

---

## 准备代码仓库

### 1. 提交代码到 Git 仓库

如果代码还没有推送到远程仓库：

```bash
# 初始化 Git（如果还没有）
git init

# 添加所有文件（除了 .env）
git add .

# 提交代码
git commit -m "Initial commit: Prepare for Vercel deployment"

# 添加远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/你的用户名/mr-agent.git

# 推送到远程
git push -u origin main
```

### 2. 确认 .env 不在仓库中

确保 `.gitignore` 包含：

```
.env
.env.local
.env.production.local
```

---

## 部署到 Vercel

### 步骤 1：导入项目

1. 登录 Vercel 后，点击右上角的 **"Add New..."** → **"Project"**
2. 在 **"Import Git Repository"** 页面，选择你的代码仓库平台（GitHub/GitLab/Bitbucket）
3. 如果没有连接，点击 **"Connect"** 并授权访问
4. 在仓库列表中找到你的 `mr-agent` 项目，点击 **"Import"**

### 步骤 2：配置项目

在 **"Configure Project"** 页面：

1. **Project Name**（项目名称）
   - 可以保持默认，或修改为你喜欢的名称
   - 例如：`mr-agent`

2. **Framework Preset**（框架预设）
   - Vercel 可能会自动检测，如果没有自动检测到，可以选择 **"Other"**

3. **Root Directory**（根目录）
   - 保持默认 **"./"**（因为配置文件在根目录）

4. **Build and Output Settings**（构建和输出设置）
   - Vercel 会自动读取 `vercel.json`，通常不需要手动设置
   - 如果看到以下设置，确认它们是：
     - **Build Command**: `pnpm run build`
     - **Output Directory**: `dist`
     - **Install Command**: `pnpm install`

5. **Environment Variables**（环境变量）
   - **这一步先跳过**，部署完成后再配置（见下一节）

### 步骤 3：开始部署

1. 点击页面底部的 **"Deploy"** 按钮
2. Vercel 会开始构建和部署你的项目
3. 等待 1-3 分钟，直到看到 **"Congratulations!"** 页面

### 步骤 4：查看部署结果

部署完成后：

- **绿色 ✅** 表示部署成功
- **红色 ❌** 表示部署失败（点击查看错误日志）

部署成功后，你会看到：
- **生产环境 URL**: `https://你的项目名.vercel.app`
- **预览环境 URL**: `https://你的项目名-随机字符.vercel.app`

---

## 配置环境变量

### 需要设置的环境变量

根据项目代码，需要设置以下环境变量：

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `GITLAB_BASE_URL` | GitLab 服务器的基础 URL | `https://gitlab.com` |
| `AGENT_URL` | AI 服务的 API 地址 | `https://api.deepseek.com/v1/chat/completions` |
| `API_KEY` | AI 服务的认证密钥 | `sk-xxxxxxxxxxxxx` |
| `MODEL_NAME` | 使用的模型名称 | `deepseek-chat` |

### 配置步骤

1. 在 Vercel 项目页面，点击顶部导航栏的 **"Settings"**

2. 在左侧菜单找到 **"Environment Variables"**

3. 添加每个环境变量：
   - 点击 **"Add New"**
   - 输入 **Key**（变量名），例如：`GITLAB_BASE_URL`
   - 输入 **Value**（变量值），例如：`https://gitlab.com`
   - 选择应用环境：
     - ✅ **Production** - 生产环境
     - ✅ **Preview** - 预览环境（可选）
     - ✅ **Development** - 开发环境（可选）
   - 点击 **"Save"**

4. 重复步骤 3，添加所有需要的环境变量

5. **重要**：添加完环境变量后，需要重新部署项目
   - 在项目页面的 **"Deployments"** 标签
   - 找到最新的部署记录
   - 点击右侧的 **"⋯"** → **"Redeploy"**
   - 或者在 **"Settings"** → **"Environment Variables"** 页面底部点击 **"Redeploy"**

### 如何获取环境变量值？

- **GITLAB_BASE_URL**: 你的 GitLab 服务器地址
  - 如果使用 GitLab.com: `https://gitlab.com`
  - 如果是自建 GitLab: `https://你的gitlab域名.com`

- **AGENT_URL**: 你使用的 AI 服务 API 地址
  - DeepSeek: `https://api.deepseek.com/v1/chat/completions`
  - OpenAI: `https://api.openai.com/v1/chat/completions`
  - 其他服务: 查看对应服务的文档

- **API_KEY**: 在 AI 服务提供商处获取的 API 密钥
  - 登录对应的 AI 服务平台
  - 在 API 设置中生成密钥

- **MODEL_NAME**: 使用的模型名称
  - DeepSeek: `deepseek-chat`
  - OpenAI: `gpt-4` 或 `gpt-3.5-turbo`
  - 其他服务: 查看对应服务的文档

---

## 测试部署

### 1. 测试根路由

访问你的部署 URL：
```
https://你的项目名.vercel.app/
```

应该看到返回 "Hello World!" 或类似的响应。

### 2. 测试 Webhook 端点

Webhook 的完整路径是：
```
https://你的项目名.vercel.app/webhook/trigger
```

#### 使用 curl 测试（可选）

```bash
curl -X POST https://你的项目名.vercel.app/webhook/trigger \
  -H "Content-Type: application/json" \
  -H "x-gitlab-token: 你的gitlab-token" \
  -d '{"test": "data"}'
```

#### 在 GitLab 中配置 Webhook

1. 进入你的 GitLab 项目
2. 打开 **Settings** → **Webhooks**
3. 添加新的 Webhook：
   - **URL**: `https://你的项目名.vercel.app/webhook/trigger`
   - **Trigger**: 选择 **"Merge request events"**
   - **Secret token**: （可选，如果代码中有验证逻辑）
4. 保存并测试

### 3. 查看日志

如果测试失败，查看部署日志：

1. 在 Vercel 项目页面，点击 **"Deployments"**
2. 点击最新的部署记录
3. 在 **"Functions"** 标签中查看日志
4. 或者在 **"Logs"** 标签中查看实时日志

---

## 常见问题排查

### ❌ 问题 1: 构建失败

**错误信息**: `Error: Cannot find module 'express'` 或类似的模块找不到错误

**解决方法**:
```bash
# 1. 确保所有依赖都已安装
pnpm install

# 2. 如果 express 相关错误，虽然 @nestjs/platform-express 应该包含它，
#    但为了保险可以显式添加（通常不需要）
# pnpm add express

# 3. 重新构建测试
pnpm run build

# 4. 如果构建成功，提交代码并重新部署
git add .
git commit -m "Fix dependencies"
git push
```

**注意**: `@nestjs/platform-express` 已经包含了 `express`，通常不需要单独安装。如果遇到此错误，先检查构建是否真的失败，还是运行时的错误。

### ❌ 问题 2: 函数执行超时

**错误信息**: `Function execution timeout`

**可能原因**: 代码评审任务耗时过长，超过了 Vercel 的免费计划限制（10秒）

**解决方法**:
- 升级到 Vercel Pro 计划（60秒限制）
- 或者优化代码，减少处理时间
- 考虑使用异步处理（将任务放入队列）

### ❌ 问题 3: 环境变量未生效

**现象**: 代码中读取的环境变量为空

**解决方法**:
1. 确认环境变量已在 Vercel 后台设置
2. **重要**: 添加环境变量后必须重新部署
3. 检查变量名是否完全匹配（区分大小写）
4. 检查是否选择了正确的环境（Production/Preview）

### ❌ 问题 4: CORS 错误

**错误信息**: `Access-Control-Allow-Origin`

**解决方法**:
在 `src/api.ts` 中已经启用了 CORS，如果还有问题，可以调整：
```typescript
app.enableCors({
  origin: '*', // 或指定具体域名
  credentials: true,
});
```

### ❌ 问题 5: 404 Not Found

**现象**: 访问任何路由都返回 404

**解决方法**:
1. 检查 `vercel.json` 配置是否正确
2. 确认 `dist/api.js` 文件在构建后存在
3. 检查路由配置是否正确

### ❌ 问题 6: 本地能运行，Vercel 上不行

**可能原因**:
- 环境变量未设置
- Node.js 版本不匹配
- 依赖安装失败

**解决方法**:
1. 在 Vercel 项目设置中指定 Node.js 版本
2. 检查 `package.json` 中的 `engines` 字段：
   ```json
   {
     "engines": {
       "node": ">=18"
     }
   }
   ```

---

## 后续操作

### 自动部署

Vercel 已自动配置：
- 每次推送到 `main` 分支 → 自动部署到生产环境
- 每次推送到其他分支 → 自动创建预览环境

### 自定义域名（可选）

1. 在 Vercel 项目页面，点击 **"Settings"** → **"Domains"**
2. 添加你的自定义域名
3. 按照提示配置 DNS 记录

### 监控和日志

- **Analytics**: 查看访问统计
- **Logs**: 实时查看函数执行日志
- **Deployments**: 查看所有部署历史

---

## 获取帮助

如果遇到问题：

1. **查看 Vercel 文档**: [vercel.com/docs](https://vercel.com/docs)
2. **查看 NestJS 文档**: [nestjs.com](https://nestjs.com)
3. **查看项目 Issues**: 在 GitHub 仓库中提交问题
4. **Vercel 支持**: 在 Vercel 后台的 "Help" 部分联系支持

---

## 快速检查清单

部署前确认：

- [ ] 项目能本地构建成功 (`pnpm run build`)
- [ ] 代码已推送到 Git 仓库
- [ ] `.env` 文件已添加到 `.gitignore`
- [ ] `vercel.json` 配置文件存在
- [ ] `src/api.ts` 文件存在

部署后确认：

- [ ] Vercel 部署状态为 ✅ 成功
- [ ] 所有环境变量已设置
- [ ] 环境变量设置后已重新部署
- [ ] 根路由访问正常 (`/`)
- [ ] Webhook 端点配置正确 (`/webhook/trigger`)

---

**祝部署顺利！🚀**
