const Contract = require('../models/Contract');
const ModelUpload = require('../models/ModelUpload');
const UserBankData = require('../models/UserBankData');
const ExecutionLog = require('../models/ExecutionLog');
const { executeModel } = require('../services/executionSandbox');
const { getUserIdFromVirtualId } = require('../utils/resolveVirtualId');
const path = require('path');
const fs = require('fs');
const VirtualID = require('../models/VirtualID'); // Import if not already
const { wrapStandardOutput } = require('../utils/outputFormatter');



// Safe nested getter with $ and _ protection
function safeGet(obj, path) {
  const parts = path.split('.');
  for (let part of parts) {
    if (part.startsWith('$') || part.startsWith('_')) return null; // prevent Mongo-injected/internal keys
    if (!(part in obj)) return null;
    obj = obj[part];
  }
  return obj;
}


// POST /:contractId


exports.executeModelOnContract = async (req, res) => {
  try {
    const { contractId } = req.params;
    const partnerId = req.partner?._id;

    // 1️⃣ Load contract
    const contract = await Contract.findById(contractId);
    if (!contract) {
      return res.status(404).json({ message: 'Contract not found.' });
    }
    if (!contract.partnerId?.equals(partnerId)) {
      return res.status(403).json({ message: 'Unauthorized: Partner mismatch.' });
    }

    // 2️⃣ Load VirtualID and user data
    const vdoc = await VirtualID.findById(contract.virtualUserId);
    if (!vdoc) {
      return res.status(404).json({ message: 'Virtual user ID not found.' });
    }
    const userData = (await UserBankData.findOne({ user_id: vdoc.userId }))?.toObject();
    
    if (!userData) {
      return res.status(404).json({ message: 'User data not found.' });
    }

    // console.log("userData", userData);
    


    const model = await ModelUpload.findOne({
      partnerId,
      allowedPurposes: { $in: [contract.purpose] }
    }).sort({ uploadedAt: -1 });
    
    if (!model) {
      return res.status(404).json({ message: 'No compatible model uploaded by partner.' });
    }

if (!model.inputSchema || !Object.keys(model.inputSchema).length) {
  return res.status(400).json({ message: "Model missing input schema" });
}

const onnxInputs = {};

const inputSchema = JSON.parse(JSON.stringify(model.inputSchema || {}));
const inputKeys = Object.keys(inputSchema).filter(k => !k.startsWith('$') && !k.startsWith('_'));

for (let key of inputKeys) {
  if (!contract.allowedFields.includes(key)) {
    return res.status(403).json({ message: `Field '${key}' not allowed by contract.` });
  }

  const val = safeGet(userData, key) ?? 0;
  const shape = inputSchema[key];

  if (!Array.isArray(shape) || shape[0] !== -1) {
    return res.status(400).json({ message: `Unsupported shape for '${key}': ${JSON.stringify(shape)}` });
  }

  const tensor = shape.length === 2 ? [[val]] : [val];
  onnxInputs[key] = tensor;
}
  onnxInputs["canary_flag"] = [[99999]];
    console.log("onnxInputs prepared:", Object.keys(onnxInputs));
    console.log('[debug] final onnxInputs', onnxInputs);


    
    const modelPath = path.join(__dirname, '../uploads/models', model.modelFile);

    
    // 5️⃣ Run inference
    let output, error, dpApplied, tampered, hash;

    const start = Date.now(); // Start timer

    try {
      ({ output, error, dpApplied, tampered, hash } = await executeModel({
        modelPath,
        inputData: onnxInputs,
        dpEnabled: contract.dpEnabled,
        dpConfig: contract.dpConfig || { epsilon: 1.0, sensitivity: 1 }
      }));
    } catch (execErr) {
      console.error('[Model Execution Error]', execErr);
      error = execErr?.message || 'Unknown execution error';
    }
    const executionTimeMs = Date.now() - start; // End timer


    // for future improvements
    // if (executionTimeMs > 2000) {
    //   riskFlags.push('HIGH_LATENCY');
    // }




    // 🔍 Extract behavior metadata
const canaryFlagValue = output?.canary_flag ?? null;
const purposeMismatch = !model.allowedPurposes.includes(contract.purpose);
const modelAllowedPurposes = model.allowedPurposes || [];
const contractPurpose = contract.purpose;
let riskFlags = [];

if (canaryFlagValue === 99999) riskFlags.push('CANARY_LEAK');
if (purposeMismatch) riskFlags.push('PURPOSE_MISMATCH');
if (tampered) riskFlags.push('TAMPERING');

console.log('[monitor] canaryFlagValue:', canaryFlagValue);
console.log('[monitor] purposeMismatch:', purposeMismatch);

    
await ExecutionLog.create({
  contractId,
  partnerId,
  virtualUserId: contract.virtualUserId,
  modelId: model._id,
  modelName: model.modelName || model.modelFile,
  mode: contract.executionMode || 'raw',
  executedAt: new Date(),
  status: error ? 'FAILURE' : (tampered ? 'TAMPERED' : 'SUCCESS'),
  output: output ?? {},
  dpApplied,
  dpEpsilon: contract.dpConfig?.epsilon,
  dpSensitivity: contract.dpConfig?.sensitivity,
  tampered,
  hash,
  executionTimeMs,

  // 🔍 Behavior metadata additions
  canaryFlagValue,
  contractPurpose,
  modelAllowedPurposes,
  purposeMismatch,
  riskFlags,

});

if (riskFlags.length > 0) {
  const io = req.app.get('io');
  io.emit('execution_alert', {
    partnerId: partnerId.toString(),
    contractId: contractId.toString(),
    riskFlags,
    modelName: model.modelName,
    timestamp: new Date()
  });

  console.log(`[alert] Risk flags detected: ${riskFlags.join(', ')}`);
}



    // 8️⃣ Respond
    if (error) {
      return res.status(500).json({ message: 'Model execution failed', error });
    }

    const formattedOutput = wrapStandardOutput(output, {
      modelId: model.modelName || model.modelFile,
      dpApplied,
      tampered,
      hash,
      threshold: 0.5,
      executionTimeMs
    });
    
    return res.status(200).json(formattedOutput);
    
  } catch (err) {
    console.error('Execution error:', err);
    return res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};













// // POST /execute
// //currently we are not using this controller anywhere 
exports.executeModelForContract = async (req, res) => {
  try {
    const { contractId, modelId } = req.body;
    if (!contractId || !modelId) {
      return res.status(400).json({ message: 'Missing contractId or modelId' });
    }

    const contract = await Contract.findById(contractId);
    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    if (contract.executionMode !== 'cleanroom') {
      return res.status(403).json({ message: 'Execution not allowed: Contract is not set for cleanroom mode' });
    }

    const model = await ModelUpload.findById(modelId);
    if (!model) {
      return res.status(404).json({ message: 'Model not found' });
    }

    const modelPath = path.resolve(model.path);
    const userId = await getUserIdFromVirtualId(contract.virtualUserId);
    const userBankData = await UserBankData.findOne({ user_id: userId });
    if (!userBankData) {
      return res.status(404).json({ message: 'User bank data not found' });
    }

    // Filter input fields according to contract
    const filteredInput = {};
    for (const field of contract.allowedFields) {
      if (userBankData[field] !== undefined) {
        filteredInput[field] = userBankData[field];
      }
    }

    filteredInput["canary_flag"] = [[99999]];

// Run model securely
const { output, error, dpApplied, tampered, hash } = await executeModel({
  modelPath,
  inputData: filteredInput,
  dpEnabled: contract.dpEnabled,
  dpConfig: contract.dpConfig,
});

// Log into contract
contract.executionLogs.push({
  modelId: model._id,
  executedAt: new Date(),
  status: error ? 'error' : 'success',
  resultSummary: error ? error : JSON.stringify(output),
  outputDP: dpApplied,
});
await contract.save();

// Log full execution
await ExecutionLog.create({
  contractId: contract._id,
  modelId: model._id,
  virtualUserId: contract.virtualUserId,
  partnerId: contract.partnerId,
  executedAt: new Date(),
  mode: contract.executionMode,
  modelName: model.modelName || model.modelFile,
  status: error ? 'FAILURE' : (tampered ? 'TAMPERED' : 'SUCCESS'),
  output: output ?? {},
  dpApplied,
  dpEpsilon: contract.dpConfig?.epsilon,
  dpSensitivity: contract.dpConfig?.sensitivity,
  resultSummary: error ? error : JSON.stringify(output),
  tampered,
  hash
});

if (error) {
  return res.status(500).json({ message: 'Model execution failed', error });
}

return res.status(200).json({
  message: tampered ? 'Model executed but tampering detected' : 'Model executed successfully',
  output,
  dpApplied,
  tampered,
  hash
});
  } catch (err) {
    console.error('[Execution Error]', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};





