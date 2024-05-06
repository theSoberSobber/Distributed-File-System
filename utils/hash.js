const crypto = require('crypto');

function calculateHash(data) {
  const hash = crypto.createHash('sha256');
  hash.update(data);
  return hash.digest('hex');
}

module.exports = {calculateHash};