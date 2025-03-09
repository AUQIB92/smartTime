import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    mobileNumber: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: String,
      enum: ['admin', 'principal', 'hod', 'teacher'],
      required: true,
    },
    department: {
      type: String,
      required: function() {
        return this.role === 'hod' || this.role === 'teacher';
      },
    },
    designation: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      code: String,
      expiresAt: Date
    },
  },
  { timestamps: true }
);

// Generate OTP
UserSchema.methods.generateOTP = function() {
  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Set OTP and expiration (10 minutes)
  this.otp = {
    code: otp,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000)
  };
  
  return otp;
};

// Verify OTP
UserSchema.methods.verifyOTP = function(code) {
  return this.otp && 
         this.otp.code === code && 
         this.otp.expiresAt > new Date();
};

// Check if the model is already defined to prevent overwriting during hot reloads
export default mongoose.models.User || mongoose.model('User', UserSchema); 