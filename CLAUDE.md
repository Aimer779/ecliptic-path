# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

黄道十二宫排序（Ecliptic Path）— 一个纯前端星座排列谜题游戏。玩家需要在有限的挑战次数（初始13次）内，通过同行或同列交换，将打乱的12个黄道星座恢复正确顺序。玩家拥有积分（初始999），可消耗积分在游戏中增加挑战次数。

## Running the Project

无构建步骤、无依赖。直接在浏览器中打开 `index.html` 即可运行。部署时只需 `index.html`、`game.js`、`style.css` 三个文件。

## Architecture

零依赖的原生 HTML/CSS/JavaScript 项目，三文件结构：

- **index.html** — 页面结构，加载 CSS 和 JS
- **game.js** — 全部游戏逻辑，包含数据定义、状态管理、渲染和交互处理
- **style.css** — 宇宙主题视觉样式与动画（星空背景、脉冲/交换/碰撞动效）

### game.js 内部结构

| 区域 | 职责 |
|------|------|
| `ZODIACS` 数组 + `INITIAL_BOARD` | 星座数据定义与初始打乱盘面 |
| `state` 对象 | 集中式可变游戏状态（棋盘、剩余次数、积分、选中项、游戏结束标志） |
| `posToRow()` / `posToCol()` / `isSameRowOrCol()` | 无状态的网格位置计算工具函数 |
| `init()` | 初始化/重置游戏，构建 DOM 网格 |
| `renderBoard()` | 根据 state 驱动 DOM 更新（CSS class 切换） |
| `addChallenge()` | 消耗积分增加挑战次数（仅游戏进行中可用） |
| 点击处理逻辑 | 选择→验证同行同列→交换→判定胜负 |

### 核心游戏机制

- 4列×3行网格，位置索引 0-11 对应星座正确顺序
- 每次点击消耗1次挑战机会，一次完整交换消耗2次
- 仅允许同行或同列的两个格子交换
- 格子归位后显示金色光效和勾号徽章（`cleared` 状态）
- 积分系统：初始999积分，每次消耗5积分可增加1次挑战次数，仅游戏进行中可用

## Conventions

- 常量使用 SCREAMING_SNAKE_CASE（`ZODIACS`、`INITIAL_BOARD`、`COLS`）
- 直接 DOM 操作，无框架
- 动画通过添加/移除 CSS class 触发（`swapping`、`bump`、`pulse`）
- 所有用户界面文本为简体中文
- CSS 使用 `rgba()` 实现透明效果，480px 断点做移动端适配