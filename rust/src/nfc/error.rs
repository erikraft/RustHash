use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum NfcError {
    NfcNotSupported,
    NfcPermissionDenied,
    NfcTimeout,
    NfcTagNotFound,
    NfcWriteFailed,
    UsbNotSupported,
    UsbPermissionDenied,
    UsbDeviceNotFound,
    UsbDeviceDisconnected,
    UsbProtocolUnsupported,
    TagAuthFailed,
    TagReadFailed,
    TagWriteFailed,
    InvalidTag,
    UnsupportedTag,
    InvalidBuffer,
    Unknown,
}

impl NfcError {
    pub fn to_str(&self) -> &'static str {
        match self {
            Self::NfcNotSupported => "NFC_NOT_SUPPORTED",
            Self::NfcPermissionDenied => "NFC_PERMISSION_DENIED",
            Self::NfcTimeout => "NFC_TIMEOUT",
            Self::NfcTagNotFound => "NFC_TAG_NOT_FOUND",
            Self::NfcWriteFailed => "NFC_WRITE_FAILED",
            Self::UsbNotSupported => "USB_NOT_SUPPORTED",
            Self::UsbPermissionDenied => "USB_PERMISSION_DENIED",
            Self::UsbDeviceNotFound => "USB_DEVICE_NOT_FOUND",
            Self::UsbDeviceDisconnected => "USB_DEVICE_DISCONNECTED",
            Self::UsbProtocolUnsupported => "USB_PROTOCOL_UNSUPPORTED",
            Self::TagAuthFailed => "TAG_AUTH_FAILED",
            Self::TagReadFailed => "TAG_READ_FAILED",
            Self::TagWriteFailed => "TAG_WRITE_FAILED",
            Self::InvalidTag => "INVALID_TAG",
            Self::UnsupportedTag => "UNSUPPORTED_TAG",
            Self::InvalidBuffer => "INVALID_BUFFER",
            Self::Unknown => "UNKNOWN",
        }
    }
}
