const crypto = require("crypto");

function hashFinancialData(data) {
  // Sort keys deterministically
  const canonical = JSON.stringify(data, Object.keys(data).sort());
  // Hash using SHA-256
  const hash = crypto.createHash("sha256").update(canonical).digest("hex");
  // Return with 0x prefix
  return "0x" + hash;
}

module.exports = { hashFinancialData }; 