import express from 'express';
import { body, query, validationResult } from 'express-validator';
import { Pharmacy, Medicine, User } from '../models/index.js';
import { authenticateToken, isPharmacyOwner, isAdmin } from '../config/auth.js';
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
const validatePharmacy = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Pharmacy name must be between 2 and 100 characters'),
  
  body('license_number')
    .trim()
    .notEmpty()
    .withMessage('License number is required'),
  
  body('location.coordinates')
    .isArray({ min: 2, max: 2 })
    .withMessage('Location coordinates must be an array of [longitude, latitude]'),
  
  body('location.address.street')
    .trim()
    .notEmpty()
    .withMessage('Street address is required'),
  
  body('location.address.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  
  body('location.address.state')
    .trim()
    .notEmpty()
    .withMessage('State is required'),
  
  body('location.address.pincode')
    .matches(/^[0-9]{6}$/)
    .withMessage('Please provide a valid 6-digit pincode'),
  
  body('contact.phone')
    .matches(/^[0-9]{10}$/)
    .withMessage('Please provide a valid 10-digit phone number'),
  
  body('contact.email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
];

// @route   POST /api/pharmacy
// @desc    Create new pharmacy
// @access  Private (Pharmacy Owner)
router.post('/', authenticateToken, isPharmacyOwner, validatePharmacy, handleValidationErrors, asyncHandler(async (req, res) => {
  // Check if user already has a pharmacy
  const existingPharmacy = await Pharmacy.findOne({ owner: req.user._id });
  if (existingPharmacy) {
    return res.status(400).json({
      success: false,
      message: 'User already owns a pharmacy'
    });
  }

  // Check if license number already exists
  const existingLicense = await Pharmacy.findOne({ license_number: req.body.license_number });
  if (existingLicense) {
    return res.status(400).json({
      success: false,
      message: 'Pharmacy with this license number already exists'
    });
  }

  const pharmacy = new Pharmacy({
    ...req.body,
    owner: req.user._id
  });

  await pharmacy.save();

  // Update user's pharmacy reference
  await User.findByIdAndUpdate(req.user._id, { pharmacy: pharmacy._id });

  const populatedPharmacy = await Pharmacy.findById(pharmacy._id).populate('owner', 'name email phone');

  res.status(201).json({
    success: true,
    message: 'Pharmacy created successfully',
    data: { pharmacy: populatedPharmacy }
  });
}));

// @route   GET /api/pharmacy/search
// @desc    Search pharmacies by location
// @access  Public
router.get('/search', searchLimiter, [
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
  
  query('pincode')
    .optional()
    .matches(/^[0-9]{6}$/)
    .withMessage('Please provide a valid 6-digit pincode'),

  query('street')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Street must be at least 2 characters'),

], handleValidationErrors, asyncHandler(async (req, res) => {
  const { lat, lng, radius = 10, city, pincode, street, limit = 20, page = 1 } = req.query;

  // Custom validation: if one coordinate is provided, both must be provided
  if ((lat && !lng) || (!lat && lng)) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: [{
        type: 'field',
        msg: 'Both latitude and longitude must be provided together',
        path: 'coordinates',
        location: 'query'
      }]
    });
  }

  let searchQuery = { isActive: true };
  let sort = {};

  if (lat && lng) {
    // Location-based search
    const pharmacies = await Pharmacy.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          distanceField: 'distance',
          maxDistance: radius * 1000, // Convert km to meters
          spherical: true,
          query: { isActive: true }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'owner',
          foreignField: '_id',
          as: 'owner'
        }
      },
      {
        $unwind: '$owner'
      },
      {
        $project: {
          name: 1,
          license_number: 1,
          location: 1,
          contact: 1,
          operating_hours: 1,
          services: 1,
          rating: 1,
          distance: 1,
          'owner.name': 1,
          'owner.email': 1
        }
      },
      {
        $skip: (page - 1) * limit
      },
      {
        $limit: parseInt(limit)
      }
    ]);

    return res.status(200).json({
      success: true,
      data: {
        pharmacies,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: pharmacies.length
        }
      }
    });
  }

  // Text-based search
  if (city) {
    searchQuery['location.address.city'] = new RegExp(city, 'i');
  }

  if (pincode) {
    searchQuery['location.address.pincode'] = pincode;
  }

  if (street) {
    searchQuery['location.address.street'] = new RegExp(street, 'i');
  }

  const skip = (page - 1) * limit;
  const pharmacies = await Pharmacy.find(searchQuery)
    .populate('owner', 'name email')
    .select('name license_number location contact operating_hours services rating')
    .sort(sort)
    .limit(parseInt(limit))
    .skip(skip);

  const total = await Pharmacy.countDocuments(searchQuery);

  res.status(200).json({
    success: true,
    data: {
      pharmacies,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
}));

// @route   GET /api/pharmacy/:id
// @desc    Get pharmacy by ID
// @access  Public
router.get('/:id', asyncHandler(async (req, res) => {
  const pharmacy = await Pharmacy.findById(req.params.id)
    .populate('owner', 'name email phone')
    .populate({
      path: 'inventory',
      select: 'name brand category stock.current_quantity selling_price isAvailable',
      match: { isActive: true }
    });

  if (!pharmacy) {
    return res.status(404).json({
      success: false,
      message: 'Pharmacy not found'
    });
  }

  res.status(200).json({
    success: true,
    data: { pharmacy }
  });
}));

// @route   PUT /api/pharmacy/:id
// @desc    Update pharmacy
// @access  Private (Pharmacy Owner or Admin)
router.put('/:id', authenticateToken, validatePharmacy, handleValidationErrors, asyncHandler(async (req, res) => {
  const pharmacy = await Pharmacy.findById(req.params.id);

  if (!pharmacy) {
    return res.status(404).json({
      success: false,
      message: 'Pharmacy not found'
    });
  }

  // Check if user owns this pharmacy or is admin
  if (pharmacy.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this pharmacy'
    });
  }

  // Check if license number is being updated and if it already exists
  if (req.body.license_number && req.body.license_number !== pharmacy.license_number) {
    const existingLicense = await Pharmacy.findOne({ 
      license_number: req.body.license_number,
      _id: { $ne: pharmacy._id }
    });
    
    if (existingLicense) {
      return res.status(400).json({
        success: false,
        message: 'Pharmacy with this license number already exists'
      });
    }
  }

  const updatedPharmacy = await Pharmacy.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('owner', 'name email phone');

  res.status(200).json({
    success: true,
    message: 'Pharmacy updated successfully',
    data: { pharmacy: updatedPharmacy }
  });
}));

// @route   DELETE /api/pharmacy/:id
// @desc    Delete pharmacy
// @access  Private (Pharmacy Owner or Admin)
router.delete('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const pharmacy = await Pharmacy.findById(req.params.id);

  if (!pharmacy) {
    return res.status(404).json({
      success: false,
      message: 'Pharmacy not found'
    });
  }

  // Check if user owns this pharmacy or is admin
  if (pharmacy.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this pharmacy'
    });
  }

  // Soft delete - mark as inactive
  pharmacy.isActive = false;
  await pharmacy.save();

  // Also deactivate all medicines in this pharmacy
  await Medicine.updateMany(
    { pharmacy: pharmacy._id },
    { isActive: false }
  );

  res.status(200).json({
    success: true,
    message: 'Pharmacy deleted successfully'
  });
}));

// @route   GET /api/pharmacy/:id/inventory
// @desc    Get pharmacy inventory
// @access  Public
router.get('/:id/inventory', [
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Search term must be at least 1 character'),
  
  query('category')
    .optional()
    .isIn(['tablet', 'capsule', 'syrup', 'injection', 'cream', 'ointment', 'drops', 'spray', 'inhaler', 'powder', 'gel', 'lotion', 'other'])
    .withMessage('Invalid category'),
  
  query('available_only')
    .optional()
    .isBoolean()
    .withMessage('available_only must be a boolean')
], handleValidationErrors, asyncHandler(async (req, res) => {
  const { search, category, available_only, limit = 20, page = 1 } = req.query;

  const pharmacy = await Pharmacy.findById(req.params.id);
  if (!pharmacy) {
    return res.status(404).json({
      success: false,
      message: 'Pharmacy not found'
    });
  }

  let query = { pharmacy: req.params.id, isActive: true };

  if (search) {
    query.$text = { $search: search };
  }

  if (category) {
    query.category = category;
  }

  if (available_only === 'true') {
    query['stock.current_quantity'] = { $gt: 0 };
    query.expiry_date = { $gt: new Date() };
  }

  const skip = (page - 1) * limit;
  const medicines = await Medicine.find(query)
    .select('name brand category composition strength pack_size selling_price stock expiry_date prescription_required')
    .sort(search ? { score: { $meta: 'textScore' } } : { name: 1 })
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

// @route   GET /api/pharmacy/my/dashboard
// @desc    Get pharmacy owner dashboard data
// @access  Private (Pharmacy Owner)
router.get('/my/dashboard', authenticateToken, isPharmacyOwner, asyncHandler(async (req, res) => {
  const pharmacy = await Pharmacy.findOne({ owner: req.user._id });
  
  if (!pharmacy) {
    return res.status(404).json({
      success: false,
      message: 'No pharmacy found for this user'
    });
  }

  // Get inventory statistics
  const totalMedicines = await Medicine.countDocuments({ 
    pharmacy: pharmacy._id, 
    isActive: true 
  });

  const lowStockMedicines = await Medicine.countDocuments({
    pharmacy: pharmacy._id,
    isActive: true,
    $expr: { $lte: ['$stock.current_quantity', '$stock.minimum_threshold'] }
  });

  const expiredMedicines = await Medicine.countDocuments({
    pharmacy: pharmacy._id,
    isActive: true,
    expiry_date: { $lte: new Date() }
  });

  const expiringSoon = await Medicine.countDocuments({
    pharmacy: pharmacy._id,
    isActive: true,
    expiry_date: { 
      $gte: new Date(),
      $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    }
  });

  // Get recent low stock medicines
  const lowStockItems = await Medicine.find({
    pharmacy: pharmacy._id,
    isActive: true,
    $expr: { $lte: ['$stock.current_quantity', '$stock.minimum_threshold'] }
  })
  .select('name brand stock.current_quantity stock.minimum_threshold')
  .limit(10);

  // Get medicines expiring soon
  const expiringSoonItems = await Medicine.find({
    pharmacy: pharmacy._id,
    isActive: true,
    expiry_date: { 
      $gte: new Date(),
      $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
  })
  .select('name brand expiry_date')
  .sort({ expiry_date: 1 })
  .limit(10);

  res.status(200).json({
    success: true,
    data: {
      pharmacy,
      statistics: {
        totalMedicines,
        lowStockMedicines,
        expiredMedicines,
        expiringSoon
      },
      alerts: {
        lowStockItems,
        expiringSoonItems
      }
    }
  });
}));

// @route   GET /api/pharmacy/:id/find-medicine
// @desc    Find nearest pharmacy with specific medicine if not available in current pharmacy
// @access  Public
router.get('/:id/find-medicine', [
  query('medicine')
    .notEmpty()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Medicine name must be at least 2 characters'),
  
  query('radius')
    .optional()
    .isFloat({ min: 0.1, max: 50 })
    .withMessage('Radius must be between 0.1 and 50 km')
], handleValidationErrors, asyncHandler(async (req, res) => {
  const { medicine, radius = 10 } = req.query;
  const pharmacyId = req.params.id;

  // First, check if the medicine is available in the current pharmacy
  const currentPharmacy = await Pharmacy.findById(pharmacyId);
  if (!currentPharmacy) {
    return res.status(404).json({
      success: false,
      message: 'Pharmacy not found'
    });
  }

  // Check if medicine exists in current pharmacy
  const medicineInCurrentPharmacy = await Medicine.findOne({
    pharmacy: pharmacyId,
    isActive: true,
    $text: { $search: medicine },
    'stock.current_quantity': { $gt: 0 },
    expiry_date: { $gt: new Date() }
  });

  if (medicineInCurrentPharmacy) {
    return res.status(200).json({
      success: true,
      message: 'Medicine available in current pharmacy',
      data: {
        available: true,
        pharmacy: {
          _id: currentPharmacy._id,
          name: currentPharmacy.name,
          location: currentPharmacy.location,
          contact: currentPharmacy.contact
        },
        medicine: {
          _id: medicineInCurrentPharmacy._id,
          name: medicineInCurrentPharmacy.name,
          brand: medicineInCurrentPharmacy.brand,
          selling_price: medicineInCurrentPharmacy.selling_price,
          stock: medicineInCurrentPharmacy.stock,
          prescription_required: medicineInCurrentPharmacy.prescription_required
        },
        distance: 0
      }
    });
  }

  // If not available, find nearest pharmacies with the medicine
  const pharmaciesWithMedicine = await Pharmacy.aggregate([
    // First, find pharmacies that have the medicine
    {
      $lookup: {
        from: 'medicines',
        let: { pharmacyId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$pharmacy', '$$pharmacyId'] },
              isActive: true,
              $text: { $search: medicine },
              'stock.current_quantity': { $gt: 0 },
              expiry_date: { $gt: new Date() }
            }
          },
          {
            $project: {
              _id: 1,
              name: 1,
              brand: 1,
              selling_price: 1,
              stock: 1,
              prescription_required: 1,
              score: { $meta: 'textScore' }
            }
          },
          {
            $sort: { score: { $meta: 'textScore' } }
          },
          {
            $limit: 1
          }
        ],
        as: 'available_medicines'
      }
    },
    {
      $match: {
        _id: { $ne: currentPharmacy._id }, // Exclude current pharmacy
        isActive: true,
        'available_medicines.0': { $exists: true } // Only include pharmacies that have the medicine
      }
    }
  ]);

  // Calculate distances and filter by radius
  const currentLat = currentPharmacy.location.coordinates[1];
  const currentLng = currentPharmacy.location.coordinates[0];

  const pharmaciesWithDistance = pharmaciesWithMedicine
    .map(pharmacy => {
      const pharmacyLat = pharmacy.location.coordinates[1];
      const pharmacyLng = pharmacy.location.coordinates[0];
      
      // Haversine formula to calculate distance
      const R = 6371; // Earth's radius in km
      const dLat = (pharmacyLat - currentLat) * Math.PI / 180;
      const dLng = (pharmacyLng - currentLng) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(currentLat * Math.PI / 180) * Math.cos(pharmacyLat * Math.PI / 180) *
        Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;
      
      return {
        ...pharmacy,
        distance: distance
      };
    })
    .filter(pharmacy => pharmacy.distance <= parseFloat(radius))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 5); // Take top 5 nearest

  if (pharmaciesWithDistance.length === 0) {
    return res.status(404).json({
      success: false,
      message: `Medicine "${medicine}" not found in any pharmacy within ${radius}km radius`,
      data: {
        available: false,
        searched_medicine: medicine,
        search_radius: radius,
        current_pharmacy: {
          _id: currentPharmacy._id,
          name: currentPharmacy.name,
          location: currentPharmacy.location
        }
      }
    });
  }

  // Return the nearest pharmacy with the medicine
  const nearestPharmacy = pharmaciesWithDistance[0];

  res.status(200).json({
    success: true,
    message: `Medicine found in nearest pharmacy`,
    data: {
      available: false,
      searched_medicine: medicine,
      current_pharmacy: {
        _id: currentPharmacy._id,
        name: currentPharmacy.name,
        location: currentPharmacy.location
      },
      nearest_pharmacy: {
        _id: nearestPharmacy._id,
        name: nearestPharmacy.name,
        location: nearestPharmacy.location,
        contact: nearestPharmacy.contact,
        operating_hours: nearestPharmacy.operating_hours,
        services: nearestPharmacy.services,
        rating: nearestPharmacy.rating,
        distance: Math.round(nearestPharmacy.distance * 100) / 100, // Round to 2 decimal places
        medicine: nearestPharmacy.available_medicines[0]
      },
      alternatives: pharmaciesWithDistance.slice(1, 3).map(pharmacy => ({
        _id: pharmacy._id,
        name: pharmacy.name,
        distance: Math.round(pharmacy.distance * 100) / 100,
        medicine: pharmacy.available_medicines[0]
      }))
    }
  });
}));

export default router;