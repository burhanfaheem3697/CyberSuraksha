const { buildPromptFromConsent } = require("./promptBuilder");
const { callLLM } = require("./utils/llmCaller");

exports.validateWithLLM = async (consentRequest) => {
  const prompt = buildPromptFromConsent(consentRequest);

  const response = await callLLM(prompt);

  const start = response.indexOf('{');
  const end = response.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    const jsonString = response.substring(start, end + 1);
    try {
      const parsed = JSON.parse(jsonString);
      return {
        approved: parsed.approved,    
        source: "LLM",
        reason: parsed.reason || "No reason provided"
      };
    } catch (e) {
      console.error("JSON parse error:", e.message);
      return { approved: false, source: "LLM", reason: "Invalid LLM response" };
    }
  } else {
    console.error("Could not find JSON object in response");
    return { approved: false, source: "LLM", reason: "Could not find JSON object in response" };
  }
}; 