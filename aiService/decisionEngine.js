const { validateWithRules } = require("./ruleValidator");
const { validateWithLLM } = require("./llmValidator");

exports.evaluateConsentRequest = async (request) => {
  const ruleResult = await validateWithRules(request);
  if (!ruleResult.approved) return ruleResult;

  const llmResult = await validateWithLLM(request);
  if (!llmResult.approved) return llmResult;
  return { approved: true, source: "HYBRID", reason: "Passed all checks" };
};