function wrapStandardOutput(rawOutput, options = {}) {
    const {
      threshold = 0.5,
      modelId = "unknown-model",
      executionTimeMs = null,
      dpApplied = false,
      tampered = false,
      hash = null,
    } = options;
  
    let confidence = null;
    let shape = [];
    let extractionError = false;
  
    // 1. Determine output shape and try to extract confidence
    try {
      if (Array.isArray(rawOutput)) {
        shape.push(rawOutput.length);
        if (Array.isArray(rawOutput[0])) {
          shape.push(rawOutput[0].length);
          const val = rawOutput?.[0]?.[0];
          if (typeof val === "number" && !isNaN(val)) {
            confidence = val;
          } else {
            extractionError = true;
          }
        } else if (typeof rawOutput[0] === "number") {
          // Support flat 1D array
          confidence = rawOutput[0];
          shape = [rawOutput.length];
        } else {
          extractionError = true;
        }
      } else {
        extractionError = true;
      }
    } catch {
      extractionError = true;
    }
  
    // 2. Handle invalid or missing confidence
    const isValidConfidence = typeof confidence === "number" && isFinite(confidence);
    const label = isValidConfidence && confidence >= threshold ? "Approved" : "Rejected";
    const confidencePercent = isValidConfidence
      ? (confidence * 100).toFixed(2) + "%"
      : "0.00%";
  
    // 3. Construct final wrapped output
    return {
      success: true,
      prediction: {
        value: isValidConfidence ? confidence : null,
        label,
        confidencePercent,
        threshold,
        aboveThreshold: isValidConfidence && confidence >= threshold
      },
      dpApplied,
      tampered,
      hash,
      meta: {
        modelId,
        executionTimeMs,
        outputShape: shape,
        notes: extractionError ? "Raw output structure was unexpected or non-numeric." : undefined
      }
    };
  }
  
  module.exports = { wrapStandardOutput };
  