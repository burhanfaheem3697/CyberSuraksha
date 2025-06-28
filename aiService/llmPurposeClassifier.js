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
  console.log("response from classifier : ",response);
  return extractJsonFromResponse(response);
};

function extractJsonFromResponse(response) {
  // Match the first {...} block (even if surrounded by code fences or text)
  const match = response.match(/```(?:json)?\s*([\s\S]*?)\s*```|({[\s\S]*})/i);
  if (match) {
    // If matched with code fence, use group 1, else use group 2
    const jsonStr = match[1] || match[2];
    try {
      return JSON.parse(jsonStr);
    } catch (err) {
      // Fallback: try to find the first { ... } block
      const curlyMatch = response.match(/{[\s\S]*}/);
      console.log(curlyMatch)
      if (curlyMatch) {
        try {
          return JSON.parse(curlyMatch[0]);
        } catch (e) {}
      }
      return { main_category: "other", sub_category: null, requires_sensitive_data: true, justification: "LLM parsing failed" };
    }
  }
  return { main_category: "other", sub_category: null, requires_sensitive_data: true, justification: "LLM parsing failed" };
} 