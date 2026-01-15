# 🏗 粤Prompt生成器 (Dim Sum Prompt Generator)

<h4 align="center">
  <a href="https://prompt-generator.app.aidimsum.com/">Try Try!</a>
</h4>

一个基于 Scaffold-ETH 2 构建的粤语 Prompt 生成器，用于从语料数据生成 AI 模型提示词，支持多种 AI 模型（ChatGPT、DeepSeek、Gemini、元宝等）。

## ✨ 功能特性

- 📚 **语料数据加载**: 从后端 API 加载粤语语料数据，支持通过 `unique_id` 参数加载特定语料
- 🎨 **Prompt 模板系统**: 内置多个预设模板（如"粤语例句生成器"、"粤语配图小作文"等）
- 🔄 **动态占位符替换**: 支持 `{data}` 和嵌套占位符（如 `{data.note.context.meaning}`）自动替换
- 🌐 **多模型支持**: 生成的 Prompt 可直接在 ChatGPT、DeepSeek、Gemini、元宝等 AI 模型中打开
- 📦 **Arweave 集成**: 支持从 Arweave 去中心化存储加载 Prompt 模板
- 🎲 **随机模板**: 随机选择模板，增加创作灵感
- 📋 **一键复制**: 快速复制生成的 Prompt 到剪贴板

## 🛠 技术栈

- **前端框架**: Next.js 16 (App Router)
- **UI 库**: React 19, Tailwind CSS 4
- **区块链框架**: Scaffold-ETH 2 (Hardhat + Wagmi + RainbowKit)
- **语言**: TypeScript
- **状态管理**: Zustand
- **其他**: Radix UI, React Hot Toast

## 📋 环境要求

在开始之前，请确保已安装以下工具：

- [Node.js (>= v20.18.3)](https://nodejs.org/en/download/)
- [Yarn (v1 或 v2+)](https://yarnpkg.com/getting-started/install)
- [Git](https://git-scm.com/downloads)

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd dim-sum-prompt-generator
```

### 2. 安装依赖

```bash
yarn install
```

### 3. 启动本地开发环境

在第一个终端启动本地区块链网络（可选，如果不需要智能合约功能可跳过）：

```bash
yarn chain
```

在第二个终端部署测试合约（可选）：

```bash
yarn deploy
```

在第三个终端启动 Next.js 应用：

```bash
yarn start
```

访问应用：`http://localhost:3000`

## 📖 使用说明

### 加载语料数据

1. 通过 URL 参数 `unique_id` 加载特定语料：
   ```
   http://localhost:3000?unique_id=your-unique-id
   ```

2. 默认会加载示例语料（`6e29005d-31ed-42d6-be17-baab39b07fa1`）

### 选择 Prompt 模板

- 点击模板卡片选择预设模板
- 点击"随机一张"随机选择模板
- 点击"Load 自 AR"从 Arweave 加载模板（支持通过 URL 参数 `ar_id` 自动加载）

### 编辑 Prompt

1. 在 Prompt 编辑器中编辑模板内容
2. 使用 `{data}` 作为语料数据的占位符
3. 使用 `{data.note.context.meaning}` 等嵌套路径访问语料的特定字段
4. 点击"生成 Prompt"按钮生成最终提示词

### 使用生成的 Prompt

1. 生成的 Prompt 会显示在页面底部
2. 点击"复制 Prompt"按钮复制到剪贴板
3. 点击模型按钮（ChatGPT、DeepSeek 等）在新标签页打开对应的 AI 模型

## 🏗 项目结构

```
dim-sum-prompt-generator/
├── packages/
│   ├── hardhat/          # 智能合约开发环境
│   │   ├── contracts/    # Solidity 合约
│   │   ├── deploy/       # 部署脚本
│   │   └── test/         # 合约测试
│   └── nextjs/           # Next.js 前端应用
│       ├── app/          # Next.js App Router 页面
│       │   ├── page.tsx  # 主页面（Prompt 生成器）
│       │   ├── gallery/  # Prompt 模板展览馆
│       │   └── ...
│       ├── components/   # React 组件
│       ├── hooks/        # 自定义 Hooks
│       └── utils/        # 工具函数
├── scripts/              # 脚本文件
└── README.md
```

## 🔧 配置

### 后端 API

应用默认连接到 `https://backend.aidimsum.com` 获取语料数据。如需修改，请编辑 `packages/nextjs/app/page.tsx` 中的 API 端点。

### 区块链配置

编辑 `packages/nextjs/scaffold.config.ts` 配置目标网络和其他区块链相关设置。

## 📝 开发指南

### 添加新的 Prompt 模板

在 `packages/nextjs/app/page.tsx` 中的 `templates` 数组添加新模板：

```typescript
{
  name: "模板名称",
  prompt: "你的 Prompt 模板，使用 {data} 作为占位符",
  adapted_models: ["chatgpt", "deepseek", "yuanbao"],
}
```

### 添加新的 AI 模型

在 `models` 对象中添加新模型：

```typescript
const models = {
  chatgpt: "https://chatgpt.com/",
  deepseek: "https://chat.deepseek.com/",
  // 添加新模型
  yourmodel: "https://your-model-url.com/",
};
```

## 🚢 部署

### Vercel 部署

```bash
yarn vercel
```

### IPFS 部署

```bash
yarn ipfs
```

## 📄 许可证

查看 [LICENCE](LICENCE) 文件了解详情。

## 🤝 贡献

欢迎贡献！请查看 [CONTRIBUTING.md](CONTRIBUTING.md) 了解贡献指南。

## 🔗 相关链接

- **在线体验**: [https://meme.app.aidimsum.com](https://meme.app.aidimsum.com)
- **AI 点心实验室**: [https://aidimsum.com](https://aidimsum.com)
- **Scaffold-ETH 2 文档**: [https://docs.scaffoldeth.io](https://docs.scaffoldeth.io)

## 👤 作者

- **个人主页**: [https://leeduckgo.com](https://leeduckgo.com)
- **Twitter**: [@0xleeduckgo](https://x.com/0xleeduckgo)

---

Built with ❤️ using [Scaffold-ETH 2](https://github.com/scaffold-eth/scaffold-eth-2)
