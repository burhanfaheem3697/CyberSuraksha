const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const sandboxDir = path.resolve(__dirname, "sandbox");
const defaultTimeoutMs = 8000;

// Clean temp files and directories
function cleanSandbox() {
  ["input.json", "output.json", "model.onnx"].forEach((file) => {
    const filePath = path.join(sandboxDir, file);
    try {
      if (fs.existsSync(filePath)) {
        const stat = fs.lstatSync(filePath);
        if (stat.isFile()) fs.unlinkSync(filePath);
        else if (stat.isDirectory()) fs.rmdirSync(filePath, { recursive: true });
      }
    } catch (err) {
      console.warn(`⚠️ Could not delete ${file}: ${err.message}`);
    }
  });
}

// Canary trap detection
function detectCanary(output, canaryValue = 99999) {
  const str = JSON.stringify(output);
  return str.includes(canaryValue.toString());
}

// Enforce numeric-only schema
function isOutputValid(output) {
  const isNumeric = (val) => typeof val === "number";
  const is1D = (arr) => Array.isArray(arr) && arr.every(isNumeric);
  const is2D = (arr) => Array.isArray(arr) && arr.every(is1D);

  if (is1D(output) || is2D(output)) return true;

  if (typeof output === "object" && output !== null) {
    return Object.values(output).every(val => is1D(val) || is2D(val));
  }

  return false;
}



// Generate output hash
function hashOutput(output) {
  return crypto.createHash("sha3-256").update(JSON.stringify(output)).digest("hex");
}


/**
 * Secure Docker sandbox runner for ONNX models
 * @param {Object} inputData - key:value tensor inputs (e.g., {income: [[...]], credit_score: [[...]]})
 * @param {string} modelPath - absolute path to model.onnx file
 * @param {number} [timeoutMs] - optional timeout override (default: 8000ms)
 * @returns {Promise<{ output: any, error: string|null, tampered?: boolean, hash?: string }>}
 */
function runInDocker(inputData, modelPath, timeoutMs = defaultTimeoutMs) {
  return new Promise((resolve) => {
    cleanSandbox();

    const inputPath = path.join(sandboxDir, "input.json");
    const modelDest = path.join(sandboxDir, "model.onnx");
    const outputPath = path.join(sandboxDir, "output.json");

    // Write input and model
    fs.writeFileSync(inputPath, JSON.stringify(inputData, null, 2));
    fs.copyFileSync(modelPath, modelDest);
    fs.writeFileSync(outputPath, "");

    const dockerArgs = [
      "run", "--rm",
      "--memory=512m",
      "--cpus=1",
      "--pids-limit=64",
      "--read-only",
      "--network=none",
      "-v", `${inputPath}:/app/input.json:ro`,
      "-v", `${modelDest}:/app/model.onnx:ro`,
      "-v", `${outputPath}:/app/output.json:rw`,
      "cybersuraksha-infer"
    ];

    let timeout;
    const proc = spawn("docker", dockerArgs, { stdio: "inherit" });

    // Handle spawn errors (e.g., Docker not installed)
    proc.on("error", (err) => {
      clearTimeout(timeout);
      return resolve({ output: null, error: `Docker spawn error: ${err.message}` });
    });

    timeout = setTimeout(() => {
      proc.kill("SIGKILL");
      resolve({ output: null, error: "Timeout: model execution exceeded limit." });
    }, timeoutMs);

    proc.on("exit", () => {
      clearTimeout(timeout);

      try {
        const rawOutput = fs.readFileSync(outputPath, "utf-8");
        const parsed = JSON.parse(rawOutput);
        console.log('[dockerRunner] Docker model output:', parsed);

        if (parsed.error) {
          return resolve({ output: null, error: parsed.error });
        }

        const output = parsed.output;

        // Schema enforcement
        if (!isOutputValid(output)) {
          return resolve({ output: null, error: "Invalid output structure." });
        }

        // Canary check
        const tampered = detectCanary(output);

        // Blockchain proof (SHA256 hash)
        const hash = hashOutput(output);

        return resolve({ output, error: null, tampered, hash });

      } catch (err) {
        return resolve({ output: null, error: "Output error: " + err.message });
      } finally {
        cleanSandbox();
      }
    });
  });
}

module.exports = {
  runInDocker,
};
