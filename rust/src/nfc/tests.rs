#[cfg(test)]
mod tests {
    use crate::nfc::ndef::NdefRecord;
    use crate::nfc::mifare_classic::MifareClassic1k;
    use crate::nfc::mifare_ultralight::MifareUltralight;
    use crate::nfc::desfire::MifareDesfire;
    use crate::nfc::transport::NfcTransport;

    #[test]
    fn test_ndef_serialization() {
        let rec = NdefRecord::new(0x01, b"T".to_vec(), b"id".to_vec(), b"Hello".to_vec());
        let serialized = rec.to_bytes();
        assert!(!serialized.is_empty());

        let parsed = NdefRecord::from_bytes(&serialized).unwrap();
        assert_eq!(parsed.tnf(), 0x01);
        assert_eq!(parsed.record_type(), b"T");
        assert_eq!(parsed.id(), b"id");
        assert_eq!(parsed.payload(), b"Hello");
    }

    #[test]
    fn test_mifare_classic_operations() {
        let mut card = MifareClassic1k::new(vec![0x01, 0x02, 0x03, 0x04]);
        assert!(card.authenticate(0, &[0xFF; 6], false).unwrap());

        let res_err = card.write_block(0, &[0x00; 16]);
        assert!(res_err.is_err(), "Block 0 should be read-only");

        let test_data = vec![0xAA; 16];
        card.write_block(1, &test_data).unwrap();
        let read_data = card.read_block(1).unwrap();
        assert_eq!(read_data, test_data);
    }

    #[test]
    fn test_mifare_ultralight_operations() {
        let mut card = MifareUltralight::new(vec![0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07]);

        let res_err = card.write_page(1, &[0x00; 4]);
        assert!(res_err.is_err(), "Pages 0-2 should be protected");

        let test_data = vec![0xCC, 0xDD, 0xEE, 0xFF];
        card.write_page(3, &test_data).unwrap();
        let read_data = card.read_page(3).unwrap();
        assert_eq!(read_data, test_data);
    }

    #[test]
    fn test_desfire_operations() {
        let card = MifareDesfire::new(vec![0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07]);
        assert!(card.select_application(0x001122).unwrap());
        assert!(card.authenticate_aes(0, &[0x00; 16]).unwrap());
    }

    #[test]
    fn test_transport_apdu() {
        let transport = NfcTransport::new("WebUSB".to_string());
        assert_eq!(transport.name(), "WebUSB");
        let resp = transport.transmit_apdu(&[0x00, 0xA4, 0x04, 0x00, 0x00]).unwrap();
        assert_eq!(resp, vec![0x90, 0x00]);
    }
}
