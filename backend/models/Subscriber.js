const mongoose = require('mongoose');

const subscriberSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [100, 'First name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  // Link to member if they also placed a pin
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member'
  },
  // Email marketing preferences
  preferences: {
    whispers: {
      type: Boolean,
      default: true // Subscribed to "Whispers from the Wild"
    },
    updates: {
      type: Boolean,
      default: true
    }
  },
  // Tracking
  source: {
    type: String,
    enum: ['website', 'webhook', 'gohighlevel', 'manual'],
    default: 'website'
  },
  status: {
    type: String,
    enum: ['active', 'unsubscribed', 'bounced'],
    default: 'active'
  },
  // Email sequence tracking
  emailSequence: {
    welcomeSent: {
      type: Boolean,
      default: false
    },
    welcomeSentAt: Date
  }
}, {
  timestamps: true
});

// Index for efficient lookups
subscriberSchema.index({ email: 1 });
subscriberSchema.index({ status: 1 });
subscriberSchema.index({ createdAt: -1 });

// Static method to get active subscribers count
subscriberSchema.statics.getActiveCount = function() {
  return this.countDocuments({ status: 'active' });
};

const Subscriber = mongoose.model('Subscriber', subscriberSchema);

module.exports = Subscriber;
