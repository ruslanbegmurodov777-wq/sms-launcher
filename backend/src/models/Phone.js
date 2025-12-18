const mongoose = require('mongoose');

const phoneSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Contact name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  number: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    // Basic phone validation - allows international formats
    match: [/^\+?[\d\s\-()]{7,20}$/, 'Please enter a valid phone number']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries by user
phoneSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Phone', phoneSchema);
