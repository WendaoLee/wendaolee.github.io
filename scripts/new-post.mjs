#!/usr/bin/env node
import fs from "fs";
import path from "path";

const TYPE_CONFIG = {
  blog: {
    dir: "content/writings/blog",
    category: "blog",
    prefix: "【Blog】",
  },
  essay: {
    dir: "content/writings/essay",
    category: "essay",
    prefix: "【Essay】",
  },
  note: {
    dir: "content/writings/notes",
    category: "note",
    prefix: "【Note】",
  },
  translation: {
    dir: "content/writings/translations",
    category: "translation",
    prefix: "【Translation】",
    defaultTags: ["翻译"],
    extraBody: "原文地址：\n\n",
  },
  story: {
    dir: "content/writings/story",
    category: "story",
    prefix: "【Novel】",
  },
  work: {
    dir: "content/works/wip",
    category: "wip",
    prefix: "",
  },
};

function printHelp() {
  console.log(`用法:
  pnpm run new <type> <slug> [title] [--publish]

参数:
  type        文章类型: ${Object.keys(TYPE_CONFIG).join(" | ")}
  slug        英文文件名/URL 路径 (如 my-new-post)
  title       可选，文章标题（会自动补齐分类前缀）
  --publish   可选，直接将 draft 设为 false（默认创建为草稿 draft: true）

示例:
  pnpm run new blog nextjs-tips "Next.js 静态导出踩坑记录"
  pnpm run new essay autumn-notes "秋日随想"
  pnpm run new translation ai-agents "构建高效的 AI Agent"`);
}

function getTodayDate() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function normalizeSlug(raw) {
  return raw
    .trim()
    .replace(/\.mdx?$/i, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9_-]/g, "");
}

function formatYamlValue(value) {
  if (/[:#\[\]{},&*!?|<>=%@`"']/.test(value)) {
    return JSON.stringify(value);
  }
  return value;
}

const rawArgs = process.argv.slice(2).filter((arg) => arg !== "--");
const flags = new Set(rawArgs.filter((arg) => arg.startsWith("--")));
const positional = rawArgs.filter((arg) => !arg.startsWith("--"));

if (flags.has("--help") || flags.has("-h") || positional.length < 2) {
  printHelp();
  process.exit(positional.length < 2 && !flags.has("--help") ? 1 : 0);
}

const [rawType, rawSlug, ...titleParts] = positional;
const typeKey = rawType.toLowerCase();
const config = TYPE_CONFIG[typeKey];

if (!config) {
  console.error(`不支持的类型 "${rawType}"。可选值: ${Object.keys(TYPE_CONFIG).join(", ")}`);
  process.exit(1);
}

const slug = normalizeSlug(rawSlug);
if (!slug) {
  console.error(`无效的 slug "${rawSlug}"，请使用英文、数字、短横线或下划线。`);
  process.exit(1);
}

const rawTitle = titleParts.join(" ").trim() || slug;
const fullTitle =
  config.prefix && !rawTitle.startsWith("【")
    ? `${config.prefix}${rawTitle}`
    : rawTitle;

const targetDir = path.resolve(process.cwd(), config.dir);
const targetFile = path.join(targetDir, `${slug}.mdx`);

if (fs.existsSync(targetFile)) {
  console.error(`文件已存在: ${path.relative(process.cwd(), targetFile)}`);
  process.exit(1);
}

const tags = config.defaultTags ?? [];
const tagsBlock =
  tags.length > 0
    ? `tags:\n${tags.map((t) => `  - ${formatYamlValue(t)}`).join("\n")}`
    : `tags: []`;

const isDraft = !flags.has("--publish");
const frontmatter = `---
title: ${formatYamlValue(fullTitle)}
description: 
category: ${config.category}
${tagsBlock}
date: ${getTodayDate()}
draft: ${isDraft}
---

${config.extraBody ?? ""}## 
`;

fs.mkdirSync(targetDir, { recursive: true });
fs.writeFileSync(targetFile, frontmatter, "utf8");

const relPath = path.relative(process.cwd(), targetFile).replace(/\\/g, "/");
console.log(`已创建新文章: ${relPath}`);
console.log(`当前状态: ${isDraft ? "草稿 (draft: true，仅本地 dev 可见)" : "已发布 (draft: false)"}`);
console.log(`下一步: 在 Obsidian 中打开 content/ 仓库编辑；发布前运行 pnpm run sync-images 同步并压缩图片，然后将 draft 改为 false。`);
