import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Medicine name is required'],
    trim: true,
    maxlength: [100, 'Medicine name cannot exceed 100 characters']
  },
  generic_name: {
    type: String,
    trim: true,
    maxlength: [100, 'Generic name cannot exceed 100 characters']
  },
  brand: {
    type: String,
    required: [true, 'Brand is required'],
    trim: true,
    maxlength: [50, 'Brand name cannot exceed 50 characters']
  },
  composition: {
    type: String,
    required: [true, 'Composition is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'tablet', 'capsule', 'syrup', 'injection', 'cream', 'ointment',
      'drops', 'spray', 'inhaler', 'powder', 'gel', 'lotion', 'other'
    ]
  },
  dosage_form: {
    type: String,
    required: [true, 'Dosage form is required']
  },
  strength: {
    type: String,
    required: [true, 'Strength is required']
  },
  pack_size: {
    type: String,
    required: [true, 'Pack size is required']
  },
  manufacturer: {
    type: String,
    required: [true, 'Manufacturer is required'],
    trim: true
  },
  batch_number: {
    type: String,
    required: [true, 'Batch number is required'],
    trim: true
  },
  manufacturing_date: {
    type: Date,
    required: [true, 'Manufacturing date is required']
  },
  expiry_date: {
    type: Date,
    required: [true, 'Expiry date is required'],
    validate: {
      validator: function(value) {
        return value > this.manufacturing_date;
      },
      message: 'Expiry date must be after manufacturing date'
    }
  },
  mrp: {
    type: Number,
    required: [true, 'MRP is required'],
    min: [0, 'MRP cannot be negative']
  },
  selling_price: {
    type: Number,
    required: [true, 'Selling price is required'],
    min: [0, 'Selling price cannot be negative'],
    validate: {
      validator: function(value) {
        return value <= this.mrp;
      },
      message: 'Selling price cannot exceed MRP'
    }
  },
  pharmacy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pharmacy',
    required: [true, 'Pharmacy reference is required']
  },
  stock: {
    current_quantity: {
      type: Number,
      required: [true, 'Current quantity is required'],
      min: [0, 'Stock quantity cannot be negative'],
      default: 0
    },
    minimum_threshold: {
      type: Number,
      required: [true, 'Minimum threshold is required'],
      min: [0, 'Minimum threshold cannot be negative'],
      default: 10
    },
    unit: {
      type: String,
      required: [true, 'Stock unit is required'],
      enum: ['pieces', 'bottles', 'strips', 'boxes', 'vials', 'tubes']
    }
  },
  prescription_required: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  side_effects: [{
    type: String,
    trim: true
  }],
  storage_conditions: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
medicineSchema.index({ name: 'text', generic_name: 'text', brand: 'text' });
medicineSchema.index({ pharmacy: 1, name: 1 });
medicineSchema.index({ category: 1 });
medicineSchema.index({ expiry_date: 1 });
medicineSchema.index({ 'stock.current_quantity': 1 });

// Virtual to check if medicine is expired
medicineSchema.virtual('isExpired').get(function() {
  return new Date() > this.expiry_date;
});

// Virtual to check if stock is low
medicineSchema.virtual('isLowStock').get(function() {
  return this.stock.current_quantity <= this.stock.minimum_threshold;
});

// Virtual to check if medicine is available
medicineSchema.virtual('isAvailable').get(function() {
  return this.stock.current_quantity > 0 && !this.isExpired && this.isActive;
});

// Method to update stock
medicineSchema.methods.updateStock = function(quantity, operation = 'subtract') {
  if (operation === 'subtract') {
    this.stock.current_quantity = Math.max(0, this.stock.current_quantity - quantity);
  } else if (operation === 'add') {
    this.stock.current_quantity += quantity;
  }
  return this.save();
};

// Pre-save middleware to check expiry date
medicineSchema.pre('save', function(next) {
  if (this.expiry_date <= new Date()) {
    this.isActive = false;
  }
  next();
});

const Medicine = mongoose.model('Medicine', medicineSchema);

export default Medicine;