import mongoose from 'mongoose';

const pharmacySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Pharmacy name is required'],
    trim: true,
    maxlength: [100, 'Pharmacy name cannot exceed 100 characters']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Pharmacy owner is required']
  },
  license_number: {
    type: String,
    required: [true, 'License number is required'],
    unique: true,
    trim: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: [true, 'Location coordinates are required']
    },
    address: {
      street: {
        type: String,
        required: [true, 'Street address is required']
      },
      city: {
        type: String,
        required: [true, 'City is required']
      },
      state: {
        type: String,
        required: [true, 'State is required']
      },
      pincode: {
        type: String,
        required: [true, 'Pincode is required'],
        match: [/^[0-9]{6}$/, 'Please enter a valid 6-digit pincode']
      },
      country: {
        type: String,
        default: 'India'
      }
    }
  },
  contact: {
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    }
  },
  operating_hours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  services: [{
    type: String,
    enum: ['home_delivery', '24_hours', 'online_ordering', 'prescription_service', 'consultation']
  }],
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  inventory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine'
  }]
}, {
  timestamps: true
});

// Create geospatial index for location-based queries
pharmacySchema.index({ location: '2dsphere' });
pharmacySchema.index({ 'location.address.city': 1 });
pharmacySchema.index({ 'location.address.pincode': 1 });

// Virtual for getting distance (will be populated in queries)
pharmacySchema.virtual('distance');

// Method to check if pharmacy is currently open
pharmacySchema.methods.isCurrentlyOpen = function() {
  const now = new Date();
  const currentDay = now.toLocaleLowerCase().substring(0, 3); // mon, tue, etc.
  const currentTime = now.toTimeString().substring(0, 5); // HH:MM format
  
  const todayHours = this.operating_hours[currentDay];
  if (!todayHours || !todayHours.open || !todayHours.close) {
    return false;
  }
  
  return currentTime >= todayHours.open && currentTime <= todayHours.close;
};

const Pharmacy = mongoose.model('Pharmacy', pharmacySchema);

export default Pharmacy;