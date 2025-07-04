const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const authMiddleware = require('../middleware/authMiddleware')
const { userRegistrationValidator,userLoginValidator } = require('../validators/index.js');
const {validate} = require('../middleware/validatorsMiddleware.js')


router.post('/register',userRegistrationValidator(),validate,UserController.registerUser)

router.post('/login',userLoginValidator(),validate,UserController.loginUser)

router.get('/logout',authMiddleware,UserController.logoutUser)

router.get('/verify/:unhashedToken',UserController.verifyEmail)

router.post('/forgotPassword',UserController.forgotPasswordRequest)    

router.post('/changeCurrentPassword/:unhashedToken',UserController.changeCurrentPassword)

router.get('/profile',authMiddleware,UserController.getCurrentUser)

router.get('/resendEmail',authMiddleware,UserController.resendVerificationEmail)

router.get('/refresh',UserController.refreshAccessToken)

// GET /user/data-room/:contractId
router.get('/data-room/:contractId', authMiddleware, UserController.getUserDataRoom);

// GET /user/data-room-logs/:contractId
router.get('/data-room-logs/:contractId', authMiddleware, UserController.getUserDataRoomLogs);

module.exports = router; 