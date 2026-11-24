"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";

const ARTALK_SERVER = "https://comments.otterstack.cn";
const ARTALK_SITE = "李问道的博客";
const ARTALK_CSS_ID = "artalk-stylesheet";
const ARTALK_SCRIPT_ID = "artalk-script";

interface ArtalkCheckers {
  checkAdmin?: (opts?: { onSuccess?: () => void; onCancel?: () => void }) => Promise<void> | void;
}

interface ArtalkInstance {
  destroy: () => void;
  setDarkMode: (darkMode: boolean) => void;
  on?: (event: string, handler: () => void) => void;
  ctx?: {
    inject?: (name: string) => unknown;
  };
}

interface ArtalkStatic {
  init: (config: {
    el: string | HTMLElement;
    pageKey: string;
    pageTitle: string;
    server: string;
    site: string;
    darkMode?: boolean;
    noComment?: string;
  }) => ArtalkInstance;
}

declare global {
  interface Window {
    Artalk?: ArtalkStatic;
  }
}

let artalkLoadPromise: Promise<ArtalkStatic> | null = null;

function ensureArtalkAssets(): Promise<ArtalkStatic> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Artalk requires a browser environment"));
  }

  if (!document.getElementById(ARTALK_CSS_ID)) {
    const link = document.createElement("link");
    link.id = ARTALK_CSS_ID;
    link.rel = "stylesheet";
    link.href = `${ARTALK_SERVER}/dist/Artalk.css`;
    document.head.appendChild(link);
  }

  if (window.Artalk) {
    return Promise.resolve(window.Artalk);
  }

  if (!artalkLoadPromise) {
    artalkLoadPromise = new Promise<ArtalkStatic>((resolve, reject) => {
      const existing = document.getElementById(ARTALK_SCRIPT_ID) as HTMLScriptElement | null;
      if (existing) {
        existing.addEventListener("load", () => {
          if (window.Artalk) resolve(window.Artalk);
          else reject(new Error("Artalk loaded but global was missing"));
        });
        existing.addEventListener("error", () => {
          artalkLoadPromise = null;
          reject(new Error("Failed to load Artalk script"));
        });
        return;
      }

      const script = document.createElement("script");
      script.id = ARTALK_SCRIPT_ID;
      script.src = `${ARTALK_SERVER}/dist/Artalk.js`;
      script.async = true;
      script.onload = () => {
        if (window.Artalk) {
          resolve(window.Artalk);
        } else {
          artalkLoadPromise = null;
          reject(new Error("Artalk loaded but global was missing"));
        }
      };
      script.onerror = () => {
        artalkLoadPromise = null;
        script.remove();
        reject(new Error("Failed to load Artalk script"));
      };
      document.head.appendChild(script);
    });
  }

  return artalkLoadPromise;
}

function relocatePoweredBy(root: HTMLElement | null) {
  if (!root) return;

  const rightAction = root.querySelector<HTMLElement>(".atk-list-header .atk-right-action");
  const copyright = root.querySelector<HTMLElement>(".atk-copyright");
  if (!rightAction || !copyright) return;

  let wrap = rightAction.querySelector<HTMLElement>(".atk-blog-powered-wrap");
  if (!wrap) {
    wrap = document.createElement("span");
    wrap.className = "atk-blog-powered-wrap";

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "atk-blog-powered-btn";
    btn.setAttribute("aria-label", "关于评论系统");
    btn.textContent = "?";

    const popover = document.createElement("span");
    popover.className = "atk-blog-powered-popover";
    popover.setAttribute("role", "tooltip");

    const avatarTip = document.createElement("span");
    avatarTip.className = "atk-blog-avatar-tip";
    avatarTip.append("头像根据邮箱自动匹配，可前往 ");

    const avatarLinks: Array<[string, string]> = [
      ["WeAvatar", "https://weavatar.com"],
      ["Cravatar", "https://cravatar.cn"],
      ["Gravatar", "https://gravatar.com"],
    ];
    avatarLinks.forEach(([label, href], idx) => {
      if (idx > 0) avatarTip.append(" / ");
      const a = document.createElement("a");
      a.href = href;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = label;
      avatarTip.appendChild(a);
    });
    avatarTip.append(" 绑定配置（QQ 邮箱默认同步 QQ 头像）。");

    popover.appendChild(avatarTip);
    wrap.appendChild(btn);
    wrap.appendChild(popover);
    rightAction.appendChild(wrap);
  }

  const popover = wrap.querySelector<HTMLElement>(".atk-blog-powered-popover");
  if (popover && copyright.parentElement !== popover) {
    const footer = copyright.closest<HTMLElement>(".atk-list-footer");
    popover.appendChild(copyright);
    if (footer && footer.children.length === 0) {
      footer.style.display = "none";
    }
  }
}

function emphasizeRequiredInputs(root: HTMLElement | null) {
  if (!root) return;

  const fields: Array<{
    selector: string;
    id: string;
    label: string;
    required: boolean;
    placeholder: string;
  }> = [
    {
      selector: 'input.atk-name[name="name"]',
      id: "atk-field-name",
      label: "昵称",
      required: true,
      placeholder: "请输入你的昵称",
    },
    {
      selector: 'input.atk-email[name="email"]',
      id: "atk-field-email",
      label: "邮箱",
      required: true,
      placeholder: "用于接收回复通知，不会公开展示",
    },
    {
      selector: 'input.atk-link[name="link"]',
      id: "atk-field-link",
      label: "个人站点",
      required: false,
      placeholder: "https://（选填）",
    },
  ];

  for (const field of fields) {
    const input = root.querySelector<HTMLInputElement>(field.selector);
    if (!input) continue;

    input.required = field.required;
    if (!input.id) {
      input.id = field.id;
    }
    if (input.dataset.blogEnhanced !== "true") {
      input.placeholder = field.placeholder;
      input.dataset.blogEnhanced = "true";
    }

    if (input.parentElement && !input.parentElement.classList.contains("atk-blog-field")) {
      const wrapper = document.createElement("div");
      wrapper.className = "atk-blog-field";

      const labelEl = document.createElement("label");
      labelEl.className = "atk-blog-field-label";
      labelEl.htmlFor = input.id;
      labelEl.textContent = field.label;

      if (field.required) {
        const star = document.createElement("span");
        star.className = "atk-blog-required-star";
        star.textContent = " *";
        star.setAttribute("aria-hidden", "true");
        labelEl.appendChild(star);
      } else {
        const opt = document.createElement("span");
        opt.className = "atk-blog-optional-tag";
        opt.textContent = "（选填）";
        labelEl.appendChild(opt);
      }

      input.parentElement.insertBefore(wrapper, input);
      wrapper.appendChild(labelEl);
      wrapper.appendChild(input);
    }
  }
}

function deferAdminCheckToSubmit(instance: ArtalkInstance) {
  const checkers = instance.ctx?.inject?.("checkers") as ArtalkCheckers | undefined;
  if (!checkers || typeof checkers.checkAdmin !== "function") return;

  const originalCheckAdmin = checkers.checkAdmin.bind(checkers);
  checkers.checkAdmin = (opts) => {
    // Artalk's HeaderUser plugin auto-triggers checkAdmin({ onSuccess: () => {} }) 400ms after typing
    // admin name/email. Skip that eager prompt so verification only runs on submit (need_login -> {})
    // or when explicitly opening the admin sidebar ({ onSuccess, onCancel }).
    if (opts && typeof opts.onSuccess === "function" && typeof opts.onCancel !== "function") {
      return Promise.resolve();
    }
    return originalCheckAdmin(opts);
  };
}

const Comments: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const artalkRef = useRef<ArtalkInstance | null>(null);
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  const isDark = resolvedTheme === "dark";

  // Load and initialize Artalk immediately on mount (and re-init cleanly on route change)
  useEffect(() => {
    if (!containerRef.current) return;

    let cancelled = false;
    let domObserver: MutationObserver | null = null;
    setStatus("loading");

    ensureArtalkAssets()
      .then((Artalk) => {
        if (cancelled || !containerRef.current) return;

        if (artalkRef.current) {
          try {
            artalkRef.current.destroy();
          } catch {
            // Ignore cleanup errors
          }
          artalkRef.current = null;
        }

        const container = containerRef.current;
        container.replaceChildren();

        const applyEnhancements = () => {
          relocatePoweredBy(container);
          emphasizeRequiredInputs(container);
        };

        const instance = Artalk.init({
          el: container,
          pageKey: pathname || window.location.pathname,
          pageTitle: document.title,
          server: ARTALK_SERVER,
          site: ARTALK_SITE,
          darkMode: isDark,
          noComment: "「此处还没有人评论」",
        });
        artalkRef.current = instance;
        deferAdminCheckToSubmit(instance);

        instance.on?.("mounted", applyEnhancements);
        instance.on?.("list-loaded", applyEnhancements);
        applyEnhancements();
        requestAnimationFrame(applyEnhancements);

        domObserver = new MutationObserver(() => {
          applyEnhancements();
        });
        domObserver.observe(container, { childList: true, subtree: true });

        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) {
          setStatus("error");
        }
      });

    return () => {
      cancelled = true;
      if (domObserver) {
        domObserver.disconnect();
        domObserver = null;
      }
      if (artalkRef.current) {
        try {
          artalkRef.current.destroy();
        } catch {
          // Ignore cleanup errors
        }
        artalkRef.current = null;
      }
    };
    // Theme changes are synced without re-mounting via setDarkMode below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Sync dark/light mode changes to Artalk
  useEffect(() => {
    if (artalkRef.current) {
      artalkRef.current.setDarkMode(isDark);
    }
  }, [isDark, status]);

  return (
    <section
      aria-label="评论区"
      data-pagefind-ignore
      className="not-prose mt-10 min-h-[120px]"
    >
      {status !== "ready" && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {status === "error"
            ? "评论区加载失败，请刷新页面重试。"
            : "Comments is loading... / 评论区正在加载中..."}
        </p>
      )}
      <div ref={containerRef} id="artalk-comments-container" />
    </section>
  );
};

export default Comments;
