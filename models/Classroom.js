import mongoose from 'mongoose';

const ClassroomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a classroom name/number'],
    trim: true,
  },
  building: {
    type: String,
    required: [true, 'Please provide a building name'],
    trim: true,
  },
  floor: {
    type: Number,
    required: [true, 'Please provide a floor number'],
    default: 1,
  },
  capacity: {
    type: Number,
    required: [true, 'Please provide a capacity'],
    min: [1, 'Capacity must be at least 1'],
    default: 30,
  },
  type: {
    type: String,
    required: [true, 'Please provide a classroom type'],
    enum: {
      values: ['lecture', 'lab', 'seminar', 'computer', 'workshop'],
      message: '{VALUE} is not a valid classroom type',
    },
    default: 'lecture',
  },
  facilities: {
    type: [String],
    default: [],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

// Create a compound index on name and building to ensure uniqueness
ClassroomSchema.index({ name: 1, building: 1 }, { unique: true });

// Check if the model already exists to prevent overwriting
const Classroom = mongoose.models.Classroom || mongoose.model('Classroom', ClassroomSchema);

export default Classroom; 