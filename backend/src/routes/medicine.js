import express from 'express';
import { body, query, validationResult } from 'express-validator';
import { Medicine, Pharmacy } from '../models/index.js';
import { authenticateToken, isPharmacyOwner } from '../config/auth.js';
import { searchLimiter } from '../config/rateLimiting.js';
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
const validateMedicine = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Medicine name must be between 2 and 100 characters'),
  
  body('brand')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Brand must be between 1 and 50 characters'),
  
  body('composition')
    .trim()
    .notEmpty()
    .withMessage('Composition is required'),
  
  body('category')
    .isIn(['tablet', 'capsule', 'syrup', 'injection', 'cream', 'ointment', 'drops', 'spray', 'inhaler', 'powder', 'gel', 'lotion', 'other'])
    .withMessage('Invalid category'),
  
  body('dosage_form')
    .trim()
    .notEmpty()
    .withMessage('Dosage form is required'),
  
  body('strength')
    .trim()
    .notEmpty()
    .withMessage('Strength is required'),
  
  body('pack_size')
    .trim()
    .notEmpty()
    .withMessage('Pack size is required'),
  
  body('manufacturer')
    .trim()
    .notEmpty()
    .withMessage('Manufacturer is required'),
  
  body('batch_number')
    .trim()
    .notEmpty()
    .withMessage('Batch number is required'),
  
  body('manufacturing_date')
    .isISO8601()
    .withMessage('Please provide a valid manufacturing date'),
  
  body('expiry_date')
    .isISO8601()
    .withMessage('Please provide a valid expiry date')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.manufacturing_date)) {
        throw new Error('Expiry date must be after manufacturing date');
      }
      return true;
    }),
  
  body('mrp')
    .isFloat({ min: 0 })
    .withMessage('MRP must be a positive number'),
  
  body('selling_price')
    .isFloat({ min: 0 })
    .withMessage('Selling price must be a positive number')
    .custom((value, { req }) => {
      if (parseFloat(value) > parseFloat(req.body.mrp)) {
        throw new Error('Selling price cannot exceed MRP');
      }
      return true;
    }),
  
  body('stock.current_quantity')
    .isInt({ min: 0 })
    .withMessage('Current quantity must be a non-negative integer'),
  
  body('stock.minimum_threshold')
    .isInt({ min: 0 })
    .withMessage('Minimum threshold must be a non-negative integer'),
  
  body('stock.unit')
    .isIn(['pieces', 'bottles', 'strips', 'boxes', 'vials', 'tubes'])
    .withMessage('Invalid stock unit')
];

// @route   POST /api/medicine
// @desc    Add new medicine to pharmacy
// @access  Private (Pharmacy Owner)
router.post('/', authenticateToken, isPharmacyOwner, validateMedicine, handleValidationErrors, asyncHandler(async (req, res) => {
  // Get user's pharmacy
  const pharmacy = await Pharmacy.findOne({ owner: req.user._id });
  
  if (!pharmacy) {
    return res.status(404).json({
      success: false,
      message: 'No pharmacy found for this user'
    });
  }

  // Check if medicine with same name, brand, and batch number already exists in this pharmacy
  const existingMedicine = await Medicine.findOne({
    pharmacy: pharmacy._id,
    name: req.body.name,
    brand: req.body.brand,
    batch_number: req.body.batch_number
  });

  if (existingMedicine) {
    return res.status(400).json({
      success: false,
      message: 'Medicine with this name, brand, and batch number already exists in your pharmacy'
    });
  }

  const medicine = new Medicine({
    ...req.body,
    pharmacy: pharmacy._id
  });

  await medicine.save();

  // Add medicine to pharmacy's inventory
  pharmacy.inventory.push(medicine._id);
  await pharmacy.save();

  res.status(201).json({
    success: true,
    message: 'Medicine added successfully',
    data: { medicine }
  });
}));

// @route   GET /api/medicine
// @desc    Get all medicines with pagination
// @access  Public
router.get('/', [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('category')
    .optional()
    .isIn(['tablet', 'capsule', 'syrup', 'injection', 'cream', 'ointment', 'drops', 'spray', 'inhaler', 'powder', 'gel', 'lotion', 'other'])
    .withMessage('Invalid category'),
  
  query('available_only')
    .optional()
    .isBoolean()
    .withMessage('Available only must be a boolean')
], handleValidationErrors, asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, category, available_only = true } = req.query;

  let medicineQuery = { isActive: true };

  if (category) {
    medicineQuery.category = category;
  }

  if (available_only === 'true') {
    medicineQuery.stock_quantity = { $gt: 0 };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const medicines = await Medicine.find(medicineQuery)
    .populate('pharmacy', 'name location contact rating operating_hours')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Medicine.countDocuments(medicineQuery);
  const totalPages = Math.ceil(total / parseInt(limit));

  res.status(200).json({
    success: true,
    message: 'Medicines retrieved successfully',
    data: {
      medicines,
      pagination: {
        current_page: parseInt(page),
        total_pages: totalPages,
        total_items: total,
        items_per_page: parseInt(limit),
        has_next: page < totalPages,
        has_previous: page > 1
      }
    }
  });
}));

// @route   GET /api/medicine/search
// @desc    Search medicines across all pharmacies
// @access  Public
router.get('/search', searchLimiter, [
  query('q')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Search query must be at least 1 character'),
  
  query('lat')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be a valid number between -90 and 90'),
  
  query('lng')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be a valid number between -180 and 180'),
  
  query('radius')
    .optional()
    .isFloat({ min: 0.1, max: 100 })
    .withMessage('Radius must be between 0.1 and 100 km'),
  
  query('city')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('City must be at least 2 characters'),
  
  query('category')
    .optional()
    .isIn(['tablet', 'capsule', 'syrup', 'injection', 'cream', 'ointment', 'drops', 'spray', 'inhaler', 'powder', 'gel', 'lotion', 'other'])
    .withMessage('Invalid category')
], handleValidationErrors, asyncHandler(async (req, res) => {
  const { q, lat, lng, radius = 10, city, category, available_only = true, limit = 20, page = 1 } = req.query;

  let medicineQuery = {
    isActive: true,
    $text: { $search: q }
  };

  if (category) {
    medicineQuery.category = category;
  }

  if (available_only === 'true') {
    medicineQuery['stock.current_quantity'] = { $gt: 0 };
    medicineQuery.expiry_date = { $gt: new Date() };
  }

  let aggregationPipeline = [
    { $match: medicineQuery },
    {
      $lookup: {
        from: 'pharmacies',
        localField: 'pharmacy',
        foreignField: '_id',
        as: 'pharmacy'
      }
    },
    { $unwind: '$pharmacy' },
    { $match: { 'pharmacy.isActive': true } }
  ];

  // Add location-based filtering if coordinates provided
  if (lat && lng) {
    aggregationPipeline.push({
      $addFields: {
        distance: {
          $divide: [
            {
              $sqrt: {
                $add: [
                  {
                    $pow: [
                      {
                        $multiply: [
                          { $subtract: [{ $arrayElemAt: ['$pharmacy.location.coordinates', 1] }, parseFloat(lat)] },
                          111.32
                        ]
                      },
                      2
                    ]
                  },
                  {
                    $pow: [
                      {
                        $multiply: [
                          { $subtract: [{ $arrayElemAt: ['$pharmacy.location.coordinates', 0] }, parseFloat(lng)] },
                          { $multiply: [111.32, { $cos: { $multiply: [parseFloat(lat), Math.PI / 180] } }] }
                        ]
                      },
                      2
                    ]
                  }
                ]
              }
            },
            1
          ]
        }
      }
    });

    aggregationPipeline.push({
      $match: { distance: { $lte: parseFloat(radius) } }
    });

    aggregationPipeline.push({
      $sort: { distance: 1, score: { $meta: 'textScore' } }
    });
  } else if (city) {
    aggregationPipeline.push({
      $match: { 'pharmacy.location.address.city': new RegExp(city, 'i') }
    });
  }

  if (!lat || !lng) {
    aggregationPipeline.push({
      $sort: { score: { $meta: 'textScore' } }
    });
  }

  // Add pagination
  aggregationPipeline.push(
    { $skip: (page - 1) * limit },
    { $limit: parseInt(limit) }
  );

  // Project fields
  aggregationPipeline.push({
    $project: {
      name: 1,
      brand: 1,
      category: 1,
      composition: 1,
      strength: 1,
      pack_size: 1,
      selling_price: 1,
      mrp: 1,
      'stock.current_quantity': 1,
      'stock.unit': 1,
      prescription_required: 1,
      expiry_date: 1,
      distance: 1,
      'pharmacy._id': 1,
      'pharmacy.name': 1,
      'pharmacy.location.address': 1,
      'pharmacy.contact': 1,
      'pharmacy.rating': 1
    }
  });

  const medicines = await Medicine.aggregate(aggregationPipeline);

  res.status(200).json({
    success: true,
    data: {
      medicines,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: medicines.length
      }
    }
  });
}));

// @route   GET /api/medicine/:id
// @desc    Get medicine by ID
// @access  Public
router.get('/:id', asyncHandler(async (req, res) => {
  const medicine = await Medicine.findById(req.params.id)
    .populate('pharmacy', 'name location contact rating operating_hours');

  if (!medicine) {
    return res.status(404).json({
      success: false,
      message: 'Medicine not found'
    });
  }

  res.status(200).json({
    success: true,
    data: { medicine }
  });
}));

// @route   PUT /api/medicine/:id
// @desc    Update medicine
// @access  Private (Pharmacy Owner)
router.put('/:id', authenticateToken, isPharmacyOwner, validateMedicine, handleValidationErrors, asyncHandler(async (req, res) => {
  const medicine = await Medicine.findById(req.params.id).populate('pharmacy');

  if (!medicine) {
    return res.status(404).json({
      success: false,
      message: 'Medicine not found'
    });
  }

  // Check if user owns this pharmacy
  if (medicine.pharmacy.owner.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this medicine'
    });
  }

  const updatedMedicine = await Medicine.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('pharmacy', 'name location contact');

  res.status(200).json({
    success: true,
    message: 'Medicine updated successfully',
    data: { medicine: updatedMedicine }
  });
}));

// @route   DELETE /api/medicine/:id
// @desc    Delete medicine
// @access  Private (Pharmacy Owner)
router.delete('/:id', authenticateToken, isPharmacyOwner, asyncHandler(async (req, res) => {
  const medicine = await Medicine.findById(req.params.id).populate('pharmacy');

  if (!medicine) {
    return res.status(404).json({
      success: false,
      message: 'Medicine not found'
    });
  }

  // Check if user owns this pharmacy
  if (medicine.pharmacy.owner.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this medicine'
    });
  }

  // Soft delete - mark as inactive
  medicine.isActive = false;
  await medicine.save();

  // Remove from pharmacy inventory
  await Pharmacy.findByIdAndUpdate(
    medicine.pharmacy._id,
    { $pull: { inventory: medicine._id } }
  );

  res.status(200).json({
    success: true,
    message: 'Medicine deleted successfully'
  });
}));

// @route   PATCH /api/medicine/:id/stock
// @desc    Update medicine stock
// @access  Private (Pharmacy Owner)
router.patch('/:id/stock', authenticateToken, isPharmacyOwner, [
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  
  body('operation')
    .isIn(['add', 'subtract', 'set'])
    .withMessage('Operation must be add, subtract, or set')
], handleValidationErrors, asyncHandler(async (req, res) => {
  const { quantity, operation } = req.body;
  
  const medicine = await Medicine.findById(req.params.id).populate('pharmacy');

  if (!medicine) {
    return res.status(404).json({
      success: false,
      message: 'Medicine not found'
    });
  }

  // Check if user owns this pharmacy
  if (medicine.pharmacy.owner.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this medicine stock'
    });
  }

  let newQuantity;
  switch (operation) {
    case 'add':
      newQuantity = medicine.stock.current_quantity + quantity;
      break;
    case 'subtract':
      newQuantity = Math.max(0, medicine.stock.current_quantity - quantity);
      break;
    case 'set':
      newQuantity = quantity;
      break;
    default:
      return res.status(400).json({
        success: false,
        message: 'Invalid operation'
      });
  }

  medicine.stock.current_quantity = newQuantity;
  await medicine.save();

  res.status(200).json({
    success: true,
    message: 'Stock updated successfully',
    data: {
      medicine: {
        id: medicine._id,
        name: medicine.name,
        brand: medicine.brand,
        stock: medicine.stock
      }
    }
  });
}));

// @route   GET /api/medicine/pharmacy/:pharmacyId
// @desc    Get all medicines for a specific pharmacy
// @access  Public
router.get('/pharmacy/:pharmacyId', [
  query('category')
    .optional()
    .isIn(['tablet', 'capsule', 'syrup', 'injection', 'cream', 'ointment', 'drops', 'spray', 'inhaler', 'powder', 'gel', 'lotion', 'other'])
    .withMessage('Invalid category'),
  
  query('available_only')
    .optional()
    .isBoolean()
    .withMessage('available_only must be a boolean'),
  
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Search term must be at least 1 character')
], handleValidationErrors, asyncHandler(async (req, res) => {
  const { category, available_only, search, limit = 20, page = 1 } = req.query;

  // Check if pharmacy exists
  const pharmacy = await Pharmacy.findById(req.params.pharmacyId);
  if (!pharmacy) {
    return res.status(404).json({
      success: false,
      message: 'Pharmacy not found'
    });
  }

  let query = { pharmacy: req.params.pharmacyId, isActive: true };

  if (category) {
    query.category = category;
  }

  if (available_only === 'true') {
    query['stock.current_quantity'] = { $gt: 0 };
    query.expiry_date = { $gt: new Date() };
  }

  if (search) {
    query.$or = [
      { name: new RegExp(search, 'i') },
      { brand: new RegExp(search, 'i') },
      { generic_name: new RegExp(search, 'i') },
      { composition: new RegExp(search, 'i') }
    ];
  }

  const skip = (page - 1) * limit;
  const medicines = await Medicine.find(query)
    .select('name brand category composition strength pack_size selling_price mrp stock prescription_required expiry_date')
    .sort({ name: 1 })
    .limit(parseInt(limit))
    .skip(skip);

  const total = await Medicine.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      medicines,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
}));

// @route   GET /api/medicine/my/inventory
// @desc    Get medicines for the authenticated pharmacy owner
// @access  Private (Pharmacy Owner)
router.get('/my/inventory', authenticateToken, isPharmacyOwner, [
  query('category')
    .optional()
    .isIn(['tablet', 'capsule', 'syrup', 'injection', 'cream', 'ointment', 'drops', 'spray', 'inhaler', 'powder', 'gel', 'lotion', 'other'])
    .withMessage('Invalid category'),
  
  query('status')
    .optional()
    .isIn(['all', 'available', 'low_stock', 'expired', 'expiring_soon'])
    .withMessage('Invalid status filter'),
  
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Search term must be at least 1 character')
], handleValidationErrors, asyncHandler(async (req, res) => {
  const { category, status = 'all', search, limit = 20, page = 1 } = req.query;

  // Get user's pharmacy
  const pharmacy = await Pharmacy.findOne({ owner: req.user._id });
  
  if (!pharmacy) {
    return res.status(404).json({
      success: false,
      message: 'No pharmacy found for this user'
    });
  }

  let query = { pharmacy: pharmacy._id, isActive: true };

  if (category) {
    query.category = category;
  }

  if (search) {
    query.$or = [
      { name: new RegExp(search, 'i') },
      { brand: new RegExp(search, 'i') },
      { generic_name: new RegExp(search, 'i') },
      { composition: new RegExp(search, 'i') }
    ];
  }

  // Status-based filtering
  switch (status) {
    case 'available':
      query['stock.current_quantity'] = { $gt: 0 };
      query.expiry_date = { $gt: new Date() };
      break;
    case 'low_stock':
      query.$expr = { $lte: ['$stock.current_quantity', '$stock.minimum_threshold'] };
      break;
    case 'expired':
      query.expiry_date = { $lte: new Date() };
      break;
    case 'expiring_soon':
      query.expiry_date = { 
        $gte: new Date(),
        $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      };
      break;
  }

  const skip = (page - 1) * limit;
  const medicines = await Medicine.find(query)
    .sort({ name: 1 })
    .limit(parseInt(limit))
    .skip(skip);

  const total = await Medicine.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      medicines,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
}));

export default router;