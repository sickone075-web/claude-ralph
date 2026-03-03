import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { readConfig, writeConfig } from '../lib/global-config.js';

const BRAND = chalk.hex('#6366f1');
const OK = chalk.green;
const ERR = chalk.red;

export async function runAddProject(): Promise<void> {
  console.log(BRAND('\n📁 添加项目\n'));

  const config = readConfig();

  const { name } = await inquirer.prompt<{ name: string }>([
    {
      type: 'input',
      name: 'name',
      message: '项目名称：',
      validate: (input: string) => {
        if (!input.trim()) return '项目名称不能为空';
        if (config.projects.some((p) => p.name === input.trim())) {
          return `项目 "${input.trim()}" 已存在`;
        }
        return true;
      },
    },
  ]);

  const { projectPath } = await inquirer.prompt<{ projectPath: string }>([
    {
      type: 'input',
      name: 'projectPath',
      message: '项目绝对路径：',
      validate: (input: string) => {
        if (!input.trim()) return '路径不能为空';
        const resolved = resolve(input.trim());
        if (!existsSync(resolved)) return `路径不存在：${resolved}`;
        return true;
      },
    },
  ]);

  const resolvedPath = resolve(projectPath.trim());
  config.projects.push({ name: name.trim(), path: resolvedPath });

  if (!config.activeProject) {
    config.activeProject = name.trim();
  }

  writeConfig(config);

  console.log(OK(`\n✅ 项目 "${name.trim()}" 已添加（路径：${resolvedPath}）`));
  if (config.activeProject === name.trim()) {
    console.log(OK(`   已设为活跃项目`));
  }
  console.log('');
}
