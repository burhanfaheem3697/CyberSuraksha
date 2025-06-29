// Utility for masking various fields in a data object

function maskIncome(value) {
  if (value === undefined || value === null) return value;
  const str = value.toString();
  if (str.length > 2) return str.slice(0, 2) + '*'.repeat(str.length - 2);
  return '**';
}

function maskCreditScore(value) {
  if (value === undefined || value === null) return value;
  return '***';
}

function maskTxnSummary(value) {
  if (!value || typeof value !== 'object') return value;
  // Mask all values in txn_summary using income masking logic
  const masked = {};
  for (const key in value) {
    if (Object.prototype.hasOwnProperty.call(value, key)) {
      const v = value[key];
      const str = v !== undefined && v !== null ? v.toString() : '';
      if (str.length > 2) {
        masked[key] = str.slice(0, 2) + '*'.repeat(str.length - 2);
      } else {
        masked[key] = '**';
      }
    }
  }
  return masked;
}

function maskEmployer(value) {
  if (!value) return value;
  return value[0] + '***';
}

function maskLastUpdated(value) {
  return '****-**-**';
}

function maskAadhaar(value) {
  if (!value) return value;
  return '****-****-****';
}

function maskPan(value) {
  if (!value) return value;
  return '*****';
}

function maskAddress(value) {
  if (!value) return value;
  return '********';
}

const fieldMaskers = {
  income: maskIncome,
  credit_score: maskCreditScore,
  txn_summary: maskTxnSummary,
  employer: maskEmployer,
  last_updated: maskLastUpdated,
  aadhaar: maskAadhaar,
  pan: maskPan,
  address: maskAddress,
};

function maskFields(data, fieldsToMask) {
  const masked = { ...data };
  fieldsToMask.forEach(field => {
    if (masked.hasOwnProperty(field) && fieldMaskers[field]) {
      masked[field] = fieldMaskers[field](masked[field]);
    }
  });
  return masked;
}

module.exports = { maskFields, fieldMaskers }; 