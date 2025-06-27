exports.buildPromptFromConsent = (request) => {
  const { partnerName, purpose, fieldsRequested, requestedDurationDays, partnerTrustScore } = request;

  return `
You are a consent policy evaluator under India's DPDP Act.

Rules:
- Only necessary data should be requested.
- Aadhaar should not be requested unless mandatory.
- Trust score must be ≥ 7 for sensitive data.
- Retention must be ≤ 7 days.

Request:
Partner: ${partnerName}
Purpose: ${purpose}
Requested Fields: ${fieldsRequested.join(", ")}
Retention: ${requestedDurationDays} days
Trust Score: ${partnerTrustScore}

Respond in JSON:
{
  "approved": true/false,
  "reason": "short explanation"
}
`;
}; 