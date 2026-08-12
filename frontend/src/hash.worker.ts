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
  DammHasher,
  // New implemented hashers
  AsconHash256Hasher,
  AsconXof128Hasher,
  Fletcher16Hasher,
  Fletcher32Hasher,
  Crc8Hasher,
  Crc16Hasher,
  Crc64Hasher,
  Cshake128Hasher,
  Cshake256Hasher,
  Kmac128Hasher,
  Kmac256Hasher,
  TupleHash128Hasher,
  TupleHash256Hasher,
  // New specialized parameter functions
  hash_argon2,
  hash_bcrypt,
  hash_scrypt,
  hash_pbkdf2,
  encode_geohash
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
  damm: DammHasher,
  // New standard hashers
  ascon_hash256: AsconHash256Hasher,
  ascon_xof128: AsconXof128Hasher,
  fletcher16: Fletcher16Hasher,
  fletcher32: Fletcher32Hasher,
  crc8: Crc8Hasher,
  crc16: Crc16Hasher,
  crc64: Crc64Hasher
};

type AlgoKey = keyof typeof hashersConfig;

// Handler for messages from main thread
self.onmessage = async (event: MessageEvent) => {
  const { type, data, id, params = {} } = event.data;

  try {
    await ensureWasm();

    const algoKeys = Object.keys(hashersConfig) as AlgoKey[];
    const encoder = new TextEncoder();

    // Default configuration values
    const cshakeCustom = encoder.encode(params.cshake_customization || '');
    const kmacKey = encoder.encode(params.kmac_key || 'key');
    const kmacCustom = encoder.encode(params.kmac_customization || '');
    const tuplehashCustom = encoder.encode(params.tuplehash_customization || '');

    // KDF / Parameterized fields
    const argon2Salt = encoder.encode(params.argon2_salt || 'salt12345');
    const argon2m = Number(params.argon2_m_cost || 4096);
    const argon2t = Number(params.argon2_t_cost || 3);
    const argon2p = Number(params.argon2_p_cost || 1);
    const argon2len = Number(params.argon2_out_len || 32);

    const bcryptCost = Number(params.bcrypt_cost || 4);

    const scryptSalt = encoder.encode(params.scrypt_salt || 'scrypt_salt');
    const scryptN = Number(params.scrypt_log_n || 10);
    const scryptR = Number(params.scrypt_r || 8);
    const scryptP = Number(params.scrypt_p || 1);
    const scryptLen = Number(params.scrypt_out_len || 32);

    const pbkdf2Salt = encoder.encode(params.pbkdf2_salt || 'salt');
    const pbkdf2Iter = Number(params.pbkdf2_iterations || 1000);
    const pbkdf2Len = Number(params.pbkdf2_out_len || 32);
    const pbkdf2Prf = params.pbkdf2_prf || 'sha256';

    const geoLat = Number(params.geohash_latitude || 37.8324);
    const geoLon = Number(params.geohash_longitude || 112.5584);
    const geoPrecision = Number(params.geohash_precision || 9);

    if (type === 'HASH_TEXT') {
      const bytes = encoder.encode(data || '');

      // 1. Instantiate and process all standard/incremental hashers
      const instances = {} as Record<AlgoKey, any>;
      for (const k of algoKeys) {
        instances[k] = new hashersConfig[k]();
      }
      for (const k of algoKeys) {
        instances[k].update(bytes);
      }

      // Collect results for standard hashers
      const results = {} as Record<string, string>;
      for (const k of algoKeys) {
        const outBytes = instances[k].finalize();
        if (k === 'luhn' || k === 'verhoeff' || k === 'damm') {
          results[k] = String(outBytes[0]);
        } else {
          results[k] = toHex(new Uint8Array(outBytes));
        }
      }

      // 2. Instantiate and process SP 800-185 hashers dynamically with custom params
      const c128 = new Cshake128Hasher(cshakeCustom);
      c128.update(bytes);
      results['cshake128'] = toHex(new Uint8Array(c128.finalize()));

      const c256 = new Cshake256Hasher(cshakeCustom);
      c256.update(bytes);
      results['cshake256'] = toHex(new Uint8Array(c256.finalize()));

      const k128 = new Kmac128Hasher(kmacKey, kmacCustom);
      k128.update(bytes);
      results['kmac128'] = toHex(new Uint8Array(k128.finalize()));

      const k256 = new Kmac256Hasher(kmacKey, kmacCustom);
      k256.update(bytes);
      results['kmac256'] = toHex(new Uint8Array(k256.finalize()));

      // For TupleHash, we can parse multiple comma separated values if supplied, or standard string bytes
      const t128 = new TupleHash128Hasher(tuplehashCustom);
      if (typeof data === 'string' && data.includes(',')) {
        const items = data.split(',').map(s => encoder.encode(s.trim()));
        for (const item of items) {
          t128.update(item);
        }
      } else {
        t128.update(bytes);
      }
      results['tuplehash128'] = toHex(new Uint8Array(t128.finalize()));

      const t256 = new TupleHash256Hasher(tuplehashCustom);
      if (typeof data === 'string' && data.includes(',')) {
        const items = data.split(',').map(s => encoder.encode(s.trim()));
        for (const item of items) {
          t256.update(item);
        }
      } else {
        t256.update(bytes);
      }
      results['tuplehash256'] = toHex(new Uint8Array(t256.finalize()));

      // 3. Compute parameterized specialized functions
      try {
        results['argon2id'] = hash_argon2(bytes, argon2Salt, argon2m, argon2t, argon2p, argon2len, 'argon2id');
        results['argon2i'] = hash_argon2(bytes, argon2Salt, argon2m, argon2t, argon2p, argon2len, 'argon2i');
        results['argon2d'] = hash_argon2(bytes, argon2Salt, argon2m, argon2t, argon2p, argon2len, 'argon2d');
      } catch (err) {
        results['argon2id'] = 'N/A (Error)';
        results['argon2i'] = 'N/A (Error)';
        results['argon2d'] = 'N/A (Error)';
      }

      try {
        results['bcrypt'] = hash_bcrypt(bytes, bcryptCost);
      } catch (err) {
        results['bcrypt'] = 'N/A (Error)';
      }

      try {
        results['scrypt'] = hash_scrypt(bytes, scryptSalt, scryptN, scryptR, scryptP, scryptLen);
      } catch (err) {
        results['scrypt'] = 'N/A (Error)';
      }

      try {
        results['pbkdf2'] = hash_pbkdf2(bytes, pbkdf2Salt, pbkdf2Iter, pbkdf2Len, pbkdf2Prf);
      } catch (err) {
        results['pbkdf2'] = 'N/A (Error)';
      }

      try {
        results['geohash'] = encode_geohash(geoLat, geoLon, geoPrecision);
      } catch (err) {
        results['geohash'] = 'N/A (Error)';
      }

      self.postMessage({
        type: 'HASH_SUCCESS',
        id,
        results
      });
    } else if (type === 'HASH_FILE') {
      const file: File | Blob = data;
      const totalSize = file.size;

      // 1. Instantiate standard/incremental hashers
      const instances = {} as Record<AlgoKey, any>;
      for (const k of algoKeys) {
        instances[k] = new hashersConfig[k]();
      }

      // 2. Instantiate SP 800-185 hashers dynamically
      const c128 = new Cshake128Hasher(cshakeCustom);
      const c256 = new Cshake256Hasher(cshakeCustom);
      const k128 = new Kmac128Hasher(kmacKey, kmacCustom);
      const k256 = new Kmac256Hasher(kmacKey, kmacCustom);
      const t128 = new TupleHash128Hasher(tuplehashCustom);
      const t256 = new TupleHash256Hasher(tuplehashCustom);

      const CHUNK_SIZE = 4 * 1024 * 1024; // 4MB chunks
      let offset = 0;

      while (offset < totalSize) {
        const slice = file.slice(offset, offset + CHUNK_SIZE);
        const arrayBuffer = await slice.arrayBuffer();
        const chunkBytes = new Uint8Array(arrayBuffer);

        // Update standard hashers
        for (const k of algoKeys) {
          instances[k].update(chunkBytes);
        }

        // Update custom SP 800-185 hashers
        c128.update(chunkBytes);
        c256.update(chunkBytes);
        k128.update(chunkBytes);
        k256.update(chunkBytes);
        t128.update(chunkBytes);
        t256.update(chunkBytes);

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

      // Collect results for standard hashers
      const results = {} as Record<string, string>;
      for (const k of algoKeys) {
        const outBytes = instances[k].finalize();
        if (k === 'luhn' || k === 'verhoeff' || k === 'damm') {
          results[k] = String(outBytes[0]);
        } else {
          results[k] = toHex(new Uint8Array(outBytes));
        }
      }

      // Collect results for SP 800-185 hashers
      results['cshake128'] = toHex(new Uint8Array(c128.finalize()));
      results['cshake256'] = toHex(new Uint8Array(c256.finalize()));
      results['kmac128'] = toHex(new Uint8Array(k128.finalize()));
      results['kmac256'] = toHex(new Uint8Array(k256.finalize()));
      results['tuplehash128'] = toHex(new Uint8Array(t128.finalize()));
      results['tuplehash256'] = toHex(new Uint8Array(t256.finalize()));

      // 3. Mark non-applicable KDF/spatial algorithms on file input
      results['argon2id'] = 'Não aplicável (KDF de Senha)';
      results['argon2i'] = 'Não aplicável (KDF de Senha)';
      results['argon2d'] = 'Não aplicável (KDF de Senha)';
      results['bcrypt'] = 'Não aplicável (KDF de Senha)';
      results['scrypt'] = 'Não aplicável (KDF de Senha)';
      results['pbkdf2'] = 'Não aplicável (KDF de Senha)';
      results['geohash'] = 'Não aplicável (Geoespectral)';

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
