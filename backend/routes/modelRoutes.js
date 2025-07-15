// routes/modelRoutes.js
const express = require('express');
const router = express.Router();

const partnerAuth = require('../middleware/partnerAuthMiddleware');
// this is the multer middleware you just wrote
const uploadModel = require('../middleware/multerConfig');
// this is your controller fn
const { uploadModel: uploadModelController, listModels } = require('../controllers/modelController');

//
// POST /model/upload
//  - partner must be authenticated
//  - we parse a single multipart “modelFile” with allowed extensions
//  - then we hand off to your controller
//
router.post(
  '/upload',
  partnerAuth,
  uploadModel,            // <-- multerConfig.uploadModel
  uploadModelController  // <-- controllers/modelController.uploadModel
);

// GET /model/list - Get all models for the authenticated partner
router.get('/list', partnerAuth, listModels);

module.exports = router;
