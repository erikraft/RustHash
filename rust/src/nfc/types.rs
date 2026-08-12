use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum NfcTagType {
    Ndef,
    MifareClassic1k,
    MifareClassic4k,
    MifareUltralight,
    MifareUltralightC,
    MifareUltralightEv1,
    MifareDesfire,
    Unknown,
}

#[wasm_bindgen]
#[derive(Clone, Debug)]
pub struct NfcTagInfo {
    tag_type: NfcTagType,
    uid: Vec<u8>,
    tech_list: Vec<String>,
}

#[wasm_bindgen]
impl NfcTagInfo {
    #[wasm_bindgen(constructor)]
    pub fn new(tag_type: NfcTagType, uid: Vec<u8>, tech_list: Vec<String>) -> Self {
        Self { tag_type, uid, tech_list }
    }

    #[wasm_bindgen(getter)]
    pub fn tag_type(&self) -> NfcTagType {
        self.tag_type
    }

    #[wasm_bindgen(getter)]
    pub fn uid(&self) -> Vec<u8> {
        self.uid.clone()
    }

    #[wasm_bindgen(getter)]
    pub fn tech_list(&self) -> Vec<String> {
        self.tech_list.clone()
    }

    #[wasm_bindgen(getter)]
    pub fn uid_hex(&self) -> String {
        let mut s = String::new();
        for &b in &self.uid {
            s.push_str(&format!("{:02x}", b));
        }
        s
    }
}
