# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个基于 Next.js + ContentLayer 的个人博客站点，使用静态生成（SSG）构建。项目包含文章、作品和页面三种内容类型，支持中英文内容。

## 开发命令

```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview

# 启动生产服务器
npm run start

# 代码检查
npm run lint

# CI脚本
npm run ci

# 打包工具
npm run pack
```

## 技术栈

- **框架**: Next.js 14.2.5 (App Router)
- **样式**: TailwindCSS + DaisyUI
- **内容管理**: ContentLayer2
- **MDX处理**: rehype/remark 插件生态系统
- **类型系统**: TypeScript
- **包管理**: pnpm

## 项目结构

```
├── app/                 # Next.js App Router
│   ├── blog/           # 博客页面
│   ├── writings/       # 文章详情页
│   ├── works/          # 作品详情页
│   ├── layout.tsx      # 根布局
│   └── page.tsx        # 首页
├── components/         # React组件
│   ├── ui/            # 基础UI组件
│   ├── Header.tsx     # 头部导航
│   ├── Footer.tsx     # 页脚
│   └── ThemeProvider.tsx # 主题管理
├── content/           # 内容文件 (MDX)
│   ├── writings/      # 文章内容
│   ├── works/         # 作品内容
│   └── pages/         # 静态页面
├── lib/              # 工具函数
├── public/           # 静态资源
└── out/             # 构建输出目录
```

## 内容类型

1. **文章 (Writings)**: `/content/writings/**/*.mdx`
   - 包含博客、随笔、笔记、故事、翻译等分类
   - 支持数学公式 (KaTeX) 和代码高亮

2. **作品 (Works)**: `/content/works/**/*.mdx`
   - 项目展示和作品集

3. **页面 (Pages)**: `/content/pages/**/*.mdx`
   - 关于页面、微信页面等静态内容

## MDX 功能

- **数学公式**: 通过 remark-math + rehype-katex
- **代码高亮**: 通过 rehype-expressive-code + twoslash
- **表格支持**: 通过 remark-gfm
- **标题锚点**: 通过 rehype-slug + rehype-autolink-headings

## 构建流程

1. ContentLayer 处理 MDX 文件生成类型化数据
2. Next.js 构建静态页面
3. 输出到 `out/` 目录用于部署

## 开发注意事项

- 使用 `npm run dev` 启动开发服务器，会自动处理 ContentLayer 文件变更
- 构建前确保运行 `npm run build` 生成最新的内容
- 样式使用 TailwindCSS 的 prose 类处理文章内容
- 支持暗色/亮色主题切换

## 部署

项目配置为静态导出 (`output: "export"`)，可部署到任何静态托管服务：
- Vercel
- GitHub Pages
- Netlify
- 其他静态文件托管服务