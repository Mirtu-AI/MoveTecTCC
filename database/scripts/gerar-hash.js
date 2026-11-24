// gerar-hash.js
import crypto from 'crypto';

const senha = "123456";
const hash = crypto.createHash('sha256').update(senha).digest('hex');

console.log(hash);