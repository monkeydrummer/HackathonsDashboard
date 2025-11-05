// Obfuscated password authentication
// The default password is obfuscated in the code

const OBFUSCATION_KEY = 'rocscience-hackathon-2025';

// This is the obfuscated version of the default password
// To change the password, run: node scripts/encode-password.js "your-new-password"
const OBFUSCATED_DEFAULT_PASSWORD = 'Gg4AGAIdDQENVx1aVQ==';

/**
 * Decode an obfuscated password string
 */
function decodePassword(obfuscated: string): string {
  try {
    const decoded = Buffer.from(obfuscated, 'base64').toString();
    return xorWithKey(decoded, OBFUSCATION_KEY);
  } catch (error) {
    console.error('Failed to decode password');
    return '';
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
 * Encode a password (for generating obfuscated passwords)
 */
export function encodePassword(password: string): string {
  const xored = xorWithKey(password, OBFUSCATION_KEY);
  return Buffer.from(xored).toString('base64');
}

/**
 * Verify if a password matches the default or environment password
 */
export function verifyPassword(inputPassword: string): boolean {
  // Check against obfuscated default password
  const defaultPassword = decodePassword(OBFUSCATED_DEFAULT_PASSWORD);
  if (inputPassword === defaultPassword) {
    return true;
  }
  
  // Check against environment variable (if set)
  const envPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
  if (envPassword && inputPassword === envPassword) {
    return true;
  }
  
  return false;
}

