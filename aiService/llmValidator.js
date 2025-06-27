const { buildPromptFromConsent } = require("./promptBuilder");
const { callLLM } = require("./utils/llmCaller");

exports.validateWithLLM = async (consentRequest) => {
  const prompt = buildPromptFromConsent(consentRequest);

  const response = await callLLM(prompt);

  try {
    const parsed = JSON.parse(response);
    return {
      approved: parsed.approved,    
      source: "LLM",
      reason: parsed.reason || "No reason provided"
    };
  } catch (err) {
    return { approved: false, source: "LLM", reason: "Invalid LLM response" };
  }
}; 