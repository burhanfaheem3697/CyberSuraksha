// controllers/modelController.js
const ModelUpload = require('../models/ModelUpload');
const path = require('path');
const { execSync } = require('child_process');
// Upload model controller
exports.uploadModel = async (req, res) => {
  try {
    const partnerId = req.partner._id;      // Set by partnerAuthMiddleware
    const file      = req.file;
    const { notes, allowedPurposes } = req.body;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

     

    let inputSchema = {};
    if (file.originalname.endsWith('.onnx')) {
      try {
        const modelPath = path.join(__dirname, '../uploads/models', file.filename);
        const scriptPath = path.join(__dirname, '../utils/extract_onnx_schema.py');
        console.log("modelPath", modelPath);
        const output = execSync(`python3 "${scriptPath}" "${modelPath}"`).toString();
        console.log("output", output);
        
        const rawSchema = JSON.parse(output);
        inputSchema = Object.fromEntries(
          Object.entries(rawSchema).filter(([k, _]) => !k.startsWith('$') && !k.startsWith('_'))
        );
    
      } catch (err) {
        console.warn("⚠️ Could not extract input schema:", err.message);
      }
    }


    // === parse allowedPurposes ===
    let purposesArray = [];
    if (allowedPurposes) {
      if (typeof allowedPurposes === 'string') {
        // 1) try JSON.parse
        try {
          const parsed = JSON.parse(allowedPurposes);
          if (Array.isArray(parsed)) {
            purposesArray = parsed;
          } else if (typeof parsed === 'string') {
            purposesArray = [parsed];
          }
        } catch (_) {
          // 2) fallback: comma-split
          purposesArray = allowedPurposes
            .split(',')
            .map(s => s.trim())
            .filter(s => s.length);
        }
      } else if (Array.isArray(allowedPurposes)) {
        purposesArray = allowedPurposes;
      }
    }

    // === build and save ===
    const newModel = new ModelUpload({
      partnerId,
      modelName:      file.originalname,
      modelFile:      file.filename,
      modelFormat:    file.originalname.split('.').pop(),
      description:    notes || '',
      allowedPurposes: purposesArray,
      inputSchema       // ✅ ADD HERE
    });
    
    await newModel.save();
    return res
      .status(201)
      .json({ success: true, message: 'Model uploaded successfully', model: newModel });

  } catch (err) {
    console.error('Error uploading model:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Server error', error: err.message });
  }
};

// List models controller
exports.listModels = async (req, res) => {
  try {
    const partnerId = req.partner._id; // Set by partnerAuthMiddleware

    const models = await ModelUpload.find({ partnerId })
      .select(
        '_id modelName modelFormat allowedPurposes description dpCompliant uploadedAt'
      )
      .sort({ uploadedAt: -1 });

    return res.status(200).json({ success: true, models });
  } catch (err) {
    console.error('Error fetching models:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Server error', error: err.message });
  }
};
