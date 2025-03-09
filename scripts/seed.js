require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Define User Schema (inline to avoid import issues)
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
      expiresAt: Date,
    },
  },
  { timestamps: true }
);

// Add methods for OTP generation and verification
UserSchema.methods.generateOTP = function() {
  // Generate a 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Set expiration to 10 minutes from now
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 10);
  
  // Save OTP to user
  this.otp = {
    code: otp,
    expiresAt: expiresAt
  };
  
  return otp;
};

UserSchema.methods.verifyOTP = function(code) {
  // Check if OTP exists and is valid
  if (!this.otp || !this.otp.code || !this.otp.expiresAt) {
    return false;
  }
  
  // Check if OTP has expired
  if (new Date() > this.otp.expiresAt) {
    return false;
  }
  
  // Check if OTP matches
  return this.otp.code === code;
};

// Register the model
const User = mongoose.models.User || mongoose.model('User', UserSchema);

// Create admin user
const createAdminUser = async () => {
  try {
    // Check if admin user already exists
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (adminExists) {
      console.log('Admin user already exists');
      return;
    }
    
    // Create admin user
    const admin = new User({
      name: 'Admin User',
      email: 'admin@smarttime.com',
      mobileNumber: '1234567890',
      role: 'admin',
      designation: 'System Administrator',
      isVerified: true,
      isActive: true,
    });
    
    await admin.save();
    
    console.log('Admin user created successfully');
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
};

// Run seed functions
const seedDatabase = async () => {
  try {
    await createAdminUser();
    
    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase(); 