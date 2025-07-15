// controllers/modelExecutionController.js
const ModelUpload = require('../models/ModelUpload');
const Contract = require('../models/Contract');
const { spawn } = require('child_process');
const path = require('path');

// Simulated model runner (replace with your real sandbox or inference logic)
async function runModel(filePath, inputData, useDP = false, epsilon = 1.0, sensitivity = 1) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, '../sandbox/mockExecutor.py'); // Placeholder script
    const proc = spawn('python3', [scriptPath, filePath, JSON.stringify(inputData), useDP, epsilon, sensitivity]);

    let result = '';
    proc.stdout.on('data', data => result += data.toString());
    proc.stderr.on('data', err => console.error('Model stderr:', err.toString()));

    proc.on('close', code => {
      if (code === 0) resolve(result);
      else reject(new Error('Model execution failed'));
    });
  });
}

// POST /contracts/:id/execute-model
exports.executeModel = async (req, res) => {
  try {
    const contractId = req.params.id;
    const modelId = req.body.modelId;
    const contract = await Contract.findById(contractId);
    const model = await ModelUpload.findById(modelId);

    if (!contract || !model) {
      return res.status(404).json({ message: 'Contract or Model not found' });
    }

    // Ensure model belongs to partner who has access
    if (model.partnerId.toString() !== req.partner.partnerId) {
      return res.status(403).json({ message: 'Unauthorized model access' });
    }

    const inputData = contract.data || {}; // This would be masked/sanitized already
    const useDP = contract.dpEnabled;
    const epsilon = contract.dpConfig?.epsilon || 1.0;
    const sensitivity = contract.dpConfig?.sensitivity || 1;

    // Use the correct field for the model file path
    const modelPath = path.resolve(__dirname, '../uploads/models', model.modelFile);
    const result = await runModel(modelPath, inputData, useDP, epsilon, sensitivity);

    contract.executionLogs.push({
      modelId,
      resultSummary: result.slice(0, 200),
      executedAt: new Date(),
      outputDP: useDP,
      status: 'success'
    });
    await contract.save();

    res.status(200).json({ message: 'Model executed successfully', result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Model execution error', error: err.message });
  }
};
