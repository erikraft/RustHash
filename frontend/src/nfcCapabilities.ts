import { BrowserCapabilities } from './nfcControllerTypes';

export function detectBrowserCapabilities(): BrowserCapabilities {
  const secureContext = typeof window !== 'undefined' && window.isSecureContext === true;

  const webNfc = typeof window !== 'undefined' && 'NDEFReader' in window;
  const webUsb = typeof window !== 'undefined' && 'usb' in navigator;
  const webHid = typeof window !== 'undefined' && 'hid' in navigator;
  const webSerial = typeof window !== 'undefined' && 'serial' in navigator;

  return {
    webNfc,
    webUsb,
    webHid,
    webSerial,
    secureContext,
  };
}
