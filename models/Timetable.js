import mongoose from 'mongoose';

const TimetableSchema = new mongoose.Schema(
  {
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    classroom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Classroom',
      required: true,
    },
    semester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Semester',
      required: true,
    },
    dayOfWeek: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Create a compound index to ensure no scheduling conflicts
TimetableSchema.index(
  { 
    classroom: 1, 
    dayOfWeek: 1, 
    startTime: 1, 
    endTime: 1,
    semester: 1,
    isActive: 1
  }, 
  { unique: true }
);

// Create another compound index for teacher availability
TimetableSchema.index(
  { 
    teacher: 1, 
    dayOfWeek: 1, 
    startTime: 1, 
    endTime: 1,
    semester: 1,
    isActive: 1
  }, 
  { unique: true }
);

export default mongoose.models.Timetable || mongoose.model('Timetable', TimetableSchema); 