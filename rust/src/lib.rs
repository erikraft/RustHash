use wasm_bindgen::prelude::*;
use sha2::{Digest as _, Sha256, Sha512, Sha224, Sha384, Sha512_224, Sha512_256};
use sha1::Sha1;
use blake3::Hasher as Blake3;
use md5::Md5;
use sha3::{Sha3_224, Sha3_256, Sha3_384, Sha3_512, Shake128, Shake256};
use blake2::{Blake2s256, Blake2b512};
use ripemd::Ripemd160;
use md4::Md4;
use md2::Md2;
use whirlpool::Whirlpool;
use sm3::Sm3;
use crc32fast::Hasher as Crc32;
use adler::Adler32;
use std::hash::Hasher as _;

// --- Incremental Hashers wrapped for WASM-bindgen ---

#[wasm_bindgen]
pub struct Sha1Hasher(Sha1);

#[wasm_bindgen]
impl Sha1Hasher {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Sha1Hasher {
        Sha1Hasher(Sha1::new())
    }
    pub fn update(&mut self, chunk: &[u8]) {
        self.0.update(chunk);
    }
    pub fn finalize(self) -> Vec<u8> {
        self.0.finalize().to_vec()
    }
}

#[wasm_bindgen]
pub struct Sha256Hasher(Sha256);

#[wasm_bindgen]
impl Sha256Hasher {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Sha256Hasher {
        Sha256Hasher(Sha256::new())
    }
    pub fn update(&mut self, chunk: &[u8]) {
        self.0.update(chunk);
    }
    pub fn finalize(self) -> Vec<u8> {
        self.0.finalize().to_vec()
    }
}

#[wasm_bindgen]
pub struct Sha512Hasher(Sha512);

#[wasm_bindgen]
impl Sha512Hasher {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Sha512Hasher {
        Sha512Hasher(Sha512::new())
    }
    pub fn update(&mut self, chunk: &[u8]) {
        self.0.update(chunk);
    }
    pub fn finalize(self) -> Vec<u8> {
        self.0.finalize().to_vec()
    }
}

#[wasm_bindgen]
pub struct Md5Hasher(Md5);

#[wasm_bindgen]
impl Md5Hasher {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Md5Hasher {
        Md5Hasher(Md5::new())
    }
    pub fn update(&mut self, chunk: &[u8]) {
        self.0.update(chunk);
    }
    pub fn finalize(self) -> Vec<u8> {
        self.0.finalize().to_vec()
    }
}

#[wasm_bindgen]
pub struct Blake3Hasher(Blake3);

#[wasm_bindgen]
impl Blake3Hasher {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Blake3Hasher {
        Blake3Hasher(Blake3::new())
    }
    pub fn update(&mut self, chunk: &[u8]) {
        self.0.update(chunk);
    }
    pub fn finalize(self) -> Vec<u8> {
        self.0.finalize().as_bytes().to_vec()
    }
}

#[wasm_bindgen]
pub struct Sha224Hasher(Sha224);

#[wasm_bindgen]
impl Sha224Hasher {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Sha224Hasher {
        Sha224Hasher(Sha224::new())
    }
    pub fn update(&mut self, chunk: &[u8]) {
        self.0.update(chunk);
    }
    pub fn finalize(self) -> Vec<u8> {
        self.0.finalize().to_vec()
    }
}

#[wasm_bindgen]
pub struct Sha384Hasher(Sha384);

#[wasm_bindgen]
impl Sha384Hasher {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Sha384Hasher {
        Sha384Hasher(Sha384::new())
    }
    pub fn update(&mut self, chunk: &[u8]) {
        self.0.update(chunk);
    }
    pub fn finalize(self) -> Vec<u8> {
        self.0.finalize().to_vec()
    }
}

#[wasm_bindgen]
pub struct Sha512_224Hasher(Sha512_224);

#[wasm_bindgen]
impl Sha512_224Hasher {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Sha512_224Hasher {
        Sha512_224Hasher(Sha512_224::new())
    }
    pub fn update(&mut self, chunk: &[u8]) {
        self.0.update(chunk);
    }
    pub fn finalize(self) -> Vec<u8> {
        self.0.finalize().to_vec()
    }
}

#[wasm_bindgen]
pub struct Sha512_256Hasher(Sha512_256);

#[wasm_bindgen]
impl Sha512_256Hasher {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Sha512_256Hasher {
        Sha512_256Hasher(Sha512_256::new())
    }
    pub fn update(&mut self, chunk: &[u8]) {
        self.0.update(chunk);
    }
    pub fn finalize(self) -> Vec<u8> {
        self.0.finalize().to_vec()
    }
}

#[wasm_bindgen]
pub struct Sha3_224Hasher(Sha3_224);

#[wasm_bindgen]
impl Sha3_224Hasher {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Sha3_224Hasher {
        Sha3_224Hasher(Sha3_224::new())
    }
    pub fn update(&mut self, chunk: &[u8]) {
        self.0.update(chunk);
    }
    pub fn finalize(self) -> Vec<u8> {
        self.0.finalize().to_vec()
    }
}

#[wasm_bindgen]
pub struct Sha3_256Hasher(Sha3_256);

#[wasm_bindgen]
impl Sha3_256Hasher {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Sha3_256Hasher {
        Sha3_256Hasher(Sha3_256::new())
    }
    pub fn update(&mut self, chunk: &[u8]) {
        self.0.update(chunk);
    }
    pub fn finalize(self) -> Vec<u8> {
        self.0.finalize().to_vec()
    }
}

#[wasm_bindgen]
pub struct Sha3_384Hasher(Sha3_384);

#[wasm_bindgen]
impl Sha3_384Hasher {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Sha3_384Hasher {
        Sha3_384Hasher(Sha3_384::new())
    }
    pub fn update(&mut self, chunk: &[u8]) {
        self.0.update(chunk);
    }
    pub fn finalize(self) -> Vec<u8> {
        self.0.finalize().to_vec()
    }
}

#[wasm_bindgen]
pub struct Sha3_512Hasher(Sha3_512);

#[wasm_bindgen]
impl Sha3_512Hasher {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Sha3_512Hasher {
        Sha3_512Hasher(Sha3_512::new())
    }
    pub fn update(&mut self, chunk: &[u8]) {
        self.0.update(chunk);
    }
    pub fn finalize(self) -> Vec<u8> {
        self.0.finalize().to_vec()
    }
}

#[wasm_bindgen]
pub struct Shake128Hasher(Shake128);

#[wasm_bindgen]
impl Shake128Hasher {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Shake128Hasher {
        Shake128Hasher(Shake128::default())
    }
    pub fn update(&mut self, chunk: &[u8]) {
        use sha3::digest::Update;
        self.0.update(chunk);
    }
    pub fn finalize(self) -> Vec<u8> {
        use sha3::digest::ExtendableOutput;
        let mut reader = self.0.finalize_xof();
        let mut out = vec![0u8; 32]; // Return 32 bytes (256 bits) of shake output by default
        use sha3::digest::XofReader;
        reader.read(&mut out);
        out
    }
}

#[wasm_bindgen]
pub struct Shake256Hasher(Shake256);

#[wasm_bindgen]
impl Shake256Hasher {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Shake256Hasher {
        Shake256Hasher(Shake256::default())
    }
    pub fn update(&mut self, chunk: &[u8]) {
        use sha3::digest::Update;
        self.0.update(chunk);
    }
    pub fn finalize(self) -> Vec<u8> {
        use sha3::digest::ExtendableOutput;
        let mut reader = self.0.finalize_xof();
        let mut out = vec![0u8; 64]; // Return 64 bytes (512 bits) of shake output by default
        use sha3::digest::XofReader;
        reader.read(&mut out);
        out
    }
}

#[wasm_bindgen]
pub struct Blake2sHasher(Blake2s256);

#[wasm_bindgen]
impl Blake2sHasher {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Blake2sHasher {
        Blake2sHasher(Blake2s256::new())
    }
    pub fn update(&mut self, chunk: &[u8]) {
        self.0.update(chunk);
    }
    pub fn finalize(self) -> Vec<u8> {
        self.0.finalize().to_vec()
    }
}

#[wasm_bindgen]
pub struct Blake2bHasher(Blake2b512);

#[wasm_bindgen]
impl Blake2bHasher {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Blake2bHasher {
        Blake2bHasher(Blake2b512::new())
    }
    pub fn update(&mut self, chunk: &[u8]) {
        self.0.update(chunk);
    }
    pub fn finalize(self) -> Vec<u8> {
        self.0.finalize().to_vec()
    }
}

#[wasm_bindgen]
pub struct Ripemd160Hasher(Ripemd160);

#[wasm_bindgen]
impl Ripemd160Hasher {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Ripemd160Hasher {
        Ripemd160Hasher(Ripemd160::new())
    }
    pub fn update(&mut self, chunk: &[u8]) {
        self.0.update(chunk);
    }
    pub fn finalize(self) -> Vec<u8> {
        self.0.finalize().to_vec()
    }
}

#[wasm_bindgen]
pub struct Md4Hasher(Md4);

#[wasm_bindgen]
impl Md4Hasher {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Md4Hasher {
        Md4Hasher(Md4::new())
    }
    pub fn update(&mut self, chunk: &[u8]) {
        self.0.update(chunk);
    }
    pub fn finalize(self) -> Vec<u8> {
        self.0.finalize().to_vec()
    }
}

#[wasm_bindgen]
pub struct Md2Hasher(Md2);

#[wasm_bindgen]
impl Md2Hasher {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Md2Hasher {
        Md2Hasher(Md2::new())
    }
    pub fn update(&mut self, chunk: &[u8]) {
        self.0.update(chunk);
    }
    pub fn finalize(self) -> Vec<u8> {
        self.0.finalize().to_vec()
    }
}

#[wasm_bindgen]
pub struct WhirlpoolHasher(Whirlpool);

#[wasm_bindgen]
impl WhirlpoolHasher {
    #[wasm_bindgen(constructor)]
    pub fn new() -> WhirlpoolHasher {
        WhirlpoolHasher(Whirlpool::new())
    }
    pub fn update(&mut self, chunk: &[u8]) {
        self.0.update(chunk);
    }
    pub fn finalize(self) -> Vec<u8> {
        self.0.finalize().to_vec()
    }
}

#[wasm_bindgen]
pub struct Sm3Hasher(Sm3);

#[wasm_bindgen]
impl Sm3Hasher {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Sm3Hasher {
        Sm3Hasher(Sm3::new())
    }
    pub fn update(&mut self, chunk: &[u8]) {
        self.0.update(chunk);
    }
    pub fn finalize(self) -> Vec<u8> {
        self.0.finalize().to_vec()
    }
}

// Checksums and Non-Cryptographic Hashes (using simpler wrappers due to non-digest standard api)

#[wasm_bindgen]
pub struct Crc32Hasher(Crc32);

#[wasm_bindgen]
impl Crc32Hasher {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Crc32Hasher {
        Crc32Hasher(Crc32::new())
    }
    pub fn update(&mut self, chunk: &[u8]) {
        use std::hash::Hasher;
        self.0.write(chunk);
    }
    pub fn finalize(self) -> Vec<u8> {
        use std::hash::Hasher;
        let val = self.0.finish() as u32; // crc32 is 32-bit
        val.to_be_bytes().to_vec()
    }
}

#[wasm_bindgen]
pub struct Adler32Hasher(Adler32);

#[wasm_bindgen]
impl Adler32Hasher {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Adler32Hasher {
        Adler32Hasher(Adler32::new())
    }
    pub fn update(&mut self, chunk: &[u8]) {
        self.0.write_slice(chunk);
    }
    pub fn finalize(self) -> Vec<u8> {
        let val = self.0.checksum();
        val.to_be_bytes().to_vec()
    }
}

#[wasm_bindgen]
pub struct Fnv1Hasher(u32);

#[wasm_bindgen]
impl Fnv1Hasher {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Fnv1Hasher {
        Fnv1Hasher(2166136261)
    }
    pub fn update(&mut self, chunk: &[u8]) {
        for &byte in chunk {
            self.0 = self.0.wrapping_mul(16777619);
            self.0 ^= byte as u32;
        }
    }
    pub fn finalize(self) -> Vec<u8> {
        self.0.to_be_bytes().to_vec()
    }
}

#[wasm_bindgen]
pub struct Fnv1aHasher(u32);

#[wasm_bindgen]
impl Fnv1aHasher {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Fnv1aHasher {
        Fnv1aHasher(2166136261)
    }
    pub fn update(&mut self, chunk: &[u8]) {
        for &byte in chunk {
            self.0 ^= byte as u32;
            self.0 = self.0.wrapping_mul(16777619);
        }
    }
    pub fn finalize(self) -> Vec<u8> {
        self.0.to_be_bytes().to_vec()
    }
}

#[wasm_bindgen]
pub struct Murmur3Hasher {
    h1: u32,
    len: u32,
    buf: Vec<u8>,
}

#[wasm_bindgen]
impl Murmur3Hasher {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Murmur3Hasher {
        Murmur3Hasher {
            h1: 0, // seed
            len: 0,
            buf: Vec::new(),
        }
    }
    pub fn update(&mut self, chunk: &[u8]) {
        self.len += chunk.len() as u32;
        self.buf.extend_from_slice(chunk);
    }
    pub fn finalize(self) -> Vec<u8> {
        let mut h1 = self.h1;
        let c1: u32 = 0xcc9e2d51;
        let c2: u32 = 0x1b873593;

        let mut i = 0;
        let nblocks = self.buf.len() / 4;

        for _ in 0..nblocks {
            let mut k1 = u32::from_le_bytes([
                self.buf[i],
                self.buf[i+1],
                self.buf[i+2],
                self.buf[i+3]
            ]);
            i += 4;

            k1 = k1.wrapping_mul(c1);
            k1 = k1.rotate_left(15);
            k1 = k1.wrapping_mul(c2);

            h1 ^= k1;
            h1 = h1.rotate_left(13);
            h1 = h1.wrapping_mul(5).wrapping_add(0xe6546b64);
        }

        // tail
        let tail_len = self.buf.len() % 4;
        let mut k1: u32 = 0;
        if tail_len >= 3 { k1 ^= (self.buf[i+2] as u32) << 16; }
        if tail_len >= 2 { k1 ^= (self.buf[i+1] as u32) << 8; }
        if tail_len >= 1 {
            k1 ^= self.buf[i] as u32;
            k1 = k1.wrapping_mul(c1);
            k1 = k1.rotate_left(15);
            k1 = k1.wrapping_mul(c2);
            h1 ^= k1;
        }

        // finalization
        h1 ^= self.len;
        h1 ^= h1 >> 16;
        h1 = h1.wrapping_mul(0x85ebca6b);
        h1 ^= h1 >> 13;
        h1 = h1.wrapping_mul(0xc2b2ae35);
        h1 ^= h1 >> 16;

        h1.to_be_bytes().to_vec()
    }
}

#[wasm_bindgen]
pub struct XxHashHasher(xxhash_rust::xxh32::Xxh32);

#[wasm_bindgen]
impl XxHashHasher {
    #[wasm_bindgen(constructor)]
    pub fn new() -> XxHashHasher {
        XxHashHasher(xxhash_rust::xxh32::Xxh32::new(0))
    }
    pub fn update(&mut self, chunk: &[u8]) {
        self.0.update(chunk);
    }
    pub fn finalize(self) -> Vec<u8> {
        let val = self.0.digest();
        val.to_be_bytes().to_vec()
    }
}

#[wasm_bindgen]
pub struct SipHashHasher(siphasher::sip::SipHasher13);

#[wasm_bindgen]
impl SipHashHasher {
    #[wasm_bindgen(constructor)]
    pub fn new() -> SipHashHasher {
        use siphasher::sip::SipHasher13;
        // Seed with 0,0 keys
        SipHashHasher(SipHasher13::new_with_keys(0, 0))
    }
    pub fn update(&mut self, chunk: &[u8]) {
        use std::hash::Hasher;
        self.0.write(chunk);
    }
    pub fn finalize(self) -> Vec<u8> {
        use std::hash::Hasher;
        let val = self.0.finish();
        val.to_be_bytes().to_vec()
    }
}

// Decimal Checksums Luhn, Verhoeff, Damm

#[wasm_bindgen]
pub struct LuhnHasher {
    buf: Vec<u8>,
}

#[wasm_bindgen]
impl LuhnHasher {
    #[wasm_bindgen(constructor)]
    pub fn new() -> LuhnHasher {
        LuhnHasher { buf: Vec::new() }
    }
    pub fn update(&mut self, chunk: &[u8]) {
        self.buf.extend_from_slice(chunk);
    }
    pub fn finalize(self) -> Vec<u8> {
        let mut sum = 0;
        let mut alternate = true;
        for &val in self.buf.iter().rev() {
            let mut d = if val >= b'0' && val <= b'9' {
                (val - b'0') as u32
            } else {
                (val as u32) % 10
            };
            if alternate {
                d *= 2;
                if d > 9 { d -= 9; }
            }
            sum += d;
            alternate = !alternate;
        }
        let check_digit = (10 - (sum % 10)) % 10;
        vec![check_digit as u8]
    }
}

#[wasm_bindgen]
pub struct VerhoeffHasher {
    buf: Vec<u8>,
}

#[wasm_bindgen]
impl VerhoeffHasher {
    #[wasm_bindgen(constructor)]
    pub fn new() -> VerhoeffHasher {
        VerhoeffHasher { buf: Vec::new() }
    }
    pub fn update(&mut self, chunk: &[u8]) {
        self.buf.extend_from_slice(chunk);
    }
    pub fn finalize(self) -> Vec<u8> {
        let d: [[usize; 10]; 10] = [
            [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
            [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
            [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
            [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
            [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
            [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
            [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
            [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
            [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
            [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
        ];
        let p: [[usize; 10]; 8] = [
            [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
            [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
            [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
            [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
            [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
            [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
            [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
            [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
        ];
        let inv: [u8; 10] = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9];

        let mut c = 0;
        for (i, &val) in self.buf.iter().rev().enumerate() {
            let digit = if val >= b'0' && val <= b'9' {
                (val - b'0') as usize
            } else {
                (val as usize) % 10
            };
            let p_val = p[(i + 1) % 8][digit];
            c = d[c][p_val];
        }
        let check_digit = inv[c];
        vec![check_digit]
    }
}

#[wasm_bindgen]
pub struct DammHasher {
    buf: Vec<u8>,
}

#[wasm_bindgen]
impl DammHasher {
    #[wasm_bindgen(constructor)]
    pub fn new() -> DammHasher {
        DammHasher { buf: Vec::new() }
    }
    pub fn update(&mut self, chunk: &[u8]) {
        self.buf.extend_from_slice(chunk);
    }
    pub fn finalize(self) -> Vec<u8> {
        let q: [[usize; 10]; 10] = [
            [0, 3, 1, 7, 5, 9, 8, 6, 4, 2],
            [7, 0, 9, 2, 1, 5, 4, 8, 6, 3],
            [4, 2, 0, 6, 8, 7, 1, 3, 5, 9],
            [1, 7, 5, 0, 9, 8, 3, 4, 2, 6],
            [6, 1, 2, 3, 0, 4, 5, 9, 7, 8],
            [3, 6, 7, 4, 2, 0, 9, 5, 8, 1],
            [5, 8, 6, 9, 7, 2, 0, 1, 3, 4],
            [8, 9, 4, 5, 3, 6, 2, 0, 1, 7],
            [9, 4, 3, 8, 6, 1, 7, 2, 0, 5],
            [2, 5, 8, 1, 4, 3, 6, 7, 9, 0]
        ];

        let mut interim = 0;
        for &val in &self.buf {
            let digit = if val >= b'0' && val <= b'9' {
                (val - b'0') as usize
            } else {
                (val as usize) % 10
            };
            interim = q[interim][digit];
        }
        vec![interim as u8]
    }
}

// --- High-level Full-hashing API calls (for non-incremental text hashing fast paths) ---

#[wasm_bindgen]
pub fn hash_sha256(data: &[u8]) -> Vec<u8> {
    let mut hasher = Sha256Hasher::new();
    hasher.update(data);
    hasher.finalize()
}

#[wasm_bindgen]
pub fn hash_sha512(data: &[u8]) -> Vec<u8> {
    let mut hasher = Sha512Hasher::new();
    hasher.update(data);
    hasher.finalize()
}

#[wasm_bindgen]
pub fn hash_blake3(data: &[u8]) -> Vec<u8> {
    let mut hasher = Blake3Hasher::new();
    hasher.update(data);
    hasher.finalize()
}

#[wasm_bindgen]
pub fn hash_md5(data: &[u8]) -> Vec<u8> {
    let mut hasher = Md5Hasher::new();
    hasher.update(data);
    hasher.finalize()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_sha256_empty() {
        let out = hash_sha256(b"");
        let hex = hex::encode(out);
        assert_eq!(hex, "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
    }

    #[test]
    fn test_sha512_empty() {
        let out = hash_sha512(b"");
        let hex = hex::encode(out);
        assert_eq!(hex.len(), 128);
    }

    #[test]
    fn test_incremental_sha256() {
        let mut h = Sha256Hasher::new();
        h.update(b"hello");
        h.update(b" ");
        h.update(b"world");
        let out = h.finalize();
        let hex = hex::encode(out);
        assert_eq!(hex, hex::encode(hash_sha256(b"hello world")));
    }

    #[test]
    fn test_incremental_sha512() {
        let mut h = Sha512Hasher::new();
        h.update(b"hello");
        h.update(b" ");
        h.update(b"world");
        let out = h.finalize();
        let hex = hex::encode(out);
        assert_eq!(hex, hex::encode(hash_sha512(b"hello world")));
    }

    #[test]
    fn test_incremental_md5() {
        let mut h = Md5Hasher::new();
        h.update(b"hello");
        h.update(b" ");
        h.update(b"world");
        let out = h.finalize();
        let hex = hex::encode(out);
        assert_eq!(hex, hex::encode(hash_md5(b"hello world")));
    }

    #[test]
    fn test_incremental_blake3() {
        let mut h = Blake3Hasher::new();
        h.update(b"hello");
        h.update(b" ");
        h.update(b"world");
        let out = h.finalize();
        let hex = hex::encode(out);
        assert_eq!(hex, hex::encode(hash_blake3(b"hello world")));
    }

    #[test]
    fn test_decimal_checksums() {
        let mut lh = LuhnHasher::new();
        lh.update(b"7992739871");
        assert_eq!(lh.finalize()[0], 3);

        let mut vh = VerhoeffHasher::new();
        vh.update(b"236");
        assert_eq!(vh.finalize()[0], 3);

        let mut dh = DammHasher::new();
        dh.update(b"572");
        assert_eq!(dh.finalize()[0], 4);
    }
}
