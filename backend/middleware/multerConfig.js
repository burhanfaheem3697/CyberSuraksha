// middleware/multerConfig.js

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 1. Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads/models');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 2. Whitelist file extensions
const allowedExtensions = [
  '.onnx',
  '.pkl',
  '.joblib',
  '.pt',
  '.py',   // allow script uploads if needed
  '.js'
];

// 3. Configure storage
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `model-${uniqueSuffix}${ext}`);
  }
});

// 4. File filter
function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new multer.MulterError(
        'LIMIT_UNEXPECTED_FILE',
        `Invalid file type. Allowed: ${allowedExtensions.join(', ')}`
      ),
      false
    );
  }
}

// 5. Limits (10 MB)
const limits = {
  fileSize: 10 * 1024 * 1024
};

// 6. Create the multer instance
const upload = multer({ storage, fileFilter, limits });

// 7. Export a middleware for single-model uploads
//    Use in your route as: router.post('/upload', partnerAuth, uploadModel, controller.uploadModel)
const uploadModel = upload.single('modelFile');

module.exports = uploadModel;
