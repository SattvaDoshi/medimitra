import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  transaction_id: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    required: [true, 'Transaction type is required'],
    enum: ['sale', 'purchase', 'return', 'adjustment', 'damage', 'expiry']
  },
  pharmacy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pharmacy',
    required: [true, 'Pharmacy reference is required']
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  items: [{
    medicine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
      required: true
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1']
    },
    unit_price: {
      type: Number,
      required: [true, 'Unit price is required'],
      min: [0, 'Unit price cannot be negative']
    },
    total_price: {
      type: Number,
      required: [true, 'Total price is required'],
      min: [0, 'Total price cannot be negative']
    },
    batch_number: String,
    expiry_date: Date
  }],
  payment: {
    method: {
      type: String,
      enum: ['cash', 'card', 'upi', 'online', 'insurance'],
      default: 'cash'
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    transaction_reference: String
  },
  prescription: {
    number: String,
    doctor_name: String,
    hospital_name: String,
    date: Date
  },
  totals: {
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    discount: {
      type: Number,
      default: 0,
      min: 0
    },
    tax: {
      type: Number,
      default: 0,
      min: 0
    },
    total_amount: {
      type: Number,
      required: true,
      min: 0
    }
  },
  notes: String,
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled', 'returned'],
    default: 'pending'
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
transactionSchema.index({ pharmacy: 1, createdAt: -1 });
transactionSchema.index({ customer: 1, createdAt: -1 });
transactionSchema.index({ transaction_id: 1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ 'payment.status': 1 });

// Pre-save middleware to generate transaction ID
transactionSchema.pre('save', function(next) {
  if (!this.transaction_id) {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.transaction_id = `TXN${timestamp}${random}`;
  }
  
  // Calculate totals
  if (this.items && this.items.length > 0) {
    this.totals.subtotal = this.items.reduce((sum, item) => sum + item.total_price, 0);
    this.totals.total_amount = this.totals.subtotal - this.totals.discount + this.totals.tax;
  }
  
  next();
});

// Method to update medicine stock after transaction
transactionSchema.methods.updateMedicineStock = async function() {
  const Medicine = mongoose.model('Medicine');
  
  for (const item of this.items) {
    const medicine = await Medicine.findById(item.medicine);
    if (medicine) {
      if (this.type === 'sale') {
        await medicine.updateStock(item.quantity, 'subtract');
      } else if (this.type === 'purchase') {
        await medicine.updateStock(item.quantity, 'add');
      } else if (this.type === 'return' && this.status === 'completed') {
        await medicine.updateStock(item.quantity, 'add');
      }
    }
  }
};

// Post-save middleware to update stock
transactionSchema.post('save', async function(doc) {
  if (doc.status === 'completed') {
    await doc.updateMedicineStock();
  }
});

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;