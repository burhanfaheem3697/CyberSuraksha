const path = require("path");
const { runInDocker } = require("./backend/dockerSandbox/sandboxRunner");

async function testSandbox() {
  // Multi-input test data (adjust to your model's expected inputs)
  const inputData = {
    input: [[45000, 720]]  // ✅ Matches the ONNX model input name and shape
  };

  // Path to a valid .onnx model in the sandbox folder
  const modelPath = path.resolve(__dirname, "./backend/testmodel/model.onnx");

  console.log("🔍 Testing sandboxed ONNX model execution...");
  const { output, error } = await runInDocker(inputData, modelPath);

  if (error) {
    console.error("❌ Execution failed:", error);
  } else {
    console.log("✅ Execution successful. Output:", output);
  }
}

testSandbox();
