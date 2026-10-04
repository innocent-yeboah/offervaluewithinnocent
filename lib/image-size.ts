const fallback = { width: 736, height: 920 };

function jpegSize(buf: Buffer): { width: number; height: number } | null {
  let offset = 2;
  while (offset < buf.length - 8) {
    if (buf[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = buf[offset + 1];
    if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
      return {
        height: buf.readUInt16BE(offset + 5),
        width: buf.readUInt16BE(offset + 7),
      };
    }
    if (marker === 0xd8 || marker === 0xd9) {
      offset += 2;
      continue;
    }
    const length = buf.readUInt16BE(offset + 2);
    offset += 2 + length;
  }
  return null;
}

function pngSize(buf: Buffer): { width: number; height: number } | null {
  if (buf.length < 24 || buf[0] !== 0x89 || buf[1] !== 0x50) {
    return null;
  }
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

/** Natural pixel size so the hero keeps its own shape. */
export async function readImageSize(url: string): Promise<{ width: number; height: number }> {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!response.ok) {
      return fallback;
    }
    const buf = Buffer.from(await response.arrayBuffer());
    return jpegSize(buf) ?? pngSize(buf) ?? fallback;
  } catch {
    return fallback;
  }
}
