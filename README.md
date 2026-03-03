# Ralph 中文优化版

![Ralph](ralph.webp)

> 基于 [snarktank/ralph](https://github.com/snarktank/ralph) 的中文优化版本，感谢原作者 [Ryan Carson](https://x.com/ryancarson) 和 [Geoffrey Huntley 的 Ralph 模式](https://ghuntley.com/ralph/)。

Ralph 是一个自主 AI agent 循环系统，重复运行 [Claude Code](https://docs.anthropic.com/en/docs/claude-code) 直到所有 PRD 条目完成。每次迭代都是一个全新的实例，上下文完全清空。记忆通过 git 历史、`progress.txt` 和 `prd.json` 持久化。

## 中文版增强特性

相比原版，本版本做了以下优化：

| 特性 | 原版 | 中文优化版 |
|------|------|-----------|
| 输出语言 | 英文 | 全中文（PRD、进度报告、验收标准） |
| 需求收集 | 文本输入 "1A, 2C, 3B" | `AskUserQuestion` 交互式选择（空格勾选，回车提交） |
| 头脑风暴 | 无 | 自动调用 `brainstorming` skill 进行创意发散 |
| 需求讨论 | 无 | 强制多轮需求讨论，确认边界情况和技术影响 |
| PRD 流程 | 提问 → 生成 | 头脑风暴 → 交互式澄清 → 需求讨论 → 生成 |

## 前置条件

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) 已安装并认证（`npm install -g @anthropic-ai/claude-code`）
- `jq` 已安装（macOS: `brew install jq`，Windows: `choco install jq`）
- 项目已初始化 git 仓库

## 安装

### 方式一：Claude Code Marketplace（推荐）

在 Claude Code 中执行：

```bash
/plugin marketplace add sickone075-web/ralph-zh
/plugin install ralph-zh-skills@ralph-zh-marketplace
```

安装后可用的 skill：
- `/prd` - 生成产品需求文档（含头脑风暴和需求讨论）
- `/ralph` - 将 PRD 转换为 prd.json 格式

更新到最新版：

```bash
/plugin update ralph-zh-skills@ralph-zh-marketplace
```

### 方式二：手动复制 skill

```bash
cp -r skills/prd ~/.claude/skills/
cp -r skills/ralph ~/.claude/skills/
```

### 方式三：复制到项目中

```bash
# 在项目根目录执行
mkdir -p scripts/ralph
cp /path/to/ralph-zh/ralph.sh scripts/ralph/
cp /path/to/ralph-zh/CLAUDE.md scripts/ralph/CLAUDE.md
chmod +x scripts/ralph/ralph.sh
```

## 工作流程

### 1. 创建 PRD

```
加载 prd skill，为 [你的功能描述] 创建 PRD
```

流程会自动经历：
1. **头脑风暴** - 调用 brainstorming skill 或自行发散思考
2. **交互式澄清** - 通过可选择的问题收集关键信息
3. **需求讨论** - 深入确认细节、边界情况、技术影响
4. **生成 PRD** - 输出到 `tasks/prd-[feature-name].md`

### 2. 转换为 Ralph 格式

```
加载 ralph skill，将 tasks/prd-[feature-name].md 转换为 prd.json
```

生成的 `prd.json` 中所有标题、描述、验收标准均为中文。

### 3. 运行 Ralph

```bash
./scripts/ralph/ralph.sh --tool claude [最大迭代次数]
```

默认 10 次迭代。Ralph 会：
1. 创建功能分支（来自 PRD 的 `branchName`）
2. 选择优先级最高的 `passes: false` 用户故事
3. 实现该故事
4. 运行质量检查（typecheck、lint、test）
5. 检查通过后提交代码
6. 更新 `prd.json` 标记故事为 `passes: true`
7. 将经验追加到 `progress.txt`
8. 重复直到所有故事完成或达到最大迭代次数

## 关键文件

| 文件 | 用途 |
|------|------|
| `ralph.sh` | Bash 循环脚本，每次启动全新的 AI 实例 |
| `CLAUDE.md` | Claude Code 实例的执行指令（中文） |
| `prd.json` | 用户故事及其完成状态（任务列表） |
| `prd.json.example` | PRD 格式示例 |
| `progress.txt` | 追加式经验日志，供后续迭代参考 |
| `skills/prd/` | PRD 生成 skill（中文，含头脑风暴和需求讨论） |
| `skills/ralph/` | PRD 转 JSON skill（中文） |
| `.claude-plugin/` | Claude Code Marketplace 插件清单 |
| `flowchart/` | Ralph 工作流程的交互式可视化 |

## 流程图

[![Ralph Flowchart](ralph-flowchart.png)](https://snarktank.github.io/ralph/)

**[查看交互式流程图](https://snarktank.github.io/ralph/)** - 点击可逐步查看带动画的流程。

本地运行：

```bash
cd flowchart
npm install
npm run dev
```

## 核心概念

### 每次迭代 = 全新上下文

每次迭代启动一个**全新的 Claude Code 实例**，上下文完全清空。迭代间的唯一记忆是：
- Git 历史（前序迭代的提交）
- `progress.txt`（经验和上下文）
- `prd.json`（哪些故事已完成）

### 任务要小

每个 PRD 条目应小到能在一个上下文窗口内完成。如果任务太大，LLM 会在完成前耗尽上下文，产出质量低下的代码。

合适大小：
- 添加数据库列和迁移
- 在现有页面上添加 UI 组件
- 用新逻辑更新服务端 action
- 添加列表筛选下拉框

太大（需拆分）：
- "构建整个仪表板"
- "添加认证"
- "重构 API"

### CLAUDE.md 更新至关重要

每次迭代后，Ralph 会将发现的模式更新到相关的 `CLAUDE.md` 文件中。这很关键，因为 Claude Code 会自动读取这些文件，后续迭代（和人类开发者）可以从中受益。

### 反馈循环

Ralph 依赖反馈循环才能正常工作：
- 类型检查捕获类型错误
- 测试验证行为
- CI 必须保持绿色（坏代码会跨迭代累积）

### 浏览器验证

涉及 UI 的故事必须在验收标准中包含"使用 dev-browser skill 在浏览器中验证"。Ralph 会使用该 skill 导航到页面、与 UI 交互并确认变更有效。

### 停止条件

当所有故事的 `passes` 为 `true` 时，Ralph 输出 `<promise>COMPLETE</promise>` 并退出循环。

## 调试

检查当前状态：

```bash
# 查看哪些故事已完成
cat prd.json | jq '.userStories[] | {id, title, passes}'

# 查看前序迭代的经验
cat progress.txt

# 查看 git 历史
git log --oneline -10
```

## 自定义提示

将 `CLAUDE.md` 复制到你的项目后，可以根据项目定制：
- 添加项目特定的质量检查命令
- 包含代码库约定
- 添加常见的技术栈注意事项

## 归档

Ralph 在启动新功能（不同的 `branchName`）时会自动归档上一次运行。归档保存到 `archive/YYYY-MM-DD-feature-name/`。

## 参考

- [原版 Ralph（snarktank/ralph）](https://github.com/snarktank/ralph) - 本项目基于此优化
- [Geoffrey Huntley 的 Ralph 文章](https://ghuntley.com/ralph/)
- [Claude Code 文档](https://docs.anthropic.com/en/docs/claude-code)

## 许可证

[MIT](LICENSE) - 与原版一致
