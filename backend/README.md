# Pharmacy Inventory Management Backend

A comprehensive Node.js backend API for pharmacy inventory management with location-based services.

## Features

- **User Management**: Registration and authentication for customers and pharmacy owners
- **Location-Based Services**: Find pharmacies near user location
- **Inventory Management**: Complete medicine inventory tracking
- **Stock Management**: Automatic stock updates on medicine sales
- **Transaction Processing**: Handle sales, purchases, returns, and adjustments
- **Real-time Updates**: Automatic stock deduction on medicine issuance
- **Search & Filtering**: Advanced search for medicines and pharmacies
- **Reports & Analytics**: Transaction summaries and inventory reports

## Tech Stack

- **Runtime**: Node.js with ES6 modules
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express Validator
- **Security**: Helmet, CORS, Rate Limiting
- **Logging**: Morgan

## API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /register` - Register new user (customer/pharmacy owner)
- `POST /login` - User login
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile
- `POST /change-password` - Change user password

### Pharmacy Routes (`/api/pharmacy`)
- `POST /` - Create new pharmacy
- `GET /search` - Search pharmacies by location
- `GET /:id` - Get pharmacy details
- `PUT /:id` - Update pharmacy
- `DELETE /:id` - Delete pharmacy
- `GET /:id/inventory` - Get pharmacy inventory
- `GET /my/dashboard` - Pharmacy owner dashboard

### Medicine Routes (`/api/medicine`)
- `POST /` - Add new medicine
- `GET /search` - Search medicines across pharmacies
- `GET /:id` - Get medicine details
- `PUT /:id` - Update medicine
- `DELETE /:id` - Delete medicine
- `PATCH /:id/stock` - Update medicine stock
- `GET /pharmacy/:pharmacyId` - Get medicines for specific pharmacy
- `GET /my/inventory` - Get pharmacy owner's inventory

### Transaction Routes (`/api/transaction`)
- `POST /` - Create new transaction
- `PATCH /:id/complete` - Complete transaction
- `GET /` - Get transactions for pharmacy
- `GET /:id` - Get transaction details
- `PATCH /:id/cancel` - Cancel transaction
- `POST /sale` - Quick sale transaction
- `GET /reports/summary` - Transaction summary report

## Installation & Setup

1. **Clone and Navigate**
   ```bash
   cd backend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/pharmacy_inventory
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=7d
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Run the Server**
   ```bash
   # Development mode with nodemon
   npm run dev
   
   # Production mode
   npm start
   ```

## Database Models

### User Model
- Personal information (name, email, phone)
- Location data (coordinates and address)
- Role-based access (customer, pharmacy_owner, admin)
- Password encryption with bcrypt

### Pharmacy Model
- Business information and licensing
- Location with geospatial indexing
- Operating hours and services
- Inventory references

### Medicine Model
- Complete medicine details (name, brand, composition)
- Stock management with threshold alerts
- Expiry date tracking
- Price management (MRP and selling price)

### Transaction Model
- Transaction tracking for all operations
- Automatic stock updates on completion
- Payment processing and status
- Comprehensive reporting data

## Key Features Explained

### Location-Based Search
- Uses MongoDB geospatial queries (2dsphere indexes)
- Supports radius-based pharmacy search
- Distance calculation and sorting

### Automatic Stock Management
- Real-time stock updates on medicine sales
- Low stock alerts and notifications
- Expiry date monitoring

### Security Features
- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting for API endpoints
- CORS protection

### Search Functionality
- Text search across medicine names, brands, and compositions
- Category-based filtering
- Availability and stock status filtering

## API Usage Examples

### Register Pharmacy Owner
```bash
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@pharmacy.com",
  "password": "password123",
  "phone": "9876543210",
  "role": "pharmacy_owner",
  "location": {
    "coordinates": [77.5946, 12.9716],
    "address": {
      "street": "123 Main St",
      "city": "Bangalore",
      "state": "Karnataka",
      "pincode": "560001"
    }
  },
  "pharmacyDetails": {
    "name": "Health Plus Pharmacy",
    "license_number": "KA-BLR-2023-001",
    "contact": {
      "phone": "9876543210",
      "email": "contact@healthplus.com"
    }
  }
}
```

### Search Pharmacies Near Location
```bash
GET /api/pharmacy/search?lat=12.9716&lng=77.5946&radius=5
```

### Add Medicine to Inventory
```bash
POST /api/medicine
Authorization: Bearer <jwt_token>
{
  "name": "Paracetamol",
  "brand": "Dolo",
  "composition": "Paracetamol 650mg",
  "category": "tablet",
  "dosage_form": "Tablet",
  "strength": "650mg",
  "pack_size": "15 tablets",
  "manufacturer": "Micro Labs",
  "batch_number": "DL2023001",
  "manufacturing_date": "2023-01-15",
  "expiry_date": "2025-01-15",
  "mrp": 25.00,
  "selling_price": 23.00,
  "stock": {
    "current_quantity": 100,
    "minimum_threshold": 20,
    "unit": "strips"
  }
}
```

### Quick Sale Transaction
```bash
POST /api/transaction/sale
Authorization: Bearer <jwt_token>
{
  "items": [
    {
      "medicine_id": "64a1b2c3d4e5f6789abcdef0",
      "quantity": 2
    }
  ],
  "payment_method": "cash",
  "customer_phone": "9876543210"
}
```

## Error Handling

All API endpoints return consistent error responses:
```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error array if validation fails"]
}
```

## Success Responses

All successful API calls return:
```json
{
  "success": true,
  "message": "Success message",
  "data": {
    // Response data
  }
}
```

## Rate Limiting

- General API: 100 requests per 15 minutes
- Authentication: 5 requests per 15 minutes  
- Search: 30 requests per minute

## Development Notes

- All routes use ES6 modules
- Comprehensive input validation
- Mongoose middleware for automatic operations
- Geospatial indexing for location queries
- Text search indexing for medicine search
- Automatic stock updates via transaction hooks

## Contributing

1. Follow ES6 module syntax
2. Use async/await for asynchronous operations
3. Implement proper error handling
4. Add input validation for all routes
5. Write clear, descriptive commit messages