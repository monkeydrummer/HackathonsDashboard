// Simple obfuscation utility for scores
// Note: This is obfuscation, not encryption. It prevents casual viewing in the repo.

const OBFUSCATION_KEY = 'rocscience-hackathon-2025';

/**
 * Encodes scores object to an obfuscated string
 */
export function encodeScores(scores: Record<string, number>): string {
  const json = JSON.stringify(scores);
  const encoded = Buffer.from(json).toString('base64');
  
  // XOR with key for additional obfuscation
  const xored = xorWithKey(encoded, OBFUSCATION_KEY);
  return Buffer.from(xored).toString('base64');
}

/**
 * Decodes an obfuscated string back to scores object
 */
export function decodeScores(obfuscated: string): Record<string, number> {
  try {
    const decoded = Buffer.from(obfuscated, 'base64').toString();
    const unxored = xorWithKey(decoded, OBFUSCATION_KEY);
    const json = Buffer.from(unxored, 'base64').toString();
    return JSON.parse(json);
  } catch (error) {
    console.error('Failed to decode scores:', error);
    // Return default scores if decoding fails
    return {
      workScope: 0,
      polish: 0,
      funUseful: 0,
      creativity: 0,
      innovation: 0,
      doesItWork: 0,
    };
  }
}

/**
 * XOR string with key for simple encryption
 */
function xorWithKey(str: string, key: string): string {
  let result = '';
  for (let i = 0; i < str.length; i++) {
    result += String.fromCharCode(str.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return result;
}

/**
 * Check if a value is an obfuscated string (base64) or a plain scores object
 */
export function isObfuscated(value: any): boolean {
  return typeof value === 'string';
}

