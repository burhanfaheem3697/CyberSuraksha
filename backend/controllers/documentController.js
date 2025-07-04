const { registerDocumentOnChain } = require("../utils/documentHashService");

exports.uploadDocument = async (req, res) => {
  try {
    const fileBuffer = req.file.buffer;
    const result = await registerDocumentOnChain(fileBuffer);

    res.status(200).json({
      success: true,
      message: "Document hash registered on blockchain.",
      hash: result.hash,
      txHash: result.txHash,
    });
  } catch (err) {
    console.error("Document upload failed:", err);
    res.status(500).json({ success: false, error: "Upload failed" });
  }
};
