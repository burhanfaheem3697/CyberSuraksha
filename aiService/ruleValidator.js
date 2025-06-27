const Partner = require("../backend/models/Partner");
const PolicyRule = require("../backend/models/PolicyRule");

exports.validateWithRules = async (consentRequest) => {
  const { partnerId, purpose, fieldsRequested, requestedDurationDays, timestamp } = consentRequest;

  const rule = await PolicyRule.findOne({ purpose });
  if (!rule) return { approved: false, source: "RULE", reason: "No policy defined for this purpose" };

  const partner = await Partner.findById(partnerId);
  if (!partner) return { approved: false, source: "RULE", reason: "Invalid partner ID" };

  // Field-level restriction
  const denied = fieldsRequested.filter(
    (field) => rule.deniedFields.includes(field) || !rule.allowedFields.includes(field)
  );
  if (denied.length > 0) {
    return { approved: false, source: "RULE", reason: `Disallowed fields: ${denied.join(", ")}` };
  }

  // Retention
  if (requestedDurationDays > rule.retentionDays) {
    return { approved: false, source: "RULE", reason: `Retention exceeds ${rule.retentionDays} days` };
  }

  // Trust score
  if (partner.trust_score < rule.minTrustScore) {
    return { approved: false, source: "RULE", reason: `Trust score too low` };
  }

  // Time
  const hour = new Date(timestamp).getHours();
  if (hour < rule.allowedHours.start || hour > rule.allowedHours.end) {
    return { approved: false, source: "RULE", reason: "Not within allowed access hours" };
  }

  return { approved: true, source: "RULE" };
}; 