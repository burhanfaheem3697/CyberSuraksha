const Partner = require("../backend/models/Partner");
const PolicyRule = require("../backend/models/PolicyRule");

exports.validateWithRules = async (consentRequest) => {
  const {
    partnerId,
    purpose, // This should be the main_category from the classifier
    fieldsRequested,
    requestedDurationDays,
    partnerTrustScore,
    dataResidency, // e.g., "IN"
    crossBorder, // boolean, if cross-border transfer is requested
    quantumSafe, // boolean, if quantum-safe is required
    anonymization, // boolean, if anonymization is required
  } = consentRequest;

  const rule = await PolicyRule.findOne({ purpose });
  console.log(rule);
  if (!rule) return { approved: false, source: "RULE", reason: "No policy defined for this purpose" };

  const partner = await Partner.findById(partnerId);
  console.log(partner);
  if (!partner) return { approved: false, source: "RULE", reason: "Invalid partner ID" };

  // Jurisdiction check
  // if (jurisdiction && rule.jurisdiction?.length && !rule.jurisdiction.includes(jurisdiction)) {
  //   return { approved: false, source: "RULE", reason: `Jurisdiction ${jurisdiction} not allowed` };
  // }

  // Regulatory reference check (optional, for logging/audit)
  // You can log rule.regulatoryRefs if needed

  // Field-level restriction
  const denied = fieldsRequested.filter(
    (field) => rule.deniedFields.includes(field) || (rule.allowedFields.length && !rule.allowedFields.includes(field))
  );
  if (denied.length > 0) {
    return { approved: false, source: "RULE", reason: `Disallowed fields: ${denied.join(", ")}` };
  }

  // Retention
  if (requestedDurationDays > rule.retentionDays) {
    return { approved: false, source: "RULE", reason: `Retention exceeds ${rule.retentionDays} days` };
  }

  // Trust score
  if (partnerTrustScore < rule.minTrustScore) {
    return { approved: false, source: "RULE", reason: `Trust score too low` };
  }

  // Cross-border data transfer
  if (crossBorder && !rule.crossBorderAllowed) {
    return { approved: false, source: "RULE", reason: "Cross-border transfer not allowed" };
  }

  // Data residency
  if (dataResidency && rule.dataResidency && rule.dataResidency !== "ANY" && dataResidency !== rule.dataResidency) {
    return { approved: false, source: "RULE", reason: `Data residency must be ${rule.dataResidency}` };
  }

  // Consent required
  if (rule.consentRequired === false) {
    return { approved: false, source: "RULE", reason: "Consent not required for this purpose" };
  }

  // Quantum-safe requirement
  if (quantumSafe && !rule.quantumSafeRequired) {
    return { approved: false, source: "RULE", reason: "Quantum-safe processing not allowed for this purpose" };
  }

  // Anonymization requirement
  if (anonymization && !rule.anonymizationRequired) {
    return { approved: false, source: "RULE", reason: "Anonymization not allowed for this purpose" };
  }

  // User revocability
  // (You can add logic here if you want to enforce userRevocable)

  // Time (if you want to add allowedHours back, you can do so here)

  // Metadata checks (optional, for logging/audit)
  // e.g., rule.metadata.piiSensitivity, rule.metadata.storageType, rule.metadata.sandboxed

  return { approved: true, source: "RULE" };
};