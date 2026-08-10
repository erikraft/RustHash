import init, { Sha256Hasher, Sha512Hasher, Md5Hasher, Blake3Hasher } from './pkg/hash_wasm';

let wasmInitialized = false;

async function ensureWasm() {
  if (!wasmInitialized) {
    await init();
    wasmInitialized = true;
  }
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Handler for messages from main thread
self.onmessage = async (event: MessageEvent) => {
  const { type, data, id } = event.data;

  try {
    await ensureWasm();

    if (type === 'HASH_TEXT') {
      const encoder = new TextEncoder();
      const bytes = encoder.encode(data || '');

      // Perform fast full hashing
      const sha256Hasher = new Sha256Hasher();
      const sha512Hasher = new Sha512Hasher();
      const md5Hasher = new Md5Hasher();
      const blake3Hasher = new Blake3Hasher();

      sha256Hasher.update(bytes);
      sha512Hasher.update(bytes);
      md5Hasher.update(bytes);
      blake3Hasher.update(bytes);

      const hash256 = toHex(sha256Hasher.finalize());
      const hash512 = toHex(sha512Hasher.finalize());
      const hashMd5 = toHex(md5Hasher.finalize());
      const hashBlake3 = toHex(blake3Hasher.finalize());

      self.postMessage({
        type: 'HASH_SUCCESS',
        id,
        results: {
          sha256: hash256,
          sha512: hash512,
          md5: hashMd5,
          blake3: hashBlake3,
        }
      });
    } else if (type === 'HASH_FILE') {
      const file: File | Blob = data;
      const totalSize = file.size;

      const sha256Hasher = new Sha256Hasher();
      const sha512Hasher = new Sha512Hasher();
      const md5Hasher = new Md5Hasher();
      const blake3Hasher = new Blake3Hasher();

      const CHUNK_SIZE = 4 * 1024 * 1024; // 4MB chunks
      let offset = 0;

      while (offset < totalSize) {
        const slice = file.slice(offset, offset + CHUNK_SIZE);
        const arrayBuffer = await slice.arrayBuffer();
        const chunkBytes = new Uint8Array(arrayBuffer);

        sha256Hasher.update(chunkBytes);
        sha512Hasher.update(chunkBytes);
        md5Hasher.update(chunkBytes);
        blake3Hasher.update(chunkBytes);

        offset += chunkBytes.length;

        // Send progress updates
        const progress = Math.min(100, Math.round((offset / totalSize) * 100));
        self.postMessage({
          type: 'HASH_PROGRESS',
          id,
          progress,
          bytesRead: offset,
          totalBytes: totalSize,
        });
      }

      // Finalize hashes
      const hash256 = toHex(sha256Hasher.finalize());
      const hash512 = toHex(sha512Hasher.finalize());
      const hashMd5 = toHex(md5Hasher.finalize());
      const hashBlake3 = toHex(blake3Hasher.finalize());

      self.postMessage({
        type: 'HASH_SUCCESS',
        id,
        results: {
          sha256: hash256,
          sha512: hash512,
          md5: hashMd5,
          blake3: hashBlake3,
        }
      });
    }
  } catch (error: any) {
    self.postMessage({
      type: 'HASH_ERROR',
      id,
      error: error?.message || String(error),
    });
  }
};
