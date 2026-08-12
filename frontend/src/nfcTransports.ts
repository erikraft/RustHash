import { NfcState, NfcOperationType, NfcTagMetadata } from './nfcControllerTypes';

export interface NfcTransportAdapter {
  name: string;
  isSupported(): boolean;
  scan(onTagDetected: (tag: NfcTagMetadata, ndefMessage?: any) => void, abortSignal?: AbortSignal): Promise<void>;
  write(records: any[], abortSignal?: AbortSignal): Promise<void>;
}

// 1. WebNFC Adapter
export class WebNfcTransportAdapter implements NfcTransportAdapter {
  name = 'WebNFC';

  isSupported(): boolean {
    return typeof window !== 'undefined' && 'NDEFReader' in window;
  }

  async scan(onTagDetected: (tag: NfcTagMetadata, ndefMessage?: any) => void, abortSignal?: AbortSignal): Promise<void> {
    if (!this.isSupported()) {
      throw new Error('NFC_NOT_SUPPORTED');
    }

    try {
      // @ts-ignore
      const reader = new NDEFReader();

      if (abortSignal) {
        abortSignal.addEventListener('abort', () => {
          // Native Abort is handled by reader.scan({ signal: abortSignal }) if supported,
          // but we manually protect state flow too.
        });
      }

      await reader.scan({ signal: abortSignal });

      reader.onreadingerror = () => {
        throw new Error('TAG_READ_FAILED');
      };

      reader.onreading = (event: any) => {
        const serialNumber = event.serialNumber || '00:00:00:00';
        const tag: NfcTagMetadata = {
          uid: serialNumber.replace(/:/g, '').toUpperCase(),
          type: 'NDEF Tag',
          technology: 'ISO/IEC 14443 Type A / NDEF',
        };
        onTagDetected(tag, event.message);
      };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new Error('NFC_TIMEOUT');
      }
      if (err.name === 'NotAllowedError') {
        throw new Error('NFC_PERMISSION_DENIED');
      }
      throw new Error('TAG_READ_FAILED');
    }
  }

  async write(records: any[], abortSignal?: AbortSignal): Promise<void> {
    if (!this.isSupported()) {
      throw new Error('NFC_NOT_SUPPORTED');
    }

    try {
      // @ts-ignore
      const writer = new NDEFReader();
      await writer.write({ records }, { signal: abortSignal });
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new Error('NFC_TIMEOUT');
      }
      if (err.name === 'NotAllowedError') {
        throw new Error('NFC_PERMISSION_DENIED');
      }
      throw new Error('NFC_WRITE_FAILED');
    }
  }
}

// 2. Mock/Experimental WebUSB Adapter
export class WebUsbTransportAdapter implements NfcTransportAdapter {
  name = 'WebUSB (Generic / ACR122U)';

  isSupported(): boolean {
    return typeof window !== 'undefined' && 'usb' in navigator;
  }

  async scan(onTagDetected: (tag: NfcTagMetadata) => void, abortSignal?: AbortSignal): Promise<void> {
    if (!this.isSupported()) {
      throw new Error('USB_NOT_SUPPORTED');
    }

    try {
      // Simulate connecting to ACS ACR122U USB CCID or PN532 Reader
      const devices = await navigator.usb.getDevices();

      // Request device if none authorized yet
      if (devices.length === 0) {
        // This usually triggers native browser prompt.
        // We will simulate permission or wait for authorized connection.
      }

      // Setting a simulated 1s interval for Tag detection over USB APDU commands
      return new Promise<void>((resolve, reject) => {
        const timer = setTimeout(() => {
          const fakeTag: NfcTagMetadata = {
            uid: 'DEADC0DE',
            type: 'MIFARE Classic 1K',
            technology: 'ISO/IEC 14443 Type A (WebUSB/CCID)',
          };
          onTagDetected(fakeTag);
          resolve();
        }, 1500);

        if (abortSignal) {
          abortSignal.addEventListener('abort', () => {
            clearTimeout(timer);
            reject(new Error('NFC_TIMEOUT'));
          });
        }
      });
    } catch (err: any) {
      throw new Error('USB_PERMISSION_DENIED');
    }
  }

  async write(records: any[], abortSignal?: AbortSignal): Promise<void> {
    // Write simulation over USB/CCID
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        resolve();
      }, 1000);

      if (abortSignal) {
        abortSignal.addEventListener('abort', () => {
          clearTimeout(timer);
          reject(new Error('NFC_TIMEOUT'));
        });
      }
    });
  }
}

// 3. Mock/Experimental WebHID Adapter
export class WebHidTransportAdapter implements NfcTransportAdapter {
  name = 'WebHID (PCSC Reader)';

  isSupported(): boolean {
    return typeof window !== 'undefined' && 'hid' in navigator;
  }

  async scan(onTagDetected: (tag: NfcTagMetadata) => void, abortSignal?: AbortSignal): Promise<void> {
    if (!this.isSupported()) {
      throw new Error('USB_NOT_SUPPORTED');
    }
    return new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        const fakeTag: NfcTagMetadata = {
          uid: 'BEEFCAFE',
          type: 'MIFARE Ultralight',
          technology: 'ISO/IEC 14443 Type A (WebHID)',
        };
        onTagDetected(fakeTag);
        resolve();
      }, 1500);

      if (abortSignal) {
        abortSignal.addEventListener('abort', () => {
          clearTimeout(timer);
          reject(new Error('NFC_TIMEOUT'));
        });
      }
    });
  }

  async write(records: any[], abortSignal?: AbortSignal): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

// 4. Mock/Experimental WebSerial Adapter
export class WebSerialTransportAdapter implements NfcTransportAdapter {
  name = 'WebSerial (PN532)';

  isSupported(): boolean {
    return typeof window !== 'undefined' && 'serial' in navigator;
  }

  async scan(onTagDetected: (tag: NfcTagMetadata) => void, abortSignal?: AbortSignal): Promise<void> {
    if (!this.isSupported()) {
      throw new Error('USB_NOT_SUPPORTED');
    }
    return new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        const fakeTag: NfcTagMetadata = {
          uid: 'ABCDEF01',
          type: 'MIFARE DESFire',
          technology: 'ISO/IEC 14443 Type A (WebSerial)',
        };
        onTagDetected(fakeTag);
        resolve();
      }, 1500);

      if (abortSignal) {
        abortSignal.addEventListener('abort', () => {
          clearTimeout(timer);
          reject(new Error('NFC_TIMEOUT'));
        });
      }
    });
  }

  async write(records: any[], abortSignal?: AbortSignal): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 1000));
  }
}
