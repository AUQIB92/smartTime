import mongoose from 'mongoose';

const SemesterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a semester name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  startDate: {
    type: Date,
    required: [true, 'Please provide a start date']
  },
  endDate: {
    type: Date,
    required: [true, 'Please provide an end date']
  },
  isActive: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Custom validation to ensure endDate is after startDate
SemesterSchema.pre('validate', function(next) {
  if (this.startDate && this.endDate && this.endDate <= this.startDate) {
    this.invalidate('endDate', 'End date must be after start date');
  }
  next();
});

// Ensure only one semester can be active at a time
SemesterSchema.pre('save', async function(next) {
  if (this.isActive) {
    try {
      // Deactivate all other semesters
      await this.constructor.updateMany(
        { _id: { $ne: this._id } },
        { isActive: false }
      );
    } catch (error) {
      next(error);
    }
  }
  next();
});

// Create the model if it doesn't exist already
const Semester = mongoose.models.Semester || mongoose.model('Semester', SemesterSchema);

export default Semester; 