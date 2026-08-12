import init, {
  Sha1Hasher,
  Sha256Hasher,
  Sha512Hasher,
  Md5Hasher,
  Blake3Hasher,
  Sha224Hasher,
  Sha384Hasher,
  Sha512_224Hasher,
  Sha512_256Hasher,
  Sha3_224Hasher,
  Sha3_256Hasher,
  Sha3_384Hasher,
  Sha3_512Hasher,
  Shake128Hasher,
  Shake256Hasher,
  Blake2sHasher,
  Blake2bHasher,
  Ripemd160Hasher,
  Md4Hasher,
  Md2Hasher,
  WhirlpoolHasher,
  Sm3Hasher,
  Crc32Hasher,
  Adler32Hasher,
  Fnv1Hasher,
  Fnv1aHasher,
  Murmur3Hasher,
  XxHashHasher,
  SipHashHasher,
  LuhnHasher,
  VerhoeffHasher,
  DammHasher
} from './pkg/hash_wasm';

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

// Map algorithm key to its Hasher class construction
const hashersConfig = {
  sha1: Sha1Hasher,
  sha256: Sha256Hasher,
  sha512: Sha512Hasher,
  md5: Md5Hasher,
  blake3: Blake3Hasher,
  sha224: Sha224Hasher,
  sha384: Sha384Hasher,
  sha512_224: Sha512_224Hasher,
  sha512_256: Sha512_256Hasher,
  sha3_224: Sha3_224Hasher,
  sha3_256: Sha3_256Hasher,
  sha3_384: Sha3_384Hasher,
  sha3_512: Sha3_512Hasher,
  shake128: Shake128Hasher,
  shake256: Shake256Hasher,
  blake2s: Blake2sHasher,
  blake2b: Blake2bHasher,
  ripemd160: Ripemd160Hasher,
  md4: Md4Hasher,
  md2: Md2Hasher,
  whirlpool: WhirlpoolHasher,
  sm3: Sm3Hasher,
  crc32: Crc32Hasher,
  adler32: Adler32Hasher,
  fnv1: Fnv1Hasher,
  fnv1a: Fnv1aHasher,
  murmur3: Murmur3Hasher,
  xxhash: XxHashHasher,
  siphash: SipHashHasher,
  luhn: LuhnHasher,
  verhoeff: VerhoeffHasher,
  damm: DammHasher
};

type AlgoKey = keyof typeof hashersConfig;

// Handler for messages from main thread
self.onmessage = async (event: MessageEvent) => {
  const { type, data, id } = event.data;

  try {
    await ensureWasm();

    const algoKeys = Object.keys(hashersConfig) as AlgoKey[];

    if (type === 'HASH_TEXT') {
      const encoder = new TextEncoder();
      const bytes = encoder.encode(data || '');

      // Instantiate all hashers
      const instances = {} as Record<AlgoKey, any>;
      for (const k of algoKeys) {
        instances[k] = new hashersConfig[k]();
      }

      // Update all hashers
      for (const k of algoKeys) {
        instances[k].update(bytes);
      }

      // Finalize all hashes
      const results = {} as Record<string, string>;
      for (const k of algoKeys) {
        const outBytes = instances[k].finalize();
        // Since Luhn/Verhoeff/Damm return simple decimals, keep single digit or small array representation
        if (k === 'luhn' || k === 'verhoeff' || k === 'damm') {
          results[k] = String(outBytes[0]);
        } else {
          results[k] = toHex(new Uint8Array(outBytes));
        }
      }

      self.postMessage({
        type: 'HASH_SUCCESS',
        id,
        results
      });
    } else if (type === 'HASH_FILE') {
      const file: File | Blob = data;
      const totalSize = file.size;

      // Instantiate all hashers
      const instances = {} as Record<AlgoKey, any>;
      for (const k of algoKeys) {
        instances[k] = new hashersConfig[k]();
      }

      const CHUNK_SIZE = 4 * 1024 * 1024; // 4MB chunks
      let offset = 0;

      while (offset < totalSize) {
        const slice = file.slice(offset, offset + CHUNK_SIZE);
        const arrayBuffer = await slice.arrayBuffer();
        const chunkBytes = new Uint8Array(arrayBuffer);

        // Update all hashers
        for (const k of algoKeys) {
          instances[k].update(chunkBytes);
        }

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

      // Finalize all hashes
      const results = {} as Record<string, string>;
      for (const k of algoKeys) {
        const outBytes = instances[k].finalize();
        if (k === 'luhn' || k === 'verhoeff' || k === 'damm') {
          results[k] = String(outBytes[0]);
        } else {
          results[k] = toHex(new Uint8Array(outBytes));
        }
      }

      self.postMessage({
        type: 'HASH_SUCCESS',
        id,
        results
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
