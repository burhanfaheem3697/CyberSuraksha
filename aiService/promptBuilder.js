exports.buildPromptFromConsent = (request) => {
  const {
    partnerName,
    purpose,
    rawPurpose,
    fieldsRequested,
  } = request;

  return `
You are a consent policy evaluator and intent classifier under India's DPDP Act and global privacy standards.

Given the following consent request, do the following:
1. Infer the intent behind the requested fields (explain why each field might be needed for the stated purpose).
2. Validate the request for compliance, including any edge cases or policy gaps not covered by deterministic rules.
3. If you find any risk, missing policy, or compliance issue, explain it.

Request:
Partner: ${partnerName}
Purpose (category): ${purpose}
Purpose (free text): ${rawPurpose}
Requested Fields: ${Array.isArray(fieldsRequested) ? fieldsRequested.join(", ") : fieldsRequested}

Respond in JSON:
{
  "approved": true/false,
  "reason": "short explanation",
  "field_intent": {
    "field1": "reason for field1",
    "field2": "reason for field2"
  },
  "compliance_gaps": ["list any missing or ambiguous policy areas"]
}
`;
}; 