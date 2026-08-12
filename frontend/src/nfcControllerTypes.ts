export type NfcState =
  | 'Unsupported'
  | 'Available'
  | 'PermissionRequired'
  | 'Connecting'
  | 'Connected'
  | 'WaitingForTag'
  | 'TagDetected'
  | 'Reading'
  | 'Writing'
  | 'Success'
  | 'Error'
  | 'Disconnected'
  | 'Cancelled';

export type NfcOperationType = 'Read' | 'Write' | 'Format' | 'MifareClassicAuth' | 'MifareClassicRead' | 'MifareClassicWrite';

export interface BrowserCapabilities {
  webNfc: boolean;
  webUsb: boolean;
  webHid: boolean;
  webSerial: boolean;
  secureContext: boolean;
}

export interface NfcTagMetadata {
  uid: string;
  type: string;
  technology: string;
}

export interface NfcControllerState {
  state: NfcState;
  capabilities: BrowserCapabilities;
  operation: NfcOperationType | null;
  tagInfo: NfcTagMetadata | null;
  error: string | null;
}
