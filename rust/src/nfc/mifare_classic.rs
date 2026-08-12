use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct MifareClassic1k {
    uid: Vec<u8>,
    blocks: Vec<Vec<u8>>,
}

#[wasm_bindgen]
impl MifareClassic1k {
    #[wasm_bindgen(constructor)]
    pub fn new(uid: Vec<u8>) -> Self {
        // MIFARE Classic 1K has 16 sectors, 4 blocks per sector = 64 blocks, 16 bytes each
        Self {
            uid,
            blocks: vec![vec![0u8; 16]; 64],
        }
    }

    pub fn authenticate(&self, sector: u8, key: &[u8], _is_key_b: bool) -> Result<bool, String> {
        if sector >= 16 {
            return Err("Invalid sector index".to_string());
        }
        if key.len() != 6 {
            return Err("Key must be 6 bytes long".to_string());
        }
        // Simulated Crypto1 authentication. In realistic WASM contexts,
        // we'd do a mock verification or perform actual cryptography if passed through.
        // We will assume default keys like FFFFFFFFFFFF or a provided user key.
        Ok(true)
    }

    pub fn read_block(&self, block: u8) -> Result<Vec<u8>, String> {
        if block >= 64 {
            return Err("Invalid block index".to_string());
        }
        Ok(self.blocks[block as usize].clone())
    }

    pub fn write_block(&mut self, block: u8, data: &[u8]) -> Result<(), String> {
        if block >= 64 {
            return Err("Invalid block index".to_string());
        }
        if data.len() != 16 {
            return Err("Block size must be exactly 16 bytes".to_string());
        }
        // Block 0 is read-only manufacturer block
        if block == 0 {
            return Err("Block 0 is manufacturer block and is read-only".to_string());
        }
        self.blocks[block as usize] = data.to_vec();
        Ok(())
    }
}
