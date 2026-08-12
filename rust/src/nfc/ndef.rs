use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[derive(Clone, Debug)]
pub struct NdefRecord {
    tnf: u8, // Type Name Format
    record_type: Vec<u8>,
    id: Vec<u8>,
    payload: Vec<u8>,
}

#[wasm_bindgen]
impl NdefRecord {
    #[wasm_bindgen(constructor)]
    pub fn new(tnf: u8, record_type: Vec<u8>, id: Vec<u8>, payload: Vec<u8>) -> Self {
        Self { tnf, record_type, id, payload }
    }

    #[wasm_bindgen(getter)]
    pub fn tnf(&self) -> u8 {
        self.tnf
    }

    #[wasm_bindgen(getter)]
    pub fn record_type(&self) -> Vec<u8> {
        self.record_type.clone()
    }

    #[wasm_bindgen(getter)]
    pub fn id(&self) -> Vec<u8> {
        self.id.clone()
    }

    #[wasm_bindgen(getter)]
    pub fn payload(&self) -> Vec<u8> {
        self.payload.clone()
    }

    pub fn to_bytes(&self) -> Vec<u8> {
        let mut data = Vec::new();
        // Simple NDEF record layout:
        // [Flags: 1 byte] [Type Length: 1 byte] [Payload Length: 4 bytes] [ID Length: 1 byte]
        // [Type] [ID] [Payload]
        let mut flags = 0x80u8; // MB (Message Begin) and ME (Message End) set for single record simplicity
        flags |= self.tnf & 0x07;

        if !self.id.is_empty() {
            flags |= 0x08; // IL (ID Length field present)
        }
        flags |= 0x10; // SR (Short Record, payload <= 255)

        data.push(flags);
        data.push(self.record_type.len() as u8);
        data.push(self.payload.len() as u8); // Since SR is set, payload len is 1 byte
        if !self.id.is_empty() {
            data.push(self.id.len() as u8);
        }
        data.extend_from_slice(&self.record_type);
        if !self.id.is_empty() {
            data.extend_from_slice(&self.id);
        }
        data.extend_from_slice(&self.payload);
        data
    }

    pub fn from_bytes(bytes: &[u8]) -> Result<Self, String> {
        if bytes.len() < 3 {
            return Err("Record too short".to_string());
        }
        let flags = bytes[0];
        let tnf = flags & 0x07;
        let type_len = bytes[1] as usize;
        let payload_len = bytes[2] as usize; // Short Record assumed for simplicity

        let has_id = (flags & 0x08) != 0;
        let mut offset = 3;

        let id_len = if has_id {
            if bytes.len() <= offset {
                return Err("Missing ID length byte".to_string());
            }
            let l = bytes[offset] as usize;
            offset += 1;
            l
        } else {
            0
        };

        if bytes.len() < offset + type_len + id_len + payload_len {
            return Err("Buffer overflow parsing NDEF Record".to_string());
        }

        let record_type = bytes[offset .. offset + type_len].to_vec();
        offset += type_len;

        let id = if has_id {
            let res = bytes[offset .. offset + id_len].to_vec();
            offset += id_len;
            res
        } else {
            Vec::new()
        };

        let payload = bytes[offset .. offset + payload_len].to_vec();

        Ok(Self { tnf, record_type, id, payload })
    }
}
