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
}
