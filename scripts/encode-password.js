// Script to encode a password for use in the codebase
// Usage: node scripts/encode-password.js "your-password"

const OBFUSCATION_KEY = 'rocscience-hackathon-2025';

function encodePassword(password) {
  const xored = xorWithKey(password, OBFUSCATION_KEY);
  return Buffer.from(xored).toString('base64');
}

function xorWithKey(str, key) {
  let result = '';
  for (let i = 0; i < str.length; i++) {
    result += String.fromCharCode(str.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return result;
}

// Get password from command line argument
const password = process.argv[2];

if (!password) {
  console.error('Usage: node scripts/encode-password.js "your-password"');
  process.exit(1);
}

const encoded = encodePassword(password);
console.log('\n✓ Password encoded successfully!');
console.log('\nObfuscated password:');
console.log(encoded);
console.log('\nUpdate OBFUSCATED_DEFAULT_PASSWORD in lib/auth.ts with this value.');
console.log('');

