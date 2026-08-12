use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct NfcTransport {
    name: String,
}

#[wasm_bindgen]
impl NfcTransport {
    #[wasm_bindgen(constructor)]
    pub fn new(name: String) -> Self {
        Self { name }
    }

    #[wasm_bindgen(getter)]
    pub fn name(&self) -> String {
        self.name.clone()
    }

    pub fn transmit_apdu(&self, apdu: &[u8]) -> Result<Vec<u8>, String> {
        if apdu.is_empty() {
            return Err("APDU cannot be empty".to_string());
        }
        // Simulated APDU ISO/IEC 7816-4 transmission
        // Returns Success response (90 00)
        Ok(vec![0x90, 0x00])
    }
}
