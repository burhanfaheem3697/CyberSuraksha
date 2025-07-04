const User = require('../models/User.js');
const jwt = require('jsonwebtoken');
const UserBankData = require('../models/UserBankData');
const asyncHandler = require('../utils/asyncHandler.js')
const ApiResponse = require('../utils/api_Response.js')
const ApiError = require('../utils/api_Error.js')
const { sendMail,emailVerificationMailGenToken, forgotPasswordMailGenContent }  = require("../utils/mail.js");
const crypto = require('crypto')
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const VirtualID = require('../models/VirtualID');
const Contract = require('../models/Contract');
const Consent = require('../models/Consent');
const { maskFields } = require('../utils/fieldMasker');
const AuditLog = require('../models/AuditLog');
const { Types } = require('mongoose');

// Register a new user

exports.registerUser = asyncHandler(async (req,res) => {
  try {
    //get data
    const {email,username,fullname,password,phone, aadhaar, dataResidency} = req.body
    console.log("Registration request received:", { email, username, fullname, phone, aadhaar, dataResidency });
    
    //validation done by middleware
    //check if user already exist
    const existingUser = await User.findOne({email})

    if(existingUser) throw new ApiError(400,"User already exist")
    
    //create user
    const user = await User.create({email,username,fullname,password,phone,aadhaar,dataResidency})

    if(!user) throw new ApiError(400,"Error while registering user")
    console.log("User created successfully:", user._id);

    try {
      // Create dummy bank data with proper ObjectId reference
      const dummyBankData = new UserBankData({
        user_id: user._id,
        income: 50000 + Math.floor(Math.random() * 50000),
        credit_score: 700 + Math.floor(Math.random() * 100),
        transaction_summary: { groceries: 8000, emi: 12000, bills: 4000 },
        accounts: [
          {
            account_type: 'Savings',
            account_number: 'XXXX' + Math.floor(1000 + Math.random() * 9000),
            balance: 50000 + Math.floor(Math.random() * 150000),
            currency: 'INR',
            transactions: [
              {
                date: new Date(),
                description: 'Salary Credit',
                amount: 50000 + Math.floor(Math.random() * 50000),
                type: 'credit',
                category: 'income'
              },
              {
                date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                description: 'Grocery Shopping',
                amount: 2000 + Math.floor(Math.random() * 3000),
                type: 'debit',
                category: 'groceries'
              },
              {
                date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                description: 'Electricity Bill',
                amount: 1000 + Math.floor(Math.random() * 1000),
                type: 'debit',
                category: 'utilities'
              }
            ]
          },
          {
            account_type: 'Current',
            account_number: 'XXXX' + Math.floor(1000 + Math.random() * 9000),
            balance: 100000 + Math.floor(Math.random() * 500000),
            currency: 'INR',
            transactions: [
              {
                date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                description: 'Client Payment',
                amount: 25000 + Math.floor(Math.random() * 25000),
                type: 'credit',
                category: 'income'
              },
              {
                date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
                description: 'Office Supplies',
                amount: 5000 + Math.floor(Math.random() * 5000),
                type: 'debit',
                category: 'business'
              }
            ]
          }
        ],
        loans: [
          {
            loan_type: 'Personal',
            amount: 500000 + Math.floor(Math.random() * 500000),
            interest_rate: 8 + Math.random() * 4,
            tenure: 36,
            emi: 15000 + Math.floor(Math.random() * 10000),
            remaining_amount: 300000 + Math.floor(Math.random() * 300000),
            status: 'Active'
          },
          {
            loan_type: 'Home',
            amount: 2000000 + Math.floor(Math.random() * 3000000),
            interest_rate: 7 + Math.random() * 2,
            tenure: 180,
            emi: 20000 + Math.floor(Math.random() * 15000),
            remaining_amount: 1500000 + Math.floor(Math.random() * 2000000),
            status: 'Active'
          }
        ],
        cards: [
          {
            card_type: 'Credit',
            card_number: 'XXXX XXXX XXXX ' + Math.floor(1000 + Math.random() * 9000),
            expiry: '0' + (Math.floor(Math.random() * 9) + 1) + '/' + (new Date().getFullYear() + 3).toString().slice(-2),
            credit_limit: 100000 + Math.floor(Math.random() * 100000),
            outstanding: 25000 + Math.floor(Math.random() * 50000),
            rewards_points: Math.floor(Math.random() * 5000)
          },
          {
            card_type: 'Debit',
            card_number: 'XXXX XXXX XXXX ' + Math.floor(1000 + Math.random() * 9000),
            expiry: '0' + (Math.floor(Math.random() * 9) + 1) + '/' + (new Date().getFullYear() + 5).toString().slice(-2)
          }
        ],
        monthly_expenses: {
          housing: 15000 + Math.floor(Math.random() * 10000),
          utilities: 3000 + Math.floor(Math.random() * 2000),
          groceries: 8000 + Math.floor(Math.random() * 4000),
          transportation: 4000 + Math.floor(Math.random() * 3000),
          entertainment: 5000 + Math.floor(Math.random() * 5000),
          healthcare: 2000 + Math.floor(Math.random() * 3000),
          miscellaneous: 3000 + Math.floor(Math.random() * 2000)
        },
        savings: {
          fixed_deposits: 200000 + Math.floor(Math.random() * 300000),
          recurring_deposits: 50000 + Math.floor(Math.random() * 100000),
          mutual_funds: 100000 + Math.floor(Math.random() * 200000),
          stocks: 50000 + Math.floor(Math.random() * 150000),
          others: 25000 + Math.floor(Math.random() * 75000)
        },
        employer: 'DummyCorp',
        employment_history: [
          {
            company: 'DummyCorp',
            position: 'Senior Developer',
            start_date: new Date(new Date().setFullYear(new Date().getFullYear() - 2)),
            end_date: null,
            salary: 50000 + Math.floor(Math.random() * 50000)
          },
          {
            company: 'PreviousCompany',
            position: 'Developer',
            start_date: new Date(new Date().setFullYear(new Date().getFullYear() - 5)),
            end_date: new Date(new Date().setFullYear(new Date().getFullYear() - 2)),
            salary: 30000 + Math.floor(Math.random() * 30000)
          }
        ],
        last_updated: new Date()
      });

      const savedBankData = await dummyBankData.save();
      console.log("User bank data created successfully:", savedBankData._id);
    } catch (error) {
      console.error("Error creating bank data:", error);
      // Don't throw error here, as we want to continue with user registration
      // even if bank data creation fails
    }
    
    //send verification email
    const {unhashedToken,hashedToken,tokenExpiry} = user.generateTemporaryToken()
    user.emailVerificationToken = hashedToken
    user.emailVerificationTokenExpiry = tokenExpiry
    await user.save()

    sendMail({
        email,
        subject : "Email Verification",
        mailGenContent : emailVerificationMailGenToken(username,`${process.env.BASE_URL}/api/v1/users/verify/${unhashedToken}`)
    })

    return res.status(200).json(
        new ApiResponse(200,user,"User registered successfully")
    )
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(error.statusCode || 500).json(
      new ApiError(error.statusCode || 500, error.message || "Something went wrong during registration")
    );
  }
})

exports.verifyEmail = asyncHandler(async (req,res) => {
  const {unhashedToken} = req.params
  if(!unhashedToken) throw new ApiError(401,"token not received")
  // create hashedToken
  const hashedToken = crypto
      .createHash('SHA256')
      .update(unhashedToken)
      .digest('hex')
  
  //find token in db

  const user = await User.findOne({emailVerificationToken : hashedToken,
      emailVerificationTokenExpiry : {$gt : Date.now()}})
  if(!user) throw new ApiError(401,"Token is not valid or expired")
  
  user.emailVerificationToken = undefined
  user.emailVerificationTokenExpiry = undefined
  user.isEmailVerified = true
  await user.save()

  res.status(200).json(
      new ApiResponse(200,{message : "User verified successfully"})
  )   


})


exports.loginUser = asyncHandler(async (req,res) => {
  //get data
  const {email,password} = req.body
  //check if email exist or not
  const user = await User.findOne({email})

  if(!user) throw new ApiError(400,"Email does not exist")
  
  const isCorrect = await user.isPasswordCorrect(password)

  if(!isCorrect) throw new ApiError(400,"password is incorrect")

  //generate access and refresh token

  const accessToken = user.generateAccessToken()
  const refreshToken = user.generateRefreshToken()


  user.refreshToken = refreshToken

  await user.save()

  const cookieOptions = {
      httpOnly : true,
      secure : true,
      maxAge : 24*60*60*1000
  }

  res.cookie('userToken', JSON.stringify({ accessToken, refreshToken }), cookieOptions);


  res.status(200).json(
      new ApiResponse(200,user,"User logged in successfully")
  )
})

exports.logoutUser = asyncHandler(async (req,res) => {
  res.cookie('userToken','',{expires : new Date(0)})

  res.status(200).json(
      new ApiResponse(200,{message : "User logged Out successfully"})
  )
})

exports.forgotPasswordRequest = asyncHandler(async (req,res) => {
  //get email
  const {email} = req.body
  //find user
  
  const user = await User.findOne({email})

  if(!user) throw new ApiError(400,"User does not exist")

  //send mail with url
  const {unhashedToken,hashedToken,tokenExpiry} = user.generateTemporaryToken()

  user.forgotPasswordToken = hashedToken
  user.forgotPasswordTokenExpiry = tokenExpiry

  await user.save()

  sendMail({
      email,
      subject : "Forgot Password",
      mailGenContent : forgotPasswordMailGenContent(user.username,`${process.env.BASE_URL}/user/changeCurrentPassword/${unhashedToken}`)
  })

  res.status(200).json(
      new ApiResponse(200,{message : "mail sent to the user successfully"})
  )

})

exports.changeCurrentPassword = asyncHandler(async (req,res) => {
  //get token
  const {unhashedToken} = req.params
  const {password} = req.body

  if(!unhashedToken) throw new ApiError(401,"token not received")

  // create hashedToken
  const hashedToken = crypto
      .createHash('SHA256')
      .update(unhashedToken)
      .digest('hex')
  
  //verify hashed token
  const user = await User.findOne({forgotPasswordToken : hashedToken,forgotPasswordTokenExpiry : {$gt : Date.now()}})

  if(!user) throw new ApiError(401,"Token is not valid or expired")
  
  user.password = password
  user.forgotPasswordToken = undefined
  user.forgotPasswordTokenExpiry = undefined;
  
  await user.save()

  res.status(200).json(
      new ApiResponse(200,{message : "password changed successfully"})
  )

})

exports.getCurrentUser = asyncHandler(async (req,res) => {
  const userId = req.user.id

  const user = await User.findById(userId)

  if(!user) throw new ApiError(401,"user not found")

  res.status(200).json(
      new ApiResponse(200,user,"user fetched successfully")
  )
})


exports.resendVerificationEmail = asyncHandler(async (req,res) => {
  const userId = req.user.id

  const user = await User.findById(userId)

  if(!user) throw new ApiError(401,"user not found")

  const {unhashedToken,hashedToken,tokenExpiry} = user.generateTemporaryToken()

  user.emailVerificationToken = hashedToken
  user.emailVerificationTokenExpiry = tokenExpiry
  await user.save()

  //send mail
  sendMail({
      email : user.email,
      subject : "Email verification",
      mailGenContent : emailVerificationMailGenToken(user.username,`${process.env.BASE_URL}/user/verify/${unhashedToken}`)
  })

  res.status(200).json(
      new ApiResponse(201,{message : "mail sent successfully"})
  )
})

exports.refreshAccessToken = asyncHandler(async (req,res) => {
  const token = JSON.parse(req.cookies.userToken).refreshToken

  const decodedToken = jwt.verify(token,process.env.REFRESH_TOKEN_SECRET)

  const user = await User.findById(decodedToken.id)

  if(!user) throw new ApiError(401,"Refresh Token is invalid of expired")
  
  const accessToken = user.generateAccessToken()
  const refreshToken = user.generateRefreshToken()

  user.refreshToken = refreshToken

  await user.save()

  const cookieOptions = {
      httpOnly : true,
      secure : true,
      maxAge : 24*60*60*1000
  }


  res.cookie('userToken', JSON.stringify({ accessToken, refreshToken }), cookieOptions);

  res.status(200).json(
      new ApiResponse(200,{message : "access token refreshed successfully"})
  )

})

// GET /user/data-room/:contractId
exports.getUserDataRoom = async (req, res) => {
  try {
    const userId = req.user.id;
    const { contractId } = req.params;
    const contract = await Contract.findById(contractId).lean();
    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }
    // Check that the user owns the virtualUserId
    const virtualIdDoc = await VirtualID.findById(contract.virtualUserId).lean();
    if (!virtualIdDoc || String(virtualIdDoc.userId) !== String(userId)) {
      return res.status(403).json({ error: 'You are not authorized to access this data room' });
    }
    // Get user bank data
    const bankData = await UserBankData.findOne({ user_id: virtualIdDoc.userId }).lean();
    if (!bankData) {
      return res.status(404).json({ error: 'Bank data not found for user' });
    }
    // Filter only allowed fields
    const filtered = {};
    contract.allowedFields.forEach(field => {
      if (bankData.hasOwnProperty(field)) {
        filtered[field] = bankData[field];
      }
    });
    // Use the proper masking utility
    const fieldsToMask = [
      'income',
      'credit_score',
      'transaction_summary',
      'employer',
      'last_updated'
    ];
    const masked = maskFields(filtered, fieldsToMask);
    // Consent metadata
    let expiresIn = null;
    let revoked = false;
    if (contract.consentId) {
      try {
        const consent = await Consent.findById(contract.consentId).lean();
        if (consent) {
          expiresIn = consent.expiresAt ? new Date(consent.expiresAt).getTime() - Date.now() : null;
          revoked = consent.status === 'REVOKED';
        }
      } catch (consentErr) {
        console.error('[getUserDataRoom] Error fetching consent:', consentErr);
      }
    }
    res.json({
      data: masked,
      consent: { expiresIn, revoked },
      contract: contract
    });
  } catch (err) {
    console.error('[getUserDataRoom] Unexpected error:', err);
    res.status(500).json({ error: 'Error fetching data room data', details: err.message });
  }
};

// GET /user/data-room-logs/:contractId
exports.getUserDataRoomLogs = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { contractId } = req.params;
  const contract = await Contract.findById(contractId).lean();
  if (!contract) {
    return res.status(404).json({ error: 'Contract not found' });
  }
  // Check that the user owns the virtualUserId
  const virtualIdDoc = await VirtualID.findById(contract.virtualUserId).lean();
  if (!virtualIdDoc || String(virtualIdDoc.userId) !== String(userId)) {
    return res.status(403).json({ error: 'You are not authorized to access these logs' });
  }
  // Get all partner logs for this contract
  const contractObjectId = new Types.ObjectId(contractId);
  const logs = await AuditLog.find({
    partnerId: contract.partnerId,
    'context.contractId': contractObjectId
  })
    .sort({ timestamp: -1 })
    .limit(20);
  res.json({ logs });
});

