import { describe, test, expect } from 'vitest';
import { detectBrowserCapabilities } from './nfcCapabilities';

describe('NFC Capabilities & State Tests', () => {
  test('should detect browser support', () => {
    const caps = detectBrowserCapabilities();
    expect(typeof caps.secureContext).toBe('boolean');
    expect(typeof caps.webNfc).toBe('boolean');
  });
});
