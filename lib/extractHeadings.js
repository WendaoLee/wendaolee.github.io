function stripMarkdownInline(text) {
  return text
    // Inline code: keep code text
    .replace(/`([^`]+)`/g, "$1")
    // Images: keep alt text
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    // Links: keep label text
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    // HTML tags
    .replace(/<[^>]+>/g, "")
    // Bold / italic / strikethrough markers
    .replace(/(\*\*|__|\*|_|~~)/g, "")
    // Trailing hashes
    .replace(/\s+#+\s*$/, "")
    .trim();
}

function createSlugger() {
  const occurrences = Object.create(null);

  return function slug(value) {
    const base = value
      .toLowerCase()
      .replace(/[^\p{L}\p{M}\p{N}\p{Pc} -]/gu, "")
      .replace(/ /g, "-");

    let result = base;
    while (Object.prototype.hasOwnProperty.call(occurrences, result)) {
      occurrences[base]++;
      result = `${base}-${occurrences[base]}`;
    }
    occurrences[result] = 0;
    return result;
  };
}

/**
 * Extract level 1-4 headings from raw Markdown/MDX at build time,
 * skipping fenced code blocks and matching rehype-slug / github-slugger IDs.
 *
 * @param {string} raw
 * @returns {{ id: string, text: string, level: number }[]}
 */
export function extractHeadings(raw) {
  if (typeof raw !== "string" || !raw) return [];

  const slug = createSlugger();
  const headings = [];
  const lines = raw.split(/\r?\n/);

  let inFence = false;
  let fenceChar = "";
  let fenceLen = 0;

  for (const line of lines) {
    const trimmed = line.trimStart();
    const fenceMatch = trimmed.match(/^(`{3,}|~{3,})/);
    if (fenceMatch) {
      const marker = fenceMatch[1];
      if (!inFence) {
        inFence = true;
        fenceChar = marker[0];
        fenceLen = marker.length;
      } else if (marker[0] === fenceChar && marker.length >= fenceLen && trimmed.slice(marker.length).trim() === "") {
        inFence = false;
        fenceChar = "";
        fenceLen = 0;
      }
      continue;
    }

    if (inFence) continue;

    const headingMatch = line.match(/^(#{1,4})\s+(.+)$/);
    if (!headingMatch) continue;

    const level = headingMatch[1].length;
    const text = stripMarkdownInline(headingMatch[2]);
    if (!text) continue;

    headings.push({
      id: slug(text),
      text,
      level,
    });
  }

  return headings;
}
