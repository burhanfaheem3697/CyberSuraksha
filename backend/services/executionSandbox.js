const { runInDocker } = require('../dockerSandbox/sandboxRunner');

// Adds Laplace noise for differential privacy
function laplaceNoise(value, epsilon, sensitivity) {
  const u = Math.random() - 0.5;
  const b = sensitivity / epsilon;
  return value - Math.sign(u) * b * Math.log(1 - 2 * Math.abs(u));
}

/**
 * Executes an ONNX model inside a Docker sandbox with optional Differential Privacy.
 * @param {Object} params
 * @param {string} params.modelPath - Absolute path to the .onnx model file.
 * @param {Object} params.inputData - Object with key `input` → Array (1D or 2D for batching).
 * @param {boolean} params.dpEnabled - Whether to apply differential privacy noise.
 * @param {Object} params.dpConfig - { epsilon, sensitivity } for DP.
 * @returns {Promise<{ output: any, error: string|null, dpApplied: boolean }>}  
 */
async function executeModel({ modelPath, inputData, dpEnabled = false, dpConfig = {} }) {
  console.log('[executionSandbox] 🐳 Docker-based model execution started');
  console.log('[executionSandbox] Model Path:', modelPath);
  console.log('[executionSandbox] Input Data:', inputData);

  try {

    const { output, error } = await runInDocker(inputData, modelPath);
    console.log('[executionSandbox] Docker model output:', output);
    
    if (error) {
      console.error('[executionSandbox] Docker model error:', error);
      return { output: null, error, dpApplied: false };
    }

    let result = {};
let dpApplied = false;

for (const key in output) {
  const tensor = output[key];
  if (tensor?.data !== undefined) {
    result[key] = Array.from(tensor.data);
  } else {
    result[key] = output[key];
  }
}

if (Object.keys(result).length === 1) {
  result = result[Object.keys(result)[0]];
}

if (dpEnabled && dpConfig.epsilon && dpConfig.sensitivity && Array.isArray(result)) {
  result = result.map(val => laplaceNoise(val, dpConfig.epsilon, dpConfig.sensitivity));
  dpApplied = true;
  console.log('[executionSandbox] Differential privacy noise applied');
}


    return { output: result, error: null, dpApplied };

  } catch (err) {
    console.error('[executionSandbox] Execution error:', err);
    return { output: null, error: err.message, dpApplied: false };
  }
}

module.exports = { executeModel };
