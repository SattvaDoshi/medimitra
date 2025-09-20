import express from 'express';
import { body, query, validationResult } from 'express-validator';
import { Transaction, Medicine, Pharmacy, User } from '../models/index.js';
import { authenticateToken, isPharmacyOwner } from '../config/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Validation middleware
const validateTransaction = [
  body('type')
    .isIn(['sale', 'purchase', 'return', 'adjustment', 'damage', 'expiry'])
    .withMessage('Invalid transaction type'),
  
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item is required'),
  
  body('items.*.medicine')
    .isMongoId()
    .withMessage('Valid medicine ID is required'),
  
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  
  body('items.*.unit_price')
    .isFloat({ min: 0 })
    .withMessage('Unit price must be a non-negative number'),
  
  body('payment.method')
    .optional()
    .isIn(['cash', 'card', 'upi', 'online', 'insurance'])
    .withMessage('Invalid payment method'),
  
  body('totals.discount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Discount must be a non-negative number'),
  
  body('totals.tax')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Tax must be a non-negative number')
];

// @route   POST /api/transaction
// @desc    Create new transaction
// @access  Private (Pharmacy Owner)
router.post('/', authenticateToken, isPharmacyOwner, validateTransaction, handleValidationErrors, asyncHandler(async (req, res) => {
  const { type, items, customer, payment, prescription, totals, notes } = req.body;

  // Get user's pharmacy
  const pharmacy = await Pharmacy.findOne({ owner: req.user._id });
  
  if (!pharmacy) {
    return res.status(404).json({
      success: false,
      message: 'No pharmacy found for this user'
    });
  }

  // Validate and process items
  const processedItems = [];
  let calculatedSubtotal = 0;

  for (const item of items) {
    const medicine = await Medicine.findById(item.medicine);
    
    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: `Medicine with ID ${item.medicine} not found`
      });
    }

    // Check if medicine belongs to this pharmacy
    if (medicine.pharmacy.toString() !== pharmacy._id.toString()) {
      return res.status(403).json({
        success: false,
        message: `Medicine ${medicine.name} does not belong to your pharmacy`
      });
    }

    // For sales, check if sufficient stock is available
    if (type === 'sale' && medicine.stock.current_quantity < item.quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock for ${medicine.name}. Available: ${medicine.stock.current_quantity}, Requested: ${item.quantity}`
      });
    }

    // Check if medicine is expired for sales
    if (type === 'sale' && medicine.expiry_date <= new Date()) {
      return res.status(400).json({
        success: false,
        message: `Medicine ${medicine.name} is expired and cannot be sold`
      });
    }

    const totalPrice = item.quantity * item.unit_price;
    calculatedSubtotal += totalPrice;

    processedItems.push({
      medicine: medicine._id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: totalPrice,
      batch_number: medicine.batch_number,
      expiry_date: medicine.expiry_date
    });
  }

  // Create transaction
  const transaction = new Transaction({
    type,
    pharmacy: pharmacy._id,
    customer: customer || null,
    items: processedItems,
    payment: payment || { method: 'cash', status: 'pending' },
    prescription: prescription || {},
    totals: {
      subtotal: calculatedSubtotal,
      discount: totals?.discount || 0,
      tax: totals?.tax || 0,
      total_amount: calculatedSubtotal - (totals?.discount || 0) + (totals?.tax || 0)
    },
    notes,
    created_by: req.user._id
  });

  await transaction.save();

  res.status(201).json({
    success: true,
    message: 'Transaction created successfully',
    data: { transaction }
  });
}));

// @route   PATCH /api/transaction/:id/complete
// @desc    Mark transaction as completed and update stock
// @access  Private (Pharmacy Owner)
router.patch('/:id/complete', authenticateToken, isPharmacyOwner, asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id).populate('pharmacy');

  if (!transaction) {
    return res.status(404).json({
      success: false,
      message: 'Transaction not found'
    });
  }

  // Check if user owns this pharmacy
  if (transaction.pharmacy.owner.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to complete this transaction'
    });
  }

  if (transaction.status === 'completed') {
    return res.status(400).json({
      success: false,
      message: 'Transaction is already completed'
    });
  }

  // Update transaction status
  transaction.status = 'completed';
  transaction.payment.status = 'completed';
  await transaction.save();

  // Update medicine stock
  await transaction.updateMedicineStock();

  res.status(200).json({
    success: true,
    message: 'Transaction completed successfully',
    data: { transaction }
  });
}));

// @route   GET /api/transaction
// @desc    Get transactions for pharmacy owner
// @access  Private (Pharmacy Owner)
router.get('/', authenticateToken, isPharmacyOwner, [
  query('type')
    .optional()
    .isIn(['sale', 'purchase', 'return', 'adjustment', 'damage', 'expiry'])
    .withMessage('Invalid transaction type'),
  
  query('status')
    .optional()
    .isIn(['pending', 'completed', 'cancelled', 'returned'])
    .withMessage('Invalid transaction status'),
  
  query('from_date')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid from date'),
  
  query('to_date')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid to date')
], handleValidationErrors, asyncHandler(async (req, res) => {
  const { type, status, from_date, to_date, limit = 20, page = 1 } = req.query;

  // Get user's pharmacy
  const pharmacy = await Pharmacy.findOne({ owner: req.user._id });
  
  if (!pharmacy) {
    return res.status(404).json({
      success: false,
      message: 'No pharmacy found for this user'
    });
  }

  let query = { pharmacy: pharmacy._id };

  if (type) {
    query.type = type;
  }

  if (status) {
    query.status = status;
  }

  if (from_date || to_date) {
    query.createdAt = {};
    if (from_date) {
      query.createdAt.$gte = new Date(from_date);
    }
    if (to_date) {
      query.createdAt.$lte = new Date(to_date);
    }
  }

  const skip = (page - 1) * limit;
  const transactions = await Transaction.find(query)
    .populate('customer', 'name email phone')
    .populate('items.medicine', 'name brand category')
    .populate('created_by', 'name')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(skip);

  const total = await Transaction.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
}));

// @route   GET /api/transaction/:id
// @desc    Get transaction by ID
// @access  Private (Pharmacy Owner)
router.get('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id)
    .populate('pharmacy', 'name location contact')
    .populate('customer', 'name email phone location')
    .populate('items.medicine', 'name brand category composition strength')
    .populate('created_by', 'name email');

  if (!transaction) {
    return res.status(404).json({
      success: false,
      message: 'Transaction not found'
    });
  }

  // Check if user has access to this transaction
  if (req.user.role === 'pharmacy_owner' && 
      transaction.pharmacy.owner && 
      transaction.pharmacy.owner.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view this transaction'
    });
  } else if (req.user.role === 'customer' && 
             (!transaction.customer || transaction.customer._id.toString() !== req.user._id.toString())) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view this transaction'
    });
  }

  res.status(200).json({
    success: true,
    data: { transaction }
  });
}));

// @route   PATCH /api/transaction/:id/cancel
// @desc    Cancel transaction
// @access  Private (Pharmacy Owner)
router.patch('/:id/cancel', authenticateToken, isPharmacyOwner, asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id).populate('pharmacy');

  if (!transaction) {
    return res.status(404).json({
      success: false,
      message: 'Transaction not found'
    });
  }

  // Check if user owns this pharmacy
  if (transaction.pharmacy.owner.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to cancel this transaction'
    });
  }

  if (transaction.status === 'completed') {
    return res.status(400).json({
      success: false,
      message: 'Cannot cancel a completed transaction'
    });
  }

  if (transaction.status === 'cancelled') {
    return res.status(400).json({
      success: false,
      message: 'Transaction is already cancelled'
    });
  }

  transaction.status = 'cancelled';
  transaction.payment.status = 'failed';
  await transaction.save();

  res.status(200).json({
    success: true,
    message: 'Transaction cancelled successfully',
    data: { transaction }
  });
}));

// @route   POST /api/transaction/sale
// @desc    Quick sale transaction
// @access  Private (Pharmacy Owner)
router.post('/sale', authenticateToken, isPharmacyOwner, [
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item is required'),
  
  body('items.*.medicine_id')
    .isMongoId()
    .withMessage('Valid medicine ID is required'),
  
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  
  body('payment_method')
    .optional()
    .isIn(['cash', 'card', 'upi', 'online', 'insurance'])
    .withMessage('Invalid payment method'),
  
  body('customer_phone')
    .optional()
    .matches(/^[0-9]{10}$/)
    .withMessage('Please provide a valid 10-digit phone number')
], handleValidationErrors, asyncHandler(async (req, res) => {
  const { items, payment_method = 'cash', customer_phone, notes } = req.body;

  // Get user's pharmacy
  const pharmacy = await Pharmacy.findOne({ owner: req.user._id });
  
  if (!pharmacy) {
    return res.status(404).json({
      success: false,
      message: 'No pharmacy found for this user'
    });
  }

  // Find customer if phone provided
  let customer = null;
  if (customer_phone) {
    customer = await User.findOne({ phone: customer_phone, role: 'customer' });
  }

  // Process items
  const processedItems = [];
  let subtotal = 0;

  for (const item of items) {
    const medicine = await Medicine.findById(item.medicine_id);
    
    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: `Medicine with ID ${item.medicine_id} not found`
      });
    }

    // Check pharmacy ownership
    if (medicine.pharmacy.toString() !== pharmacy._id.toString()) {
      return res.status(403).json({
        success: false,
        message: `Medicine ${medicine.name} does not belong to your pharmacy`
      });
    }

    // Check stock
    if (medicine.stock.current_quantity < item.quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock for ${medicine.name}. Available: ${medicine.stock.current_quantity}`
      });
    }

    // Check expiry
    if (medicine.expiry_date <= new Date()) {
      return res.status(400).json({
        success: false,
        message: `Medicine ${medicine.name} is expired`
      });
    }

    const totalPrice = item.quantity * medicine.selling_price;
    subtotal += totalPrice;

    processedItems.push({
      medicine: medicine._id,
      quantity: item.quantity,
      unit_price: medicine.selling_price,
      total_price: totalPrice,
      batch_number: medicine.batch_number,
      expiry_date: medicine.expiry_date
    });
  }

  // Create and complete transaction immediately
  const transaction = new Transaction({
    type: 'sale',
    pharmacy: pharmacy._id,
    customer: customer?._id,
    items: processedItems,
    payment: {
      method: payment_method,
      status: 'completed'
    },
    totals: {
      subtotal,
      discount: 0,
      tax: 0,
      total_amount: subtotal
    },
    notes,
    status: 'completed',
    created_by: req.user._id
  });

  await transaction.save();

  // Update stock immediately
  await transaction.updateMedicineStock();

  // Populate the response
  const populatedTransaction = await Transaction.findById(transaction._id)
    .populate('customer', 'name phone')
    .populate('items.medicine', 'name brand category');

  res.status(201).json({
    success: true,
    message: 'Sale completed successfully',
    data: { transaction: populatedTransaction }
  });
}));

// @route   GET /api/transaction/reports/summary
// @desc    Get transaction summary report
// @access  Private (Pharmacy Owner)
router.get('/reports/summary', authenticateToken, isPharmacyOwner, [
  query('period')
    .optional()
    .isIn(['today', 'week', 'month', 'year', 'custom'])
    .withMessage('Invalid period'),
  
  query('from_date')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid from date'),
  
  query('to_date')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid to date')
], handleValidationErrors, asyncHandler(async (req, res) => {
  const { period = 'month', from_date, to_date } = req.query;

  // Get user's pharmacy
  const pharmacy = await Pharmacy.findOne({ owner: req.user._id });
  
  if (!pharmacy) {
    return res.status(404).json({
      success: false,
      message: 'No pharmacy found for this user'
    });
  }

  let dateFilter = {};
  const now = new Date();

  switch (period) {
    case 'today':
      dateFilter = {
        $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        $lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
      };
      break;
    case 'week':
      const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
      dateFilter = {
        $gte: new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate()),
        $lt: new Date()
      };
      break;
    case 'month':
      dateFilter = {
        $gte: new Date(now.getFullYear(), now.getMonth(), 1),
        $lt: new Date(now.getFullYear(), now.getMonth() + 1, 1)
      };
      break;
    case 'year':
      dateFilter = {
        $gte: new Date(now.getFullYear(), 0, 1),
        $lt: new Date(now.getFullYear() + 1, 0, 1)
      };
      break;
    case 'custom':
      if (from_date && to_date) {
        dateFilter = {
          $gte: new Date(from_date),
          $lte: new Date(to_date)
        };
      }
      break;
  }

  const summary = await Transaction.aggregate([
    {
      $match: {
        pharmacy: pharmacy._id,
        status: 'completed',
        createdAt: dateFilter
      }
    },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        total_amount: { $sum: '$totals.total_amount' },
        total_items: { $sum: { $size: '$items' } }
      }
    }
  ]);

  // Get total revenue
  const totalRevenue = await Transaction.aggregate([
    {
      $match: {
        pharmacy: pharmacy._id,
        type: 'sale',
        status: 'completed',
        createdAt: dateFilter
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$totals.total_amount' }
      }
    }
  ]);

  // Get top selling medicines
  const topMedicines = await Transaction.aggregate([
    {
      $match: {
        pharmacy: pharmacy._id,
        type: 'sale',
        status: 'completed',
        createdAt: dateFilter
      }
    },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.medicine',
        total_quantity: { $sum: '$items.quantity' },
        total_revenue: { $sum: '$items.total_price' }
      }
    },
    {
      $lookup: {
        from: 'medicines',
        localField: '_id',
        foreignField: '_id',
        as: 'medicine'
      }
    },
    { $unwind: '$medicine' },
    {
      $project: {
        name: '$medicine.name',
        brand: '$medicine.brand',
        total_quantity: 1,
        total_revenue: 1
      }
    },
    { $sort: { total_quantity: -1 } },
    { $limit: 10 }
  ]);

  res.status(200).json({
    success: true,
    data: {
      summary,
      total_revenue: totalRevenue[0]?.total || 0,
      top_medicines: topMedicines,
      period,
      date_range: dateFilter
    }
  });
}));

export default router;