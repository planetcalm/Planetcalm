const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  petName: {
    type: String,
    required: [true, 'Pet name is required'],
    trim: true,
    maxlength: [100, 'Pet name cannot exceed 100 characters']
  },
  petType: {
    type: String,
    required: [true, 'Pet type is required'],
    enum: {
      values: ['Dog', 'Cat', 'Bird', 'Fish', 'Rabbit', 'Hamster', 'Horse', 'Reptile', 'Other'],
      message: '{VALUE} is not a valid pet type'
    }
  },
  petStatus: {
    type: String,
    enum: {
      values: ['with-you', 'in-heart'],
      message: '{VALUE} is not a valid pet status'
    },
    default: 'with-you'
  },
  location: {
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    state: {
      type: String,
      trim: true,
      default: ''
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true
    },
    // Full formatted address for display
    formatted: {
      type: String,
      trim: true
    }
  },
  // GeoJSON format for MongoDB geospatial queries
  coordinates: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      validate: {
        validator: function(v) {
          return v.length === 2 && 
                 v[0] >= -180 && v[0] <= 180 && // longitude
                 v[1] >= -90 && v[1] <= 90;     // latitude
        },
        message: 'Invalid coordinates'
      }
    }
  },
  // Owner's name
  firstName: {
    type: String,
    trim: true,
    maxlength: [100, 'First name cannot exceed 100 characters']
  },
  // Email
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  // Metadata
  source: {
    type: String,
    enum: ['website', 'webhook', 'gohighlevel', 'manual'],
    default: 'webhook'
  },
  // Flag for verification/moderation if needed
  isVerified: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for geospatial queries
memberSchema.index({ coordinates: '2dsphere' });

// Index for efficient count and listing
memberSchema.index({ createdAt: -1 });
memberSchema.index({ isActive: 1, isVerified: 1 });

// Virtual for latitude/longitude access
memberSchema.virtual('lat').get(function() {
  return this.coordinates?.coordinates?.[1];
});

memberSchema.virtual('lng').get(function() {
  return this.coordinates?.coordinates?.[0];
});

// Pre-save middleware to format location
memberSchema.pre('save', function(next) {
  if (this.location) {
    const parts = [this.location.city];
    if (this.location.state) parts.push(this.location.state);
    parts.push(this.location.country);
    this.location.formatted = parts.join(', ');
  }
  next();
});

// Static method to get all active members for map
memberSchema.statics.getActiveForMap = function() {
  return this.find({ isActive: true, isVerified: true })
    .select('petName petType petStatus location coordinates createdAt')
    .sort({ createdAt: -1 })
    .lean();
};

// Static method to get member count
memberSchema.statics.getCount = function() {
  return this.countDocuments({ isActive: true, isVerified: true });
};

// Static method to get recent members
memberSchema.statics.getRecent = function(limit = 10) {
  return this.find({ isActive: true, isVerified: true })
    .select('petName petType location createdAt')
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};

const Member = mongoose.model('Member', memberSchema);

module.exports = Member;
