const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const UserSchema = new mongoose.Schema({
  avatar: {
    type: String
  },
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  fullname: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  forgotPasswordToken: {
    type: String,

  },
  forgotPasswordTokenExpiry: {
    type: Date,
  },
  refreshToken: {
    type: String
  },
  emailVerificationToken: {
    type: String
  },
  emailVerificationTokenExpiry: {
    type: Date
  },
  phone: { type: String },
  aadhaar: { type: String },
  kycStatus: { type: String, enum: ['PENDING', 'VERIFIED', 'REJECTED'], default: 'PENDING' },
  dataResidency: { type: String },
  virtualIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'VirtualID' }],
}, { timestamps: true });


UserSchema.pre("save",async function (next) {
  if(!this.isModified("password")) return next()
  this.password = await bcrypt.hash(this.password,10)
  next()
})

UserSchema.methods.isPasswordCorrect = async function(password){
  return await bcrypt.compare(password,this.password)
}

UserSchema.methods.generateAccessToken = function(){
  return jwt.sign({
      id : this._id,
      email : this.email,
      username : this.username
  },process.env.ACCESS_TOKEN_SECRET,{expiresIn : process.env.ACCESS_TOKEN_EXPIRY})
}

UserSchema.methods.generateRefreshToken = function(){
  return jwt.sign({
      id : this._id,
  },process.env.REFRESH_TOKEN_SECRET,{expiresIn : process.env.REFRESH_TOKEN_EXPIRY})
}

UserSchema.methods.generateTemporaryToken = function(){
  const unhashedToken = crypto.randomBytes(32).toString('hex')

  const hashedToken = crypto
  .createHash('SHA256')
  .update(unhashedToken)
  .digest('hex')

  const tokenExpiry = Date.now() + (20*60*1000) //20min

  return {unhashedToken,hashedToken,tokenExpiry}
}

module.exports = mongoose.model('User', UserSchema); 