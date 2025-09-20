# Pharmacy Inventory API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 🔐 Authentication Endpoints

### Register User
**POST** `/auth/register`

Register a new user (customer or pharmacy owner).

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "9876543210",
  "role": "pharmacy_owner", // or "customer"
  "location": {
    "coordinates": [77.5946, 12.9716], // [longitude, latitude]
    "address": {
      "street": "123 Main Street",
      "city": "Bangalore",
      "state": "Karnataka",
      "pincode": "560001"
    }
  },
  "pharmacyDetails": { // Only for pharmacy_owner role
    "name": "Health Plus Pharmacy",
    "license_number": "KA-BLR-2023-001",
    "contact": {
      "phone": "9876543210",
      "email": "contact@healthplus.com"
    },
    "operating_hours": {
      "monday": { "open": "09:00", "close": "21:00" },
      "tuesday": { "open": "09:00", "close": "21:00" }
      // ... other days
    },
    "services": ["home_delivery", "24_hours", "online_ordering"]
  }
}
```

### Login User
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Get Profile
**GET** `/auth/profile`
*Requires authentication*

### Update Profile
**PUT** `/auth/profile`
*Requires authentication*

**Request Body:**
```json
{
  "name": "Updated Name",
  "phone": "9876543211",
  "location": {
    "coordinates": [77.5946, 12.9716],
    "address": {
      "street": "Updated Address",
      "city": "Bangalore",
      "state": "Karnataka",
      "pincode": "560002"
    }
  }
}
```

---

## 🏥 Pharmacy Endpoints

### Search Pharmacies by Location
**GET** `/pharmacy/search`

**Query Parameters:**
- `lat` (required): Latitude
- `lng` (required): Longitude  
- `radius` (optional): Search radius in km (default: 10)
- `city` (optional): City name
- `pincode` (optional): 6-digit pincode
- `limit` (optional): Number of results (default: 20)
- `page` (optional): Page number (default: 1)

**Example:**
```
GET /pharmacy/search?lat=12.9716&lng=77.5946&radius=5&limit=10
```

### Get Pharmacy Details
**GET** `/pharmacy/:id`

### Get Pharmacy Inventory
**GET** `/pharmacy/:id/inventory`

**Query Parameters:**
- `search` (optional): Search term
- `category` (optional): Medicine category
- `available_only` (optional): true/false
- `limit` (optional): Number of results
- `page` (optional): Page number

### Create Pharmacy
**POST** `/pharmacy`
*Requires pharmacy owner authentication*

**Request Body:**
```json
{
  "name": "Health Plus Pharmacy",
  "license_number": "KA-BLR-2023-001",
  "location": {
    "coordinates": [77.5946, 12.9716],
    "address": {
      "street": "123 Main Street",
      "city": "Bangalore",
      "state": "Karnataka",
      "pincode": "560001"
    }
  },
  "contact": {
    "phone": "9876543210",
    "email": "contact@healthplus.com"
  },
  "operating_hours": {
    "monday": { "open": "09:00", "close": "21:00" },
    "tuesday": { "open": "09:00", "close": "21:00" }
  },
  "services": ["home_delivery", "online_ordering"]
}
```

### Update Pharmacy
**PUT** `/pharmacy/:id`
*Requires pharmacy owner authentication*

### Delete Pharmacy
**DELETE** `/pharmacy/:id`
*Requires pharmacy owner authentication*

### Pharmacy Dashboard
**GET** `/pharmacy/my/dashboard`
*Requires pharmacy owner authentication*

Returns inventory statistics, low stock alerts, and expiring medicines.

---

## 💊 Medicine Endpoints

### Search Medicines
**GET** `/medicine/search`

**Query Parameters:**
- `q` (required): Search query
- `lat` (optional): Latitude for location-based search
- `lng` (optional): Longitude for location-based search
- `radius` (optional): Search radius in km
- `city` (optional): City name
- `category` (optional): Medicine category
- `available_only` (optional): true/false (default: true)
- `limit` (optional): Number of results
- `page` (optional): Page number

**Example:**
```
GET /medicine/search?q=paracetamol&lat=12.9716&lng=77.5946&radius=10
```

### Get Medicine Details
**GET** `/medicine/:id`

### Add Medicine
**POST** `/medicine`
*Requires pharmacy owner authentication*

**Request Body:**
```json
{
  "name": "Paracetamol",
  "generic_name": "Acetaminophen",
  "brand": "Dolo",
  "composition": "Paracetamol 650mg",
  "category": "tablet",
  "dosage_form": "Tablet",
  "strength": "650mg",
  "pack_size": "15 tablets",
  "manufacturer": "Micro Labs",
  "batch_number": "DL2023001",
  "manufacturing_date": "2023-01-15T00:00:00.000Z",
  "expiry_date": "2025-01-15T00:00:00.000Z",
  "mrp": 25.00,
  "selling_price": 23.00,
  "stock": {
    "current_quantity": 100,
    "minimum_threshold": 20,
    "unit": "strips"
  },
  "prescription_required": false,
  "tags": ["pain relief", "fever"],
  "description": "Used for pain relief and fever reduction",
  "side_effects": ["Nausea", "Vomiting"],
  "storage_conditions": "Store in a cool, dry place"
}
```

### Update Medicine
**PUT** `/medicine/:id`
*Requires pharmacy owner authentication*

### Delete Medicine
**DELETE** `/medicine/:id`
*Requires pharmacy owner authentication*

### Update Medicine Stock
**PATCH** `/medicine/:id/stock`
*Requires pharmacy owner authentication*

**Request Body:**
```json
{
  "quantity": 50,
  "operation": "add" // or "subtract" or "set"
}
```

### Get Pharmacy Medicines
**GET** `/medicine/pharmacy/:pharmacyId`

### Get My Inventory
**GET** `/medicine/my/inventory`
*Requires pharmacy owner authentication*

**Query Parameters:**
- `category` (optional): Medicine category
- `status` (optional): all/available/low_stock/expired/expiring_soon
- `search` (optional): Search term
- `limit` (optional): Number of results
- `page` (optional): Page number

---

## 💰 Transaction Endpoints

### Create Transaction
**POST** `/transaction`
*Requires pharmacy owner authentication*

**Request Body:**
```json
{
  "type": "sale", // sale/purchase/return/adjustment/damage/expiry
  "items": [
    {
      "medicine": "64a1b2c3d4e5f6789abcdef0",
      "quantity": 2,
      "unit_price": 23.00
    }
  ],
  "customer": "64a1b2c3d4e5f6789abcdef1", // optional
  "payment": {
    "method": "cash", // cash/card/upi/online/insurance
    "status": "pending"
  },
  "prescription": { // optional
    "number": "RX123456",
    "doctor_name": "Dr. Smith",
    "hospital_name": "City Hospital",
    "date": "2023-09-20T00:00:00.000Z"
  },
  "totals": {
    "discount": 0,
    "tax": 0
  },
  "notes": "Customer paid in cash"
}
```

### Complete Transaction
**PATCH** `/transaction/:id/complete`
*Requires pharmacy owner authentication*

This automatically updates medicine stock.

### Get Transactions
**GET** `/transaction`
*Requires pharmacy owner authentication*

**Query Parameters:**
- `type` (optional): Transaction type
- `status` (optional): Transaction status
- `from_date` (optional): Start date (ISO format)
- `to_date` (optional): End date (ISO format)
- `limit` (optional): Number of results
- `page` (optional): Page number

### Get Transaction Details
**GET** `/transaction/:id`
*Requires authentication*

### Cancel Transaction
**PATCH** `/transaction/:id/cancel`
*Requires pharmacy owner authentication*

### Quick Sale
**POST** `/transaction/sale`
*Requires pharmacy owner authentication*

**Request Body:**
```json
{
  "items": [
    {
      "medicine_id": "64a1b2c3d4e5f6789abcdef0",
      "quantity": 2
    }
  ],
  "payment_method": "cash", // optional
  "customer_phone": "9876543210", // optional
  "notes": "Quick sale"
}
```

This creates and completes the transaction immediately, updating stock automatically.

### Transaction Reports
**GET** `/transaction/reports/summary`
*Requires pharmacy owner authentication*

**Query Parameters:**
- `period` (optional): today/week/month/year/custom
- `from_date` (optional): For custom period
- `to_date` (optional): For custom period

---

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error messages"] // For validation errors
}
```

### Pagination Response
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "pages": 5
    }
  }
}
```

---

## 🔍 Medicine Categories
- `tablet`
- `capsule`
- `syrup`
- `injection`
- `cream`
- `ointment`
- `drops`
- `spray`
- `inhaler`
- `powder`
- `gel`
- `lotion`
- `other`

## 📦 Stock Units
- `pieces`
- `bottles`
- `strips`
- `boxes`
- `vials`
- `tubes`

## 💳 Payment Methods
- `cash`
- `card`
- `upi`
- `online`
- `insurance`

## 🔐 User Roles
- `customer`
- `pharmacy_owner`
- `admin`

---

## 🚦 Rate Limits
- General API: 100 requests per 15 minutes
- Authentication: 5 requests per 15 minutes
- Search: 30 requests per minute

---

## 🧪 Testing the API

### 1. Start the Server
```bash
npm run dev
```

### 2. Health Check
```bash
GET http://localhost:5000/api/health
```

### 3. Register a Pharmacy Owner
```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Test Owner",
  "email": "owner@test.com",
  "password": "password123",
  "phone": "9876543210",
  "role": "pharmacy_owner",
  "location": {
    "coordinates": [77.5946, 12.9716],
    "address": {
      "street": "Test Street",
      "city": "Bangalore",
      "state": "Karnataka",
      "pincode": "560001"
    }
  },
  "pharmacyDetails": {
    "name": "Test Pharmacy",
    "license_number": "TEST123",
    "contact": {
      "phone": "9876543210",
      "email": "pharmacy@test.com"
    }
  }
}
```

### 4. Login and Get Token
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "owner@test.com",
  "password": "password123"
}
```

### 5. Add Medicine
```bash
POST http://localhost:5000/api/medicine
Authorization: Bearer <your_token>
Content-Type: application/json

{
  "name": "Test Medicine",
  "brand": "Test Brand",
  "composition": "Test Composition",
  "category": "tablet",
  "dosage_form": "Tablet",
  "strength": "500mg",
  "pack_size": "10 tablets",
  "manufacturer": "Test Manufacturer",
  "batch_number": "TEST001",
  "manufacturing_date": "2023-01-01",
  "expiry_date": "2025-01-01",
  "mrp": 100,
  "selling_price": 90,
  "stock": {
    "current_quantity": 100,
    "minimum_threshold": 10,
    "unit": "strips"
  }
}
```

### 6. Search Medicines
```bash
GET http://localhost:5000/api/medicine/search?q=test&lat=12.9716&lng=77.5946
```

---

## 🐛 Common Issues

### 1. MongoDB Connection Error
Make sure MongoDB is running:
```bash
# Windows
net start MongoDB

# macOS/Linux
brew services start mongodb-community
# or
sudo systemctl start mongod
```

### 2. JWT Token Expired
Get a new token by logging in again.

### 3. Validation Errors
Check the request body format and required fields.

### 4. CORS Issues
Make sure the frontend URL is correctly set in the `.env` file.