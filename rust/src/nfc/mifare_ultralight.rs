use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct MifareUltralight {
    uid: Vec<u8>,
    pages: Vec<Vec<u8>>,
}

#[wasm_bindgen]
impl MifareUltralight {
    #[wasm_bindgen(constructor)]
    pub fn new(uid: Vec<u8>) -> Self {
        // MIFARE Ultralight has 16 pages of 4 bytes each = 64 bytes total
        Self {
            uid,
            pages: vec![vec![0u8; 4]; 16],
        }
    }

    pub fn read_page(&self, page: u8) -> Result<Vec<u8>, String> {
        if page >= 16 {
            return Err("Invalid page index".to_string());
        }
        Ok(self.pages[page as usize].clone())
    }

    pub fn write_page(&mut self, page: u8, data: &[u8]) -> Result<(), String> {
        if page >= 16 {
            return Err("Invalid page index".to_string());
        }
        if data.len() != 4 {
            return Err("Page size must be exactly 4 bytes".to_string());
        }
        // Pages 0 to 2 are read-only or OTP (Manufacturer/Lock bytes) in real tags.
        if page < 3 {
            return Err("Pages 0-2 are read-only or lock/OTP and cannot be overwritten".to_string());
        }
        self.pages[page as usize] = data.to_vec();
        Ok(())
    }
}
