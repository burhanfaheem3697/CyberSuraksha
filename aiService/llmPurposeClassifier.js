const { callLLM } = require('./utils/llmCaller');

exports.classifyPurpose = async (consentRequest) => {
  const {
    rawPurpose,
    dataFields,
    duration,
    jurisdiction,
    dataResidency,
    crossBorder,
    quantumSafe,
    anonymization
  } = consentRequest;

  const prompt = `
You're a purpose classifier for a fintech consent system. Given the following consent request, output a JSON like:
{
  "main_category": "loan" | "insurance" | "budgeting" | "other",
  "sub_category": "loan::education" | "insurance::migration" | null,
  "requires_sensitive_data": true/false,
  "justification": "short reasoning"
}

Consent Request:
Purpose (free text): ${rawPurpose}
`;

  const response = await callLLM(prompt);
  const start = response.indexOf('{');
  const end = response.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    const jsonString = response.substring(start, end + 1);
    try {
      const parsed = JSON.parse(jsonString);
      return parsed;
    } catch (e) {
      console.error("JSON parse error:", e.message);
      return { approved: false, source: "LLM", reason: "Invalid category response" };
    }
  } else {
    console.error("Could not find JSON object in response");
    return { approved: false, source: "LLM", reason: "Could not find JSON object in response" };
  }
  
};

