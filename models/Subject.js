import mongoose from 'mongoose';

const SubjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a subject name'],
    trim: true,
  },
  code: {
    type: String,
    required: [true, 'Please provide a subject code'],
    unique: true,
    trim: true,
    uppercase: true,
  },
  department: {
    type: String,
    required: [true, 'Please provide a department'],
    trim: true,
  },
  credits: {
    type: Number,
    required: [true, 'Please provide credits'],
    min: [1, 'Credits must be at least 1'],
    default: 3,
  },
  hoursPerWeek: {
    type: Number,
    required: [true, 'Please provide hours per week'],
    min: [1, 'Hours per week must be at least 1'],
    default: 3,
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
const Subject = mongoose.models.Subject || mongoose.model('Subject', SubjectSchema);

export default Subject; 