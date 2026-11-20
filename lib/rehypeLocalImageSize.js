import fs from "fs";
import path from "path";

const PUBLIC_DIR = path.join(process.cwd(), "public");

function readPngDimensions(buf) {
  if (buf.length < 24) return null;
  if (buf[0] !== 0x89 || buf[1] !== 0x50 || buf[2] !== 0x4e || buf[3] !== 0x47) {
    return null;
  }
  return {
    width: buf.readUInt32BE(16),
    height: buf.readUInt32BE(20),
  };
}

function readGifDimensions(buf) {
  if (buf.length < 10) return null;
  const sig = buf.toString("ascii", 0, 6);
  if (sig !== "GIF87a" && sig !== "GIF89a") return null;
  return {
    width: buf.readUInt16LE(6),
    height: buf.readUInt16LE(8),
  };
}

function readWebpDimensions(buf) {
  if (buf.length < 30) return null;
  if (buf.toString("ascii", 0, 4) !== "RIFF" || buf.toString("ascii", 8, 12) !== "WEBP") {
    return null;
  }

  const chunk = buf.toString("ascii", 12, 16);
  if (chunk === "VP8X") {
    const width = 1 + (buf[24] | (buf[25] << 8) | (buf[26] << 16));
    const height = 1 + (buf[27] | (buf[28] << 8) | (buf[29] << 16));
    return { width, height };
  }
  if (chunk === "VP8 ") {
    if (buf[23] !== 0x9d || buf[24] !== 0x01 || buf[25] !== 0x2a) return null;
    const width = buf.readUInt16LE(26) & 0x3fff;
    const height = buf.readUInt16LE(28) & 0x3fff;
    return { width, height };
  }
  if (chunk === "VP8L") {
    if (buf[20] !== 0x2f) return null;
    const b0 = buf[21];
    const b1 = buf[22];
    const b2 = buf[23];
    const b3 = buf[24];
    const width = 1 + (((b1 & 0x3f) << 8) | b0);
    const height = 1 + (((b3 & 0x0f) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6));
    return { width, height };
  }
  return null;
}

function readJpegDimensions(buf) {
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  let offset = 2;
  while (offset + 8 < buf.length) {
    if (buf[offset] !== 0xff) {
      offset++;
      continue;
    }
    while (offset < buf.length && buf[offset] === 0xff) offset++;
    if (offset >= buf.length) break;
    const marker = buf[offset++];
    if (marker === 0xd8 || marker === 0xd9 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      continue;
    }
    if (offset + 2 > buf.length) break;
    const size = buf.readUInt16BE(offset);
    const isSof =
      (marker >= 0xc0 && marker <= 0xc3) ||
      (marker >= 0xc5 && marker <= 0xc7) ||
      (marker >= 0xc9 && marker <= 0xcb) ||
      (marker >= 0xcd && marker <= 0xcf);
    if (isSof && offset + 7 <= buf.length) {
      return {
        height: buf.readUInt16BE(offset + 3),
        width: buf.readUInt16BE(offset + 5),
      };
    }
    if (size < 2) break;
    offset += size;
  }
  return null;
}

const dimensionCache = new Map();

function getImageDimensions(filePath) {
  if (dimensionCache.has(filePath)) {
    return dimensionCache.get(filePath);
  }
  let dims = null;
  try {
    const buf = fs.readFileSync(filePath);
    dims =
      readWebpDimensions(buf) ||
      readPngDimensions(buf) ||
      readGifDimensions(buf) ||
      readJpegDimensions(buf);
  } catch {
    dims = null;
  }
  dimensionCache.set(filePath, dims);
  return dims;
}

function resolvePublicPath(src) {
  if (typeof src !== "string" || !src.startsWith("/") || src.startsWith("//")) {
    return null;
  }
  const cleanSrc = src.split("?")[0].split("#")[0].replace(/\/{2,}/g, "/");
  let decoded = cleanSrc;
  try {
    decoded = decodeURIComponent(cleanSrc);
  } catch {
    // Keep original if malformed URI sequence
  }
  const resolved = path.resolve(PUBLIC_DIR, `.${decoded}`);
  if (!resolved.startsWith(PUBLIC_DIR)) return null;
  if (!fs.existsSync(resolved)) return null;
  return resolved;
}

function walkHast(node) {
  if (!node || typeof node !== "object") return;
  if (node.type === "element" && node.tagName === "img" && node.properties) {
    if (!node.properties.loading) {
      node.properties.loading = "lazy";
    }
    if (!node.properties.decoding) {
      node.properties.decoding = "async";
    }
    if (!node.properties.width && !node.properties.height) {
      const filePath = resolvePublicPath(node.properties.src);
      if (filePath) {
        const dims = getImageDimensions(filePath);
        if (dims && dims.width > 0 && dims.height > 0) {
          node.properties.width = dims.width;
          node.properties.height = dims.height;
        }
      }
    }
  }
  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      walkHast(child);
    }
  }
}

export default function rehypeLocalImageSize() {
  return (tree) => {
    walkHast(tree);
  };
}
