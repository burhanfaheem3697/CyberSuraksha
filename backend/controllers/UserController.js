const User = require('../models/User.js');
const jwt = require('jsonwebtoken');
const UserBankData = require('../models/UserBankData');
const asyncHandler = require('../utils/asyncHandler.js')
const ApiResponse = require('../utils/api_Response.js')
const ApiError = require('../utils/api_Error.js')
const { sendMail,emailVerificationMailGenToken, forgotPasswordMailGenContent }  = require("../utils/mail.js");
const crypto = require('crypto')
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Register a new user

exports.registerUser = asyncHandler(async (req,res) => {
  //get data
  const {email,username,fullname,password,phone, aadhaar, dataResidency} = req.body
  
  //validation done by middleware
  //check if user already exist
  const existingUser = await User.findOne({email})

  if(existingUser) throw new ApiError(400,"User already exist")
  
  //create user
  const user = await User.create({email,username,fullname,password,phone,aadhaar,dataResidency})

  if(!user) throw new ApiError(400,"Error while registering user")

  const dummyBankData = new UserBankData({
    user_id : user._id,
    income: 50000 + Math.floor(Math.random() * 50000),
    credit_score: 700 + Math.floor(Math.random() * 100),
    txn_summary: { groceries: 8000, emi: 12000, bills: 4000 },
    employer: 'DummyCorp',
    last_updated: new Date()
  });
  await dummyBankData.save();

  
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

