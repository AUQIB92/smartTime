import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Check if admin user exists and create one if it doesn't
 */
async function ensureAdminExists() {
  try {
    // Import User model directly to ensure all methods are available
    const { default: User } = await import('../models/User');
    
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
      mobileNumber: '917006941596',
      role: 'admin',
      designation: 'System Administrator',
      isVerified: true,
      isActive: true,
    });
    
    await admin.save();
    
    console.log('Admin user created successfully');
  } catch (error) {
    console.error('Error ensuring admin exists:', error);
  }
}

async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then(async (mongoose) => {
      // After successful connection, ensure admin exists
      await ensureAdminExists();
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase; 