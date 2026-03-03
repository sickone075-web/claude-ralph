---
name: ralph-start
description: "Start Ralph autonomous agent loops. Use when you want to launch ralph for the active project. Triggers on: ralph start, start ralph, run ralph, ralph-start, launch ralph agent."
user-invocable: true
---

# Ralph Start — 启动 Ralph 自主循环

启动 Ralph agent 循环，支持单仓库和多仓库项目。

---

## 工作流程

### 第一步：检测多仓库配置

读取 `~/.ralph/config.json` 检查活跃项目是否配置了 `repositories`：

1. 读取配置文件 `~/.ralph/config.json`
2. 找到 `activeProject` 对应的项目配置
3. 检查该项目是否有 `repositories` 字段

---

### 第二步：根据项目类型选择启动方式

#### 单仓库项目（无 repositories 配置）

直接在项目根目录启动 ralph 循环，行为与以前完全一致：

```bash
# 在项目根目录执行
cd <projectPath>
bash scripts/ralph/ralph.sh [maxIterations]
```

告知用户已启动单仓库 ralph 循环，无需额外选择。

#### 多仓库项目（有 repositories 配置）

检测到多仓库项目时，使用 `AskUserQuestion` 工具询问用户启动方式：

```
检测到多仓库项目，包含以下仓库：

| 仓库名称 | 类型 | 优先级 | 路径 |
|---------|------|--------|------|
| docs | docs | 0 | /path/to/docs |
| backend | backend | 1 | /path/to/backend |
| frontend | frontend | 1 | /path/to/frontend |
```

提供以下选项：

1. **启动全部仓库**（推荐）— 调用 `ralph run-all`，按优先级分阶段编排执行
2. **启动指定仓库** — 让用户选择一个仓库，调用 `ralph run-all --repo <name>`
3. **启动指定类型** — 让用户选择仓库类型，调用 `ralph run-all --type <type>`

---

### 第三步：执行启动命令

根据用户选择，在终端中执行对应命令：

#### 启动全部

```bash
ralph run-all
```

#### 启动指定仓库

```bash
ralph run-all --repo <repoName>
```

#### 启动指定类型

```bash
ralph run-all --type <repoType>
```

---

## 参数传递

`/ralph-start` 支持直接传递参数以跳过交互式选择：

- `/ralph-start` — 无参数，进入交互式选择（多仓库）或直接启动（单仓库）
- `/ralph-start --repo backend` — 直接启动指定仓库，跳过选择
- `/ralph-start --repo docs --repo frontend` — 启动多个指定仓库
- `/ralph-start --type docs` — 启动指定类型的所有仓库

当传递了 `--repo` 或 `--type` 参数时，跳过交互式选择，直接调用 `ralph run-all` 并传递对应参数。

---

## 启动前检查

在执行启动命令前，确认以下条件：

1. **配置文件存在** — `~/.ralph/config.json` 可读
2. **有活跃项目** — `activeProject` 已设置
3. **PRD 已就绪** — 对应仓库的 `scripts/ralph/prd.json` 存在
4. **ralph.sh 可用** — 对应仓库或全局的 `scripts/ralph/ralph.sh` 存在

如果条件不满足，给出明确提示：
- 无配置文件 → 提示运行 `ralph init`
- 无活跃项目 → 提示运行 `ralph add-project`
- 无 PRD → 提示运行 `/prd` 创建需求文档，再运行 `/ralph` 转换为 prd.json

---

## AskUserQuestion 调用示例

多仓库项目的交互式选择：

```json
{
  "questions": [
    {
      "question": "如何启动 Ralph 循环？",
      "header": "启动方式",
      "multiSelect": false,
      "options": [
        {
          "label": "启动全部仓库（推荐）",
          "description": "按优先级分阶段编排执行所有仓库的 ralph 循环"
        },
        {
          "label": "启动指定仓库",
          "description": "选择一个特定仓库启动 ralph 循环"
        },
        {
          "label": "启动指定类型",
          "description": "启动指定类型（如 backend、frontend）的所有仓库"
        }
      ]
    }
  ]
}
```

如果用户选择"启动指定仓库"，继续询问：

```json
{
  "questions": [
    {
      "question": "选择要启动的仓库",
      "header": "仓库",
      "multiSelect": false,
      "options": [
        { "label": "docs", "description": "文档仓库 (priority: 0)" },
        { "label": "backend", "description": "后端仓库 (priority: 1)" },
        { "label": "frontend", "description": "前端仓库 (priority: 1)" }
      ]
    }
  ]
}
```

---

## 注意事项

- `ralph run-all` 会自动处理优先级编排、并行执行、日志前缀等
- 单仓库项目无需用户选择，直接启动即可
- 启动后在终端持续输出各仓库的执行日志
- 所有仓库完成后会输出汇总报告
