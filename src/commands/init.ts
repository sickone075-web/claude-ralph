import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { platform } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { readConfig, writeConfig, getConfigPath, type RalphConfig } from '../lib/global-config.js';

const BRAND = chalk.hex('#6366f1');
const WARN = chalk.yellow;
const ERR = chalk.red;
const OK = chalk.green;
const DIM = chalk.dim;

const RALPH_LOGO = `
  ██████╗  █████╗ ██╗     ██████╗ ██╗  ██╗
  ██╔══██╗██╔══██╗██║     ██╔══██╗██║  ██║
  ██████╔╝███████║██║     ██████╔╝███████║
  ██╔══██╗██╔══██║██║     ██╔═══╝ ██╔══██║
  ██║  ██║██║  ██║███████╗██║     ██║  ██║
  ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝     ╚═╝  ╚═╝
`;

const GIT_BASH_PATHS = [
  'C:\\Program Files\\Git\\bin\\bash.exe',
  'C:\\devTools\\Git\\bin\\bash.exe',
];

function getPackageVersion(): string {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const pkg = JSON.parse(readFileSync(resolve(__dirname, '../../package.json'), 'utf-8'));
    return pkg.version ?? '0.0.0';
  } catch {
    return '0.0.0';
  }
}

async function stepCheckExistingConfig(): Promise<'overwrite' | 'keep' | 'exit'> {
  const configPath = getConfigPath();
  if (!existsSync(configPath)) return 'overwrite';

  const { action } = await inquirer.prompt<{ action: 'overwrite' | 'keep' | 'exit' }>([
    {
      type: 'list',
      name: 'action',
      message: '检测到已有配置文件 (~/.ralph/config.json)，如何处理？',
      choices: [
        { name: '覆盖 — 重新配置所有选项', value: 'overwrite' },
        { name: '保留 — 跳过已配置项目，仅补充缺失项', value: 'keep' },
        { name: '退出', value: 'exit' },
      ],
    },
  ]);
  return action;
}

async function stepWelcome(version: string): Promise<boolean> {
  console.log(BRAND(RALPH_LOGO));
  console.log(BRAND.bold(`  Ralph v${version}`));
  console.log(DIM('  Ralph 管理工具 — 安装引导、启动控制台、管理项目。'));
  console.log(DIM('  AI 对话请在 Claude Code 中进行。\n'));

  console.log(chalk.bold('  📋 权限声明'));
  console.log('  Ralph 运行过程中需要以下权限：\n');
  console.log('    • Claude Code 执行权限 — 自动运行 AI 编码会话');
  console.log('    • Git 操作 — 创建分支、提交代码');
  console.log('    • 文件读写 — 读写项目文件和配置');
  console.log('    • 网络请求 — 发送飞书通知（可选）\n');

  const { confirmed } = await inquirer.prompt<{ confirmed: boolean }>([
    {
      type: 'confirm',
      name: 'confirmed',
      message: '是否了解并同意上述权限？',
      default: true,
    },
  ]);
  return confirmed;
}

function checkNodeVersion(): boolean {
  const major = parseInt(process.versions.node.split('.')[0], 10);
  if (major >= 18) {
    console.log(OK(`  ✓ Node.js v${process.versions.node}`));
    return true;
  }
  console.log(ERR(`  ✗ Node.js v${process.versions.node} — 需要 >= 18`));
  return false;
}

function checkClaudeCli(): boolean {
  const cmd = platform() === 'win32' ? 'where claude' : 'which claude';
  try {
    execSync(cmd, { stdio: 'pipe' });
    console.log(OK('  ✓ Claude CLI 可用'));
    return true;
  } catch {
    console.log(WARN('  ⚠ Claude CLI 未检测到'));
    console.log(DIM('    安装指引: https://docs.anthropic.com/en/docs/claude-code'));
    console.log(DIM('    可稍后安装，继续初始化...\n'));
    return false;
  }
}

async function stepEnvironment(): Promise<boolean> {
  console.log(chalk.bold('\n  🔍 环境检测\n'));
  const nodeOk = checkNodeVersion();
  if (!nodeOk) {
    console.log(ERR('\n  Node.js 版本不满足要求，请升级到 18 或更高版本。'));
    return false;
  }
  checkClaudeCli();
  return true;
}

async function stepGitBash(config: RalphConfig): Promise<RalphConfig> {
  if (platform() !== 'win32') return config;

  console.log(chalk.bold('\n  🐚 Windows Git Bash 配置\n'));

  // Auto-detect
  let detectedPath = '';
  for (const p of GIT_BASH_PATHS) {
    if (existsSync(p)) {
      detectedPath = p;
      break;
    }
  }

  if (detectedPath) {
    console.log(OK(`  检测到 Git Bash: ${detectedPath}`));
    const { useDetected } = await inquirer.prompt<{ useDetected: boolean }>([
      {
        type: 'confirm',
        name: 'useDetected',
        message: `使用此路径？(${detectedPath})`,
        default: true,
      },
    ]);
    if (useDetected) {
      config.gitBashPath = detectedPath;
      return config;
    }
  } else {
    console.log(WARN('  未自动检测到 Git Bash'));
  }

  // Manual input
  const { manualPath } = await inquirer.prompt<{ manualPath: string }>([
    {
      type: 'input',
      name: 'manualPath',
      message: '请输入 Git Bash (bash.exe) 的完整路径：',
      validate: (input: string) => {
        if (!input.trim()) return '路径不能为空';
        if (!existsSync(input.trim())) return `文件不存在: ${input.trim()}`;
        return true;
      },
    },
  ]);
  config.gitBashPath = manualPath.trim();
  return config;
}

export async function runInit(): Promise<void> {
  const version = getPackageVersion();

  // Step 0: Check existing config
  const action = await stepCheckExistingConfig();
  if (action === 'exit') {
    console.log(DIM('\n  已退出初始化。\n'));
    return;
  }

  // Read existing config (readConfig merges with defaults, so both cases work)
  let config: RalphConfig = readConfig();

  // Step 1: Welcome & permission
  const confirmed = await stepWelcome(version);
  if (!confirmed) {
    console.log(DIM('\n  已退出初始化。\n'));
    return;
  }

  // Step 2: Environment detection
  const envOk = await stepEnvironment();
  if (!envOk) {
    return;
  }

  // Step 3: Git Bash path (Windows only)
  config = await stepGitBash(config);

  // Save config after steps 1-3
  writeConfig(config);
  console.log(OK('\n  ✓ 基础配置已保存'));
  console.log(DIM('  后续步骤将在 US-005 中实现（飞书配置、项目添加等）\n'));
}
