#!/usr/bin/env node
import inquirer from 'inquirer'; // 命令行交互工具
import { program } from 'commander';  // 命令行处理工具, 主要是做参数解析
import fs from 'fs-extra'; // 是fs的扩展
import path from 'path';
import chalk from 'chalk'; // 命令行输出美化工具
import gitClone from 'git-clone'; // 下载项目模板工具
import ora from 'ora'; // 终端loading美化工具

const projectList = {
  'microFrontend': 'https://github.com/zhangpingg/zc-qiankun.git',
  'vue3': '',
}

// 创建项目的命令
program
  .command('create <app-name>') // 命令的名字  命令：cli-zp create projectName
  .description('创建模板项目')  // 描述
  .option('-f,--force', '如果目录存在则强制删除')
  .action(async (name, option) => {
    const cwd = process.cwd();
    const targetPath = path.join(cwd, name);
    // 如果文件夹存在
    if (fs.existsSync(targetPath)) {
      if (option.force) {
        fs.remove(targetPath)
      } else {
        const res = await inquirer.prompt([
          {
            name: 'action',
            type: 'list',
            message: '是否覆盖已有文件夹?',
            choices: [
              { name: 'YES', value: true },
              { name: 'NO', value: false }
            ]
          }
        ])
        if (!res.action) {
          return
        } else {
          fs.remove(targetPath);
          console.log(chalk.red('已删除之前的文件夹'))
        }
      }
    }
    const res = await inquirer.prompt([
      {
        name: 'type',
        type: 'list',
        message: '请选择使用的框架模板',
        choices: [
          { name: '微前端(Vue3->vue2/vue3)', value: 'microFrontend' },
          { name: 'Vue3', value: 'vue3' }
        ]
      },
    ])
    if (res.type === 'vue3') {
      console.log(chalk.red('暂未开发,不要急哈'))
      return;
    }
    // 拉取项目模板
    const spinner = ora('正在加载项目模板...');
    spinner.start()
    gitClone(
      projectList[res.type],
      targetPath,
      { checkout: 'master' },
      (err) => {
        if (!err) {
          fs.remove(path.resolve(targetPath, '.git'));  // 删除.git文件
          spinner.succeed('项目模板加载完成!');
        } else {
          spinner.fail(chalk.red('项目模板加载失败，请重新获取!'));
        }
      }
    )
  })

// 解析命令行参数
program.parse(process.argv)
