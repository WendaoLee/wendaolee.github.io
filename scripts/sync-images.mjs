#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";

const ROOT_DIR = process.cwd();
const CONTENT_DIR = path.join(ROOT_DIR, "content");
const PUBLIC_IMG_DIR = path.join(ROOT_DIR, "public", "img");

const CONVERTIBLE_EXTS = new Set([".png", ".jpg", ".jpeg", ".bmp", ".tif", ".tiff"]);
const PASSTHROUGH_EXTS = new Set([".webp", ".gif", ".svg", ".avif"]);
const ALL_IMAGE_EXTS = new Set([...CONVERTIBLE_EXTS, ...PASSTHROUGH_EXTS]);

function printHelp() {
  console.log(`用法:
  pnpm run sync-images [mdx文件路径...] [选项]

作用:
  扫描 content/ 下的 .mdx 文件，将 Obsidian 本地粘贴的相对路径图片或 ![[wikilink]] 图片：
  1. 自动转换为 .webp（若已安装 cwebp 或 ffmpeg）
  2. 归档到 public/img/<文章slug>/
  3. 重写 .mdx 中的图片路径为 /img/<文章slug>/<文件名>
  4. 清理 content/ 下的源图片文件与空 img 目录

选项:
  --dry-run        仅预览变更，不写入或删除文件
  --keep-source    保留 content/ 下的源图片文件
  --quality <num>  WebP 压缩质量（1-100，默认 82）
  --help           显示帮助信息`);
}

function commandExists(cmd, args = ["-version"]) {
  const res = spawnSync(cmd, args, { stdio: "ignore" });
  return !res.error && res.status === 0;
}

function detectEncoder() {
  if (commandExists("cwebp", ["-version"])) return "cwebp";
  if (commandExists("ffmpeg", ["-version"])) return "ffmpeg";
  return null;
}

function collectMdxFiles(targetPaths) {
  const files = [];

  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === ".obsidian" || entry.name === "templates") continue;
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith(".mdx")) {
        files.push(fullPath);
      }
    }
  }

  if (targetPaths.length === 0) {
    walk(path.join(CONTENT_DIR, "writings"));
    walk(path.join(CONTENT_DIR, "works"));
    walk(path.join(CONTENT_DIR, "pages"));
  } else {
    for (const p of targetPaths) {
      const resolved = path.resolve(ROOT_DIR, p);
      if (!fs.existsSync(resolved)) {
        console.error(`找不到指定路径: ${p}`);
        process.exit(1);
      }
      const stat = fs.statSync(resolved);
      if (stat.isDirectory()) {
        walk(resolved);
      } else if (resolved.endsWith(".mdx")) {
        files.push(resolved);
      }
    }
  }

  return files;
}

function findFileInContent(filename) {
  let found = null;
  function walk(dir) {
    if (found || !fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === ".obsidian") continue;
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && entry.name === filename) {
        found = fullPath;
        return;
      }
    }
  }
  walk(CONTENT_DIR);
  return found;
}

function decodeSafe(input) {
  try {
    return decodeURIComponent(input);
  } catch {
    return input;
  }
}

function resolveLocalImage(rawTarget, mdxPath) {
  const cleaned = rawTarget
    .trim()
    .replace(/^<(.+)>$/, "$1")
    .split(/\s+["']/)[0]
    .split("#")[0]
    .split("?")[0];

  if (
    !cleaned ||
    /^(https?:)?\/\//i.test(cleaned) ||
    cleaned.startsWith("data:") ||
    cleaned.startsWith("/")
  ) {
    return null;
  }

  const decoded = decodeSafe(cleaned);
  const mdxDir = path.dirname(mdxPath);
  const noteName = path.basename(mdxPath, path.extname(mdxPath));

  const candidates = [
    path.resolve(mdxDir, decoded),
    path.resolve(CONTENT_DIR, decoded),
    path.resolve(mdxDir, "img", noteName, decoded),
    path.resolve(mdxDir, "img", decoded),
    path.resolve(CONTENT_DIR, "img", noteName, decoded),
    path.resolve(CONTENT_DIR, "img", decoded),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      const ext = path.extname(candidate).toLowerCase();
      if (ALL_IMAGE_EXTS.has(ext)) {
        return candidate;
      }
    }
  }

  // Fallback: Obsidian wikilinks often only contain the basename
  if (!decoded.includes("/") && !decoded.includes("\\")) {
    const found = findFileInContent(decoded);
    if (found && ALL_IMAGE_EXTS.has(path.extname(found).toLowerCase())) {
      return found;
    }
  }

  return { missing: decoded };
}

function convertOrCopyImage(srcPath, destPath, encoder, quality) {
  const ext = path.extname(srcPath).toLowerCase();
  fs.mkdirSync(path.dirname(destPath), { recursive: true });

  if (CONVERTIBLE_EXTS.has(ext) && encoder) {
    if (encoder === "cwebp") {
      const res = spawnSync("cwebp", ["-q", String(quality), srcPath, "-o", destPath], {
        stdio: "pipe",
      });
      if (res.status === 0) return true;
    } else if (encoder === "ffmpeg") {
      const res = spawnSync(
        "ffmpeg",
        ["-y", "-loglevel", "error", "-i", srcPath, "-q:v", String(quality), destPath],
        { stdio: "pipe" }
      );
      if (res.status === 0) return true;
    }
    throw new Error(`图片转换失败 (${encoder}): ${srcPath}`);
  }

  fs.copyFileSync(srcPath, destPath);
  return false;
}

function pruneEmptyDirs(dir) {
  let current = dir;
  while (current.startsWith(CONTENT_DIR) && current !== CONTENT_DIR) {
    try {
      const entries = fs.readdirSync(current);
      if (entries.length > 0) break;
      fs.rmdirSync(current);
      current = path.dirname(current);
    } catch {
      break;
    }
  }
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// Parse CLI arguments
const rawArgs = process.argv.slice(2).filter((arg) => arg !== "--");
let dryRun = false;
let keepSource = false;
let quality = 82;
const targetPaths = [];

for (let i = 0; i < rawArgs.length; i++) {
  const arg = rawArgs[i];
  if (arg === "--help" || arg === "-h") {
    printHelp();
    process.exit(0);
  } else if (arg === "--dry-run") {
    dryRun = true;
  } else if (arg === "--keep-source") {
    keepSource = true;
  } else if (arg === "--quality") {
    const next = Number(rawArgs[++i]);
    if (!Number.isInteger(next) || next < 1 || next > 100) {
      console.error("--quality 需要 1 到 100 之间的整数");
      process.exit(1);
    }
    quality = next;
  } else if (arg.startsWith("--")) {
    console.error(`未知选项: ${arg}`);
    process.exit(1);
  } else {
    targetPaths.push(arg);
  }
}

const encoder = detectEncoder();
if (!encoder) {
  console.warn("警告: 未检测到 cwebp 或 ffmpeg，图片将直接复制原格式而不转换为 .webp。");
}

const mdxFiles = collectMdxFiles(targetPaths);
const processedSources = new Map();
const sourcesToDelete = new Set();

let totalImages = 0;
let totalUpdatedFiles = 0;
let totalSrcBytes = 0;
let totalDestBytes = 0;
const warnings = [];

function processImageRef(rawTarget, altText, mdxPath, slug) {
  const resolved = resolveLocalImage(rawTarget, mdxPath);
  if (!resolved) return null;

  if (typeof resolved === "object" && resolved.missing) {
    warnings.push(
      `[未找到图片] ${path.relative(ROOT_DIR, mdxPath)}: ${resolved.missing}`
    );
    return null;
  }

  const srcPath = resolved;
  const srcExt = path.extname(srcPath).toLowerCase();
  const baseName = path
    .basename(srcPath, srcExt)
    .trim()
    .replace(/\s+/g, "-");
  const willConvert = CONVERTIBLE_EXTS.has(srcExt) && Boolean(encoder);
  const outExt = willConvert ? ".webp" : srcExt;
  const outFileName = `${baseName}${outExt}`;
  const destPath = path.join(PUBLIC_IMG_DIR, slug, outFileName);
  const webPath = `/img/${slug}/${outFileName}`;

  if (!processedSources.has(srcPath)) {
    const srcSize = fs.statSync(srcPath).size;
    totalSrcBytes += srcSize;

    if (!dryRun) {
      convertOrCopyImage(srcPath, destPath, encoder, quality);
      totalDestBytes += fs.statSync(destPath).size;
    }

    processedSources.set(srcPath, webPath);
    if (!keepSource && srcPath.startsWith(CONTENT_DIR)) {
      sourcesToDelete.add(srcPath);
    }

    totalImages++;
    const relSrc = path.relative(ROOT_DIR, srcPath).replace(/\\/g, "/");
    const relDest = path.relative(ROOT_DIR, destPath).replace(/\\/g, "/");
    console.log(
      `${dryRun ? "[dry-run] " : ""}${relSrc} -> ${relDest}${willConvert ? " (webp)" : ""}`
    );
  }

  const finalWebPath = processedSources.get(srcPath);
  return `![${altText}](${encodeURI(finalWebPath)})`;
}

for (const mdxPath of mdxFiles) {
  const original = fs.readFileSync(mdxPath, "utf8");
  const slug = path.basename(mdxPath, path.extname(mdxPath));
  const eol = original.includes("\r\n") ? "\r\n" : "\n";
  const lines = original.split(/\r?\n/);

  let inFence = false;
  let fenceChar = "";
  let fenceLen = 0;
  let changed = false;

  const updatedLines = lines.map((line) => {
    const trimmed = line.trimStart();
    const fenceMatch = trimmed.match(/^(`{3,}|~{3,})/);
    if (fenceMatch) {
      const marker = fenceMatch[1];
      if (!inFence) {
        inFence = true;
        fenceChar = marker[0];
        fenceLen = marker.length;
      } else if (
        marker[0] === fenceChar &&
        marker.length >= fenceLen &&
        trimmed.slice(marker.length).trim() === ""
      ) {
        inFence = false;
        fenceChar = "";
        fenceLen = 0;
      }
      return line;
    }

    if (inFence) return line;

    // 1. Obsidian wikilink images: ![[path/to/img.png]] or ![[img.png|caption]]
    let nextLine = line.replace(/!\[\[([^\]|]+)(?:\|([^\]]*))?\]\]/g, (full, target, alias) => {
      const trimmedAlias = (alias ?? "").trim();
      const alt = /^\d+(x\d+)?$/i.test(trimmedAlias) ? "" : trimmedAlias;
      const replacement = processImageRef(target, alt, mdxPath, slug);
      if (replacement) {
        changed = true;
        return replacement;
      }
      return full;
    });

    // 2. Standard Markdown images: ![alt](relative/path.png)
    nextLine = nextLine.replace(/!\[([^\]]*)\]\(([^)\n]+)\)/g, (full, alt, target) => {
      const replacement = processImageRef(target, alt, mdxPath, slug);
      if (replacement) {
        changed = true;
        return replacement;
      }
      return full;
    });

    return nextLine;
  });

  if (changed) {
    totalUpdatedFiles++;
    if (!dryRun) {
      fs.writeFileSync(mdxPath, updatedLines.join(eol), "utf8");
    }
    console.log(
      `${dryRun ? "[dry-run] " : ""}更新引用: ${path.relative(ROOT_DIR, mdxPath).replace(/\\/g, "/")}`
    );
  }
}

if (!dryRun && !keepSource) {
  for (const srcPath of sourcesToDelete) {
    if (fs.existsSync(srcPath)) {
      fs.unlinkSync(srcPath);
      pruneEmptyDirs(path.dirname(srcPath));
    }
  }
}

if (warnings.length > 0) {
  console.log("\n提示:");
  for (const w of warnings) console.warn(`  ${w}`);
}

console.log("");
if (totalImages === 0) {
  console.log(`扫描完成（共检查 ${mdxFiles.length} 篇文档），没有发现需要同步的本地图片。`);
} else {
  const sizeNote =
    !dryRun && totalSrcBytes > 0
      ? `，体积 ${formatBytes(totalSrcBytes)} -> ${formatBytes(totalDestBytes)}`
      : "";
  console.log(
    `${dryRun ? "[dry-run] " : ""}同步完成：处理 ${totalImages} 张图片，更新 ${totalUpdatedFiles} 篇文档${sizeNote}。`
  );
}
