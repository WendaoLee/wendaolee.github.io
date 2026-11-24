'use strict';

const fs = require('fs');
const path = require('path');
const { Plugin, PluginSettingTab, Setting, Notice, Modal, TFile, TFolder } = require('obsidian');

const DEFAULT_SETTINGS = {
  publicDirRelative: '../public',
  imageSubDir: 'img',
  convertToWebp: true,
  webpQuality: 0.82,
  useSlugSubfolder: true,
  autoInsertFrontmatter: true,
  defaultDraft: true,
};

const MIME_BY_EXT = {
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif',
  '.bmp': 'image/bmp',
  '.ico': 'image/x-icon',
};

const EXT_BY_MIME = {
  'image/webp': '.webp',
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/gif': '.gif',
  'image/svg+xml': '.svg',
  'image/avif': '.avif',
  'image/bmp': '.bmp',
};

const CONVERTIBLE_MIMES = new Set([
  'image/png',
  'image/jpeg',
  'image/bmp',
  'image/tiff',
]);

const WRITING_DIR_RULES = {
  blog: {
    category: 'blog',
    prefix: '【Blog】',
    defaultTags: [],
    body: '## \n',
  },
  essay: {
    category: 'essay',
    prefix: '【Essay】',
    defaultTags: [],
    body: '## \n',
  },
  notes: {
    category: 'note',
    prefix: '【Note】',
    defaultTags: [],
    body: '## \n',
  },
  translations: {
    category: 'translation',
    prefix: '【Translation】',
    defaultTags: ['翻译'],
    body: '原文地址：\n\n## \n',
  },
  story: {
    category: 'story',
    prefix: '【Novel】',
    defaultTags: [],
    body: '',
  },
};

function decodeSafe(str) {
  try {
    return decodeURIComponent(str);
  } catch {
    return str;
  }
}

function formatDateYmd(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function formatTimestamp(date) {
  const pad = (n, len = 2) => String(n).padStart(len, '0');
  return (
    String(date.getFullYear()) +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    pad(date.getSeconds()) +
    pad(date.getMilliseconds(), 3)
  );
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function sanitizeSegment(segment) {
  return segment
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '-')
    .replace(/\s+/g, '-');
}

function formatYamlValue(value) {
  if (/[:#\[\]{},&*!?|<>=%@`"']/.test(value)) {
    return JSON.stringify(value);
  }
  return value;
}

function encodeWebPath(webPath) {
  return webPath
    .split('/')
    .map((seg, idx) => (idx === 0 ? '' : encodeURIComponent(seg)))
    .join('/');
}

/**
 * Build directory-aware MDX frontmatter for a vault-relative file path.
 * Returns null for ignored directories (such as templates/ or .obsidian/).
 */
function buildFrontmatterForVaultPath(vaultFilePath, { customTitle = '', defaultDraft = true, now = new Date() } = {}) {
  const normalized = vaultFilePath.replace(/\\/g, '/').replace(/^\/+/, '');
  const parts = normalized.split('/');
  if (parts.length < 2) return null;

  const topDir = parts[0];
  if (topDir === 'templates' || topDir === '.obsidian') return null;

  const fileName = parts[parts.length - 1];
  const basename = fileName.replace(/\.mdx?$/i, '');
  const rawTitle = (customTitle || '').trim() || basename;
  const dateStr = formatDateYmd(now);

  if (topDir === 'writings') {
    const subDir = parts[1];
    const rule = WRITING_DIR_RULES[subDir];
    if (!rule) {
      // Fallback for unknown subdirectory under writings/
      return `---
title: ${formatYamlValue(rawTitle)}
description: 
category: ${formatYamlValue(subDir)}
tags: []
date: ${dateStr}
draft: ${defaultDraft}
---

## 
`;
    }

    const fullTitle =
      rule.prefix && !rawTitle.startsWith('【') ? `${rule.prefix}${rawTitle}` : rawTitle;
    const tagsBlock =
      rule.defaultTags.length > 0
        ? `tags:\n${rule.defaultTags.map((t) => `  - ${formatYamlValue(t)}`).join('\n')}`
        : 'tags: []';

    return `---
title: ${formatYamlValue(fullTitle)}
description: 
category: ${rule.category}
${tagsBlock}
date: ${dateStr}
draft: ${defaultDraft}
---

${rule.body}`;
  }

  if (topDir === 'works') {
    const category = parts.length >= 3 ? parts[1] : 'wip';
    return `---
title: ${formatYamlValue(rawTitle)}
description: 
category: ${formatYamlValue(category)}
tags: []
date: ${dateStr}
draft: ${defaultDraft}
---

## 
`;
  }

  if (topDir === 'pages') {
    return `---
title: ${formatYamlValue(rawTitle)}
description: 
draft: ${defaultDraft}
---

`;
  }

  return null;
}

function isBlogContentFolder(folderPath) {
  const normalized = (folderPath || '').replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');
  return (
    normalized === 'writings' ||
    normalized.startsWith('writings/') ||
    normalized === 'works' ||
    normalized.startsWith('works/') ||
    normalized === 'pages' ||
    normalized.startsWith('pages/')
  );
}

async function convertBlobToWebp(file, quality) {
  if (typeof createImageBitmap !== 'function' || typeof document === 'undefined') {
    return null;
  }

  let bitmap = null;
  try {
    bitmap = await createImageBitmap(file);
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(bitmap, 0, 0);

    const webpBlob = await new Promise((resolve) => {
      canvas.toBlob((b) => resolve(b), 'image/webp', quality);
    });

    if (!webpBlob || webpBlob.type !== 'image/webp' || webpBlob.size === 0) {
      return null;
    }

    return Buffer.from(await webpBlob.arrayBuffer());
  } catch {
    return null;
  } finally {
    if (bitmap && typeof bitmap.close === 'function') {
      bitmap.close();
    }
  }
}

class CreateMdxModal extends Modal {
  constructor(app, plugin, folderPath) {
    super(app);
    this.plugin = plugin;
    this.folderPath = folderPath;
    this.slug = '';
    this.articleTitle = '';
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl('h3', { text: `新建 MDX 文章 (${this.folderPath})` });

    new Setting(contentEl)
      .setName('文件名 (Slug)')
      .setDesc('建议使用英文短横线命名，如 my-new-post（自动补 .mdx 后缀）')
      .addText((text) => {
        text.setPlaceholder('my-new-post').onChange((value) => {
          this.slug = value;
        });
        text.inputEl.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            void this.submit();
          }
        });
        setTimeout(() => text.inputEl.focus(), 10);
      });

    new Setting(contentEl)
      .setName('文章标题（可选）')
      .setDesc('留空则使用文件名，系统会自动补齐分类前缀（如 【Blog】）')
      .addText((text) => {
        text.setPlaceholder('输入中文或英文标题').onChange((value) => {
          this.articleTitle = value;
        });
        text.inputEl.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            void this.submit();
          }
        });
      });

    new Setting(contentEl).addButton((btn) =>
      btn
        .setButtonText('创建')
        .setCta()
        .onClick(() => void this.submit())
    );
  }

  async submit() {
    const cleanSlug = sanitizeSegment(this.slug.replace(/\.mdx?$/i, ''));
    if (!cleanSlug) {
      new Notice('请输入有效的文件名');
      return;
    }

    const filePath = `${this.folderPath.replace(/\/+$/, '')}/${cleanSlug}.mdx`;
    if (this.app.vault.getAbstractFileByPath(filePath)) {
      new Notice(`文件已存在: ${filePath}`);
      return;
    }

    const content =
      buildFrontmatterForVaultPath(filePath, {
        customTitle: this.articleTitle,
        defaultDraft: this.plugin.settings.defaultDraft,
      }) || '';

    try {
      this.plugin.insertingFrontmatter.add(filePath);
      const created = await this.app.vault.create(filePath, content);
      this.close();
      const leaf = this.app.workspace.getLeaf(false);
      await leaf.openFile(created);
      new Notice(`已创建: ${filePath}`);
    } catch (err) {
      new Notice(`创建失败: ${err && err.message ? err.message : String(err)}`);
    } finally {
      setTimeout(() => this.plugin.insertingFrontmatter.delete(filePath), 500);
    }
  }

  onClose() {
    this.contentEl.empty();
  }
}

class BlogPublicImagesPlugin extends Plugin {
  async onload() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    this.blobCache = new Map(); // absPath -> { mtimeMs, url }
    this.pendingScanNodes = new Set();
    this.scanScheduled = false;
    this.insertingFrontmatter = new Set();

    this.addSettingTab(new BlogPublicImagesSettingTab(this.app, this));

    // 1. Reading View post-processor
    this.registerMarkdownPostProcessor((el, ctx) => {
      this.scanContainer(el, ctx ? ctx.sourcePath : '');
    });

    // 2. Live Preview & dynamic DOM observer
    this.observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes') {
          if (mutation.target instanceof HTMLElement) {
            this.queueScan(mutation.target);
          }
        } else if (mutation.type === 'childList') {
          if (mutation.target instanceof HTMLElement) {
            const parentEmbed = mutation.target.closest('.internal-embed[src]');
            if (parentEmbed instanceof HTMLElement) {
              this.queueScan(parentEmbed);
            }
          }
          for (const node of mutation.addedNodes) {
            if (node instanceof HTMLElement) {
              this.queueScan(node);
            }
          }
        }
      }
    });

    const observeRoot = this.app.workspace.containerEl || document.body;
    this.observer.observe(observeRoot, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['src', 'class'],
    });

    // 3. Re-scan when switching tabs / files / layout
    this.registerEvent(
      this.app.workspace.on('active-leaf-change', (leaf) => {
        if (leaf && leaf.view && leaf.view.containerEl) {
          this.queueScan(leaf.view.containerEl);
        }
      })
    );
    this.registerEvent(
      this.app.workspace.on('layout-change', () => {
        this.queueScan(this.app.workspace.containerEl || document.body);
      })
    );
    this.registerEvent(
      this.app.workspace.on('file-open', () => {
        const activeLeaf = this.app.workspace.activeLeaf;
        if (activeLeaf && activeLeaf.view && activeLeaf.view.containerEl) {
          this.queueScan(activeLeaf.view.containerEl);
        }
      })
    );

    // 4. Paste & drag-drop image interception -> save directly to ../public/img/<slug>/
    this.registerEvent(
      this.app.workspace.on('editor-paste', (evt, editor, info) => {
        this.handleTransferEvent(evt, editor, info, evt.clipboardData);
      })
    );
    this.registerEvent(
      this.app.workspace.on('editor-drop', (evt, editor, info) => {
        this.handleTransferEvent(evt, editor, info, evt.dataTransfer);
      })
    );

    // 5. Folder context menu: "新建 MDX 文章"
    this.registerEvent(
      this.app.workspace.on('file-menu', (menu, file) => {
        if (file instanceof TFolder && isBlogContentFolder(file.path)) {
          menu.addItem((item) => {
            item
              .setTitle('新建 MDX 文章（自动带 Frontmatter）')
              .setIcon('file-plus')
              .onClick(() => {
                new CreateMdxModal(this.app, this, file.path).open();
              });
          });
        }
      })
    );

    // 6. Commands
    this.addCommand({
      id: 'refresh-public-images',
      name: '刷新当前页 public 目录图片预览',
      callback: () => {
        this.clearBlobCache();
        const root = this.app.workspace.containerEl || document.body;
        root.querySelectorAll('[data-blog-public-src]').forEach((el) => {
          delete el.dataset.blogPublicSrc;
        });
        this.scanContainer(root);
        new Notice('已刷新 public 图片预览缓存');
      },
    });

    this.addCommand({
      id: 'create-mdx-in-current-folder',
      name: '在当前目录新建 MDX 文章',
      callback: () => {
        const activeFile = this.app.workspace.getActiveFile();
        const parentPath =
          activeFile && activeFile.parent && isBlogContentFolder(activeFile.parent.path)
            ? activeFile.parent.path
            : 'writings/blog';
        new CreateMdxModal(this.app, this, parentPath).open();
      },
    });

    this.addCommand({
      id: 'insert-frontmatter-for-current-mdx',
      name: '为当前文件插入对应目录的 Frontmatter 头',
      callback: async () => {
        const activeFile = this.app.workspace.getActiveFile();
        if (!activeFile) {
          new Notice('请先打开一个文章文件');
          return;
        }
        const existing = await this.app.vault.read(activeFile);
        if (existing.trimStart().startsWith('---')) {
          new Notice('当前文件已包含 Frontmatter');
          return;
        }
        const fm = buildFrontmatterForVaultPath(activeFile.path, {
          defaultDraft: this.settings.defaultDraft,
        });
        if (!fm) {
          new Notice('当前目录不在 writings/、works/ 或 pages/ 下');
          return;
        }
        await this.app.vault.modify(activeFile, fm + existing);
        new Notice('已根据当前目录插入 Frontmatter');
      },
    });

    // 7. Register vault create/rename hooks AFTER layout is ready to avoid initial indexing flood
    this.app.workspace.onLayoutReady(() => {
      this.scanContainer(this.app.workspace.containerEl || document.body);

      this.registerEvent(
        this.app.vault.on('create', (file) => {
          if (file instanceof TFile && file.extension.toLowerCase() === 'mdx') {
            this.scheduleAutoFrontmatter(file);
          }
        })
      );

      this.registerEvent(
        this.app.vault.on('rename', (file, oldPath) => {
          if (
            file instanceof TFile &&
            file.extension.toLowerCase() === 'mdx' &&
            !String(oldPath || '').toLowerCase().endsWith('.mdx')
          ) {
            this.scheduleAutoFrontmatter(file);
          }
        })
      );
    });
  }

  onunload() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.clearBlobCache();
  }

  async saveSettings() {
    await this.saveData(this.settings);
    this.clearBlobCache();
    this.queueScan(this.app.workspace.containerEl || document.body);
  }

  scheduleAutoFrontmatter(file) {
    if (!this.settings.autoInsertFrontmatter) return;
    if (this.insertingFrontmatter.has(file.path)) return;

    const fm = buildFrontmatterForVaultPath(file.path, {
      defaultDraft: this.settings.defaultDraft,
    });
    if (!fm) return;

    this.insertingFrontmatter.add(file.path);
    setTimeout(async () => {
      try {
        const currentFile = this.app.vault.getAbstractFileByPath(file.path);
        if (!(currentFile instanceof TFile)) return;

        const existing = await this.app.vault.read(currentFile);
        if (existing.trim().length > 0) return;

        await this.app.vault.modify(currentFile, fm);
        new Notice(`已自动插入 Frontmatter (${currentFile.path})`);
      } catch (err) {
        console.error('[blog-public-images] Failed to insert frontmatter:', err);
      } finally {
        setTimeout(() => this.insertingFrontmatter.delete(file.path), 500);
      }
    }, 80);
  }

  getVaultBasePath() {
    const adapter = this.app.vault && this.app.vault.adapter;
    if (adapter && typeof adapter.getBasePath === 'function') {
      return adapter.getBasePath();
    }
    return null;
  }

  getPublicDir() {
    const basePath = this.getVaultBasePath();
    if (!basePath) return null;
    return path.resolve(basePath, this.settings.publicDirRelative || '../public');
  }

  clearBlobCache() {
    for (const entry of this.blobCache.values()) {
      try {
        URL.revokeObjectURL(entry.url);
      } catch {
        // Ignore revoke errors
      }
    }
    this.blobCache.clear();
  }

  /**
   * Resolve a raw src string (e.g. "/img/foo/bar.webp", "img/foo/bar.webp",
   * or "app://obsidian.md/img/foo/bar.webp") into an existing image file under public/.
   */
  resolvePublicImageFile(rawSrc, { allowWithoutLeadingSlash = false, sourcePath = '' } = {}) {
    if (!rawSrc || typeof rawSrc !== 'string') return null;
    const trimmed = rawSrc.trim();
    if (
      !trimmed ||
      trimmed.startsWith('blob:') ||
      trimmed.startsWith('data:') ||
      trimmed.startsWith('http://') ||
      trimmed.startsWith('https://') ||
      trimmed.startsWith('//')
    ) {
      return null;
    }

    let candidatePath = null;
    if (trimmed.startsWith('app://obsidian.md/')) {
      try {
        candidatePath = new URL(trimmed).pathname;
      } catch {
        return null;
      }
    } else if (trimmed.startsWith('app://')) {
      return null;
    } else if (trimmed.startsWith('/')) {
      candidatePath = trimmed;
    } else if (allowWithoutLeadingSlash) {
      candidatePath = '/' + trimmed;
    } else {
      return null;
    }

    const cleanRel = candidatePath.split('#')[0].split('?')[0].replace(/\/{2,}/g, '/');
    const decodedRel = decodeSafe(cleanRel);
    const ext = path.extname(decodedRel).toLowerCase();
    if (!MIME_BY_EXT[ext]) return null;

    if (allowWithoutLeadingSlash && !trimmed.startsWith('/')) {
      const vaultRel = decodedRel.replace(/^\/+/, '');
      const existingInVault =
        this.app.metadataCache &&
        typeof this.app.metadataCache.getFirstLinkpathDest === 'function' &&
        this.app.metadataCache.getFirstLinkpathDest(vaultRel, sourcePath);
      if (existingInVault) return null;
    }

    const publicDir = this.getPublicDir();
    if (!publicDir) return null;

    const resolved = path.resolve(publicDir, `.${decodedRel}`);
    const normalizedPublic = path.resolve(publicDir) + path.sep;
    if (!resolved.startsWith(normalizedPublic)) {
      return null;
    }

    try {
      const stat = fs.statSync(resolved);
      if (!stat.isFile()) return null;
      return { absPath: resolved, mtimeMs: stat.mtimeMs, ext };
    } catch {
      return null;
    }
  }

  async getBlobUrl(fileInfo) {
    const cached = this.blobCache.get(fileInfo.absPath);
    if (cached && cached.mtimeMs === fileInfo.mtimeMs) {
      return cached.url;
    }

    const buf = await fs.promises.readFile(fileInfo.absPath);
    const mime = MIME_BY_EXT[fileInfo.ext] || 'application/octet-stream';
    const url = URL.createObjectURL(new Blob([buf], { type: mime }));

    if (cached) {
      try {
        URL.revokeObjectURL(cached.url);
      } catch {
        // Ignore revoke errors
      }
    }

    this.blobCache.set(fileInfo.absPath, { mtimeMs: fileInfo.mtimeMs, url });
    return url;
  }

  queueScan(node) {
    this.pendingScanNodes.add(node);
    if (this.scanScheduled) return;
    this.scanScheduled = true;
    requestAnimationFrame(() => {
      this.scanScheduled = false;
      const nodes = Array.from(this.pendingScanNodes);
      this.pendingScanNodes.clear();
      const activeFile = this.app.workspace.getActiveFile();
      const sourcePath = activeFile ? activeFile.path : '';
      for (const n of nodes) {
        if (n.isConnected) {
          this.scanContainer(n, sourcePath);
        }
      }
    });
  }

  scanContainer(root, sourcePath = '') {
    if (!root || !(root instanceof HTMLElement)) return;

    if (root.tagName === 'IMG') {
      void this.hydrateImgElement(root, sourcePath);
    } else {
      const imgs = root.querySelectorAll('img');
      for (const img of imgs) {
        void this.hydrateImgElement(img, sourcePath);
      }
    }

    if (root.classList && root.classList.contains('internal-embed')) {
      void this.hydrateEmbedElement(root, sourcePath);
    } else {
      const embeds = root.querySelectorAll('.internal-embed[src]');
      for (const embed of embeds) {
        void this.hydrateEmbedElement(embed, sourcePath);
      }
    }
  }

  async hydrateImgElement(img, sourcePath) {
    const rawSrc = img.getAttribute('src');
    if (!rawSrc || rawSrc.startsWith('blob:') || rawSrc.startsWith('data:')) return;
    if (img.dataset.blogPublicSrc === rawSrc) return;

    const fileInfo = this.resolvePublicImageFile(rawSrc, {
      allowWithoutLeadingSlash: false,
      sourcePath,
    });
    if (!fileInfo) return;

    img.dataset.blogPublicSrc = rawSrc;
    try {
      const blobUrl = await this.getBlobUrl(fileInfo);
      if (img.isConnected) {
        img.src = blobUrl;
      }
    } catch {
      delete img.dataset.blogPublicSrc;
    }
  }

  async hydrateEmbedElement(embed, sourcePath) {
    const rawSrc = embed.getAttribute('src');
    if (!rawSrc) return;

    const existingImg = embed.querySelector('img[data-blog-public-embed="true"]');
    if (embed.dataset.blogPublicSrc === rawSrc && existingImg) {
      return;
    }

    const fileInfo = this.resolvePublicImageFile(rawSrc, {
      allowWithoutLeadingSlash: true,
      sourcePath,
    });
    if (!fileInfo) return;

    embed.dataset.blogPublicSrc = rawSrc;
    try {
      const blobUrl = await this.getBlobUrl(fileInfo);
      if (!embed.isConnected) return;

      const alt = embed.getAttribute('alt') || '';
      embed.classList.add('media-embed', 'image-embed', 'is-loaded', 'blog-public-image-embed');
      embed.empty ? embed.empty() : (embed.innerHTML = '');

      const img = document.createElement('img');
      img.src = blobUrl;
      img.alt = alt;
      img.dataset.blogPublicEmbed = 'true';
      img.dataset.blogPublicSrc = rawSrc;
      embed.appendChild(img);
    } catch {
      delete embed.dataset.blogPublicSrc;
    }
  }

  extractImageFiles(transfer) {
    if (!transfer) return [];
    const results = [];

    if (transfer.files && transfer.files.length > 0) {
      for (const file of Array.from(transfer.files)) {
        const ext = path.extname(file.name || '').toLowerCase();
        if ((file.type && file.type.startsWith('image/')) || MIME_BY_EXT[ext]) {
          results.push(file);
        }
      }
    } else if (transfer.items && transfer.items.length > 0) {
      for (const item of Array.from(transfer.items)) {
        if (item.kind === 'file' && item.type && item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) results.push(file);
        }
      }
    }

    return results;
  }

  handleTransferEvent(evt, editor, info, transfer) {
    const imageFiles = this.extractImageFiles(transfer);
    if (imageFiles.length === 0) return;

    const activeFile = (info && info.file) || this.app.workspace.getActiveFile();
    if (!activeFile) return;

    const publicDir = this.getPublicDir();
    if (!publicDir) {
      new Notice('Blog Public Images: 无法定位仓库根目录');
      return;
    }

    evt.preventDefault();
    evt.stopPropagation();

    void this.saveAndInsertImages(imageFiles, editor, activeFile, publicDir);
  }

  async saveAndInsertImages(files, editor, activeFile, publicDir) {
    const subDir = (this.settings.imageSubDir || 'img').replace(/^\/+|\/+$/g, '');
    const slug = sanitizeSegment(activeFile.basename || 'misc') || 'misc';
    const targetDir = this.settings.useSlugSubfolder
      ? path.join(publicDir, subDir, slug)
      : path.join(publicDir, subDir);

    fs.mkdirSync(targetDir, { recursive: true });

    const placeholder = `<!-- uploading-blog-image-${Date.now()}-${Math.random().toString(36).slice(2, 7)} -->`;
    editor.replaceSelection(placeholder);

    const markdownLines = [];
    const savedNotices = [];

    try {
      const baseTs = formatTimestamp(new Date());

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const mime = (file.type || '').toLowerCase();
        const origExt =
          path.extname(file.name || '').toLowerCase() || EXT_BY_MIME[mime] || '.png';

        let outBuf = null;
        let outExt = origExt;
        let converted = false;

        if (
          this.settings.convertToWebp &&
          (CONVERTIBLE_MIMES.has(mime) ||
            ['.png', '.jpg', '.jpeg', '.bmp', '.tif', '.tiff'].includes(origExt))
        ) {
          const webpBuf = await convertBlobToWebp(file, this.settings.webpQuality);
          if (webpBuf) {
            outBuf = webpBuf;
            outExt = '.webp';
            converted = true;
          }
        }

        if (!outBuf) {
          outBuf = Buffer.from(await file.arrayBuffer());
        }

        const suffix = files.length > 1 ? `-${i + 1}` : '';
        let fileName = `IMG-${baseTs}${suffix}${outExt}`;
        let destPath = path.join(targetDir, fileName);
        let counter = 1;
        while (fs.existsSync(destPath)) {
          fileName = `IMG-${baseTs}${suffix}-${counter++}${outExt}`;
          destPath = path.join(targetDir, fileName);
        }

        await fs.promises.writeFile(destPath, outBuf);

        const rawWebPath = this.settings.useSlugSubfolder
          ? `/${subDir}/${slug}/${fileName}`
          : `/${subDir}/${fileName}`;
        const encodedWebPath = encodeWebPath(rawWebPath);

        markdownLines.push(`![](${encodedWebPath})`);
        savedNotices.push(
          `${rawWebPath} (${converted ? 'WebP, ' : ''}${formatBytes(outBuf.length)})`
        );
      }

      const replacement = markdownLines.join('\n');
      const fullText = editor.getValue();
      const idx = fullText.indexOf(placeholder);
      if (idx !== -1) {
        const from = editor.offsetToPos(idx);
        const to = editor.offsetToPos(idx + placeholder.length);
        editor.replaceRange(replacement, from, to);
      } else {
        editor.replaceSelection(replacement);
      }

      new Notice(
        savedNotices.length === 1
          ? `已保存图片到 ${savedNotices[0]}`
          : `已保存 ${savedNotices.length} 张图片到 /${subDir}/${slug}/`
      );

      this.queueScan(this.app.workspace.containerEl || document.body);
    } catch (err) {
      const fullText = editor.getValue();
      const idx = fullText.indexOf(placeholder);
      if (idx !== -1) {
        editor.replaceRange('', editor.offsetToPos(idx), editor.offsetToPos(idx + placeholder.length));
      }
      console.error('[blog-public-images] Failed to save image:', err);
      new Notice(`保存图片失败: ${err && err.message ? err.message : String(err)}`);
    }
  }
}

class BlogPublicImagesSettingTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl('h2', { text: 'Blog Public Images 设置' });

    const resolvedPublic = this.plugin.getPublicDir();
    const publicExists = resolvedPublic ? fs.existsSync(resolvedPublic) : false;

    new Setting(containerEl)
      .setName('public 目录相对路径')
      .setDesc(
        `相对于当前 Obsidian 仓库根目录的路径。当前解析为: ${resolvedPublic || '未知'} (${publicExists ? '目录存在' : '目录不存在'})`
      )
      .addText((text) =>
        text
          .setPlaceholder('../public')
          .setValue(this.plugin.settings.publicDirRelative)
          .onChange(async (value) => {
            this.plugin.settings.publicDirRelative = value.trim() || '../public';
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('粘贴图片子目录')
      .setDesc('图片在 public 下存放的一级目录名，例如 img 对应 public/img/')
      .addText((text) =>
        text
          .setPlaceholder('img')
          .setValue(this.plugin.settings.imageSubDir)
          .onChange(async (value) => {
            this.plugin.settings.imageSubDir = value.trim() || 'img';
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('按文章文件名（slug）分子目录')
      .setDesc('开启后将保存到 public/img/<当前文件名>/IMG-xxxx.webp')
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.useSlugSubfolder)
          .onChange(async (value) => {
            this.plugin.settings.useSlugSubfolder = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('粘贴/拖入图片自动转为 WebP')
      .setDesc('使用 Obsidian 内置 Chromium 编码器将 PNG/JPG 自动压缩转为 .webp（GIF/SVG/WebP 保持原格式）')
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.convertToWebp)
          .onChange(async (value) => {
            this.plugin.settings.convertToWebp = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('WebP 压缩质量')
      .setDesc(`当前质量: ${Math.round(this.plugin.settings.webpQuality * 100)}%`)
      .addSlider((slider) =>
        slider
          .setLimits(50, 100, 1)
          .setValue(Math.round(this.plugin.settings.webpQuality * 100))
          .setDynamicTooltip()
          .onChange(async (value) => {
            this.plugin.settings.webpQuality = value / 100;
            await this.plugin.saveSettings();
            this.display();
          })
      );

    containerEl.createEl('h3', { text: 'MDX Frontmatter 自动化' });

    new Setting(containerEl)
      .setName('新建空 .mdx 文件时自动插入 Frontmatter')
      .setDesc('根据所在目录（writings/blog、essay、notes、translations、story、works、pages）自动生成对应的 Frontmatter 头')
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.autoInsertFrontmatter)
          .onChange(async (value) => {
            this.plugin.settings.autoInsertFrontmatter = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('新建文章默认为草稿 (draft: true)')
      .setDesc('开启后仅在本地 pnpm run dev 预览中可见，生产构建时自动忽略')
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.defaultDraft)
          .onChange(async (value) => {
            this.plugin.settings.defaultDraft = value;
            await this.plugin.saveSettings();
          })
      );
  }
}

BlogPublicImagesPlugin._buildFrontmatterForVaultPath = buildFrontmatterForVaultPath;

module.exports = BlogPublicImagesPlugin;
