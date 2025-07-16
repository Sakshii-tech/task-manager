import crypto from 'crypto';

const algorithm = 'aes-256-cbc';
const secret = process.env.ID_SECRET || 'YOUR_SUPER_SECRET_32_BYTE_KEY_123!';
const ivLength = 16;

// ⚡ Make sure your secret key is exactly 32 bytes
const key = crypto.createHash('sha256').update(secret).digest();

export const encryptId = (id) => {
  const iv = crypto.randomBytes(ivLength);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(id.toString(), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
};

export const decryptId = (encrypted) => {
  const [ivHex, encryptedData] = encrypted.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return parseInt(decrypted, 10);
};
