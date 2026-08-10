use wasm_bindgen::prelude::*;
use sha2::{Digest, Sha256, Sha512};
use blake3::Hasher as Blake3;
use md5::Md5;

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
        use md5::Digest as _;
        Md5Hasher(Md5::new())
    }

    pub fn update(&mut self, chunk: &[u8]) {
        use md5::Digest as _;
        self.0.update(chunk);
    }

    pub fn finalize(self) -> Vec<u8> {
        use md5::Digest as _;
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
pub fn hash_sha256(data: &[u8]) -> Vec<u8> {
    let mut hasher = Sha256::new();
    hasher.update(data);
    hasher.finalize().to_vec()
}

#[wasm_bindgen]
pub fn hash_sha512(data: &[u8]) -> Vec<u8> {
    let mut hasher = Sha512::new();
    hasher.update(data);
    hasher.finalize().to_vec()
}

#[wasm_bindgen]
pub fn hash_blake3(data: &[u8]) -> Vec<u8> {
    let mut hasher = Blake3::new();
    hasher.update(data);
    hasher.finalize().as_bytes().to_vec()
}

#[wasm_bindgen]
pub fn hash_md5(data: &[u8]) -> Vec<u8> {
    use md5::Digest as _;
    let mut hasher = Md5::new();
    hasher.update(data);
    hasher.finalize().to_vec()
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
}
