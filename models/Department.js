import mongoose from 'mongoose';

const DepartmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a department name'],
    trim: true,
  },
  code: {
    type: String,
    required: [true, 'Please provide a department code'],
    unique: true,
    trim: true,
    uppercase: true,
  },
  description: {
    type: String,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  }
}, { timestamps: true });

// Check if the model already exists to prevent overwriting
const Department = mongoose.models.Department || mongoose.model('Department', DepartmentSchema);

export default Department; 