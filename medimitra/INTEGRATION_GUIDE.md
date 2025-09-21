# MediMitra Frontend-Backend Integration

This document explains how the MedicineFinder component integrates with the backend APIs.

## Backend API Endpoints Used

### Medicine API (`/api/medicine`)

1. **GET /api/medicine** - Get all medicines with pagination
   - Query params: `page`, `limit`, `category`, `available_only`

2. **GET /api/medicine/search** - Search medicines across pharmacies
   - Query params: `q` (search query), `lat`, `lng`, `radius`, `city`, `category`, `available_only`, `limit`, `page`

3. **GET /api/medicine/:id** - Get specific medicine details

4. **GET /api/medicine/pharmacy/:pharmacyId** - Get medicines for specific pharmacy

### Pharmacy API (`/api/pharmacy`)

1. **GET /api/pharmacy/search** - Search pharmacies by location
   - Query params: `lat`, `lng`, `radius`, `city`, `pincode`, `street`, `limit`, `page`

2. **GET /api/pharmacy/:id** - Get specific pharmacy details

## Frontend Integration Features

### 1. Medicine Search
- Real-time search with backend API
- Location-based search (uses user's GPS coordinates)
- Category filtering
- Stock availability filtering

### 2. Pharmacy Location Services
- Find nearby pharmacies using GPS
- Distance calculation and display
- Integration with Google Maps for directions

### 3. Data Display
- Dynamic medicine cards showing:
  - Medicine name, brand, composition, strength
  - Pricing (selling price, MRP)
  - Stock availability status
  - Pharmacy information
  - Distance from user (if location available)

### 4. Error Handling
- Loading states for all API calls
- Error messages for failed requests
- Graceful degradation when location is unavailable

### 5. User Experience
- Search on Enter key press
- Real-time availability status
- Google Maps integration for directions
- Responsive design with proper loading indicators

## API Response Structure

### Medicine Response
```json
{
  "success": true,
  "data": {
    "medicines": [
      {
        "_id": "medicine_id",
        "name": "Medicine Name",
        "brand": "Brand Name",
        "composition": "Active Ingredients",
        "strength": "500mg",
        "selling_price": 15.50,
        "mrp": 20.00,
        "stock": {
          "current_quantity": 100,
          "unit": "pieces"
        },
        "pharmacy": {
          "_id": "pharmacy_id",
          "name": "Pharmacy Name",
          "location": {
            "address": {
              "street": "Street Address",
              "city": "City",
              "state": "State",
              "pincode": "123456"
            }
          },
          "contact": {
            "phone": "1234567890",
            "email": "pharmacy@example.com"
          },
          "rating": 4.5
        },
        "distance": 2.5
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150
    }
  }
}
```

## Configuration

### Environment Variables
- `VITE_API_URL`: Backend API base URL (default: http://localhost:5000/api)

### Services Structure
```
src/services/
├── api.ts           # Axios instance with interceptors
├── medicineApi.ts   # Medicine-specific API calls
├── pharmacyApi.ts   # Pharmacy-specific API calls
└── index.ts         # Export all services
```

### Location Services
- GPS location detection
- Distance calculation
- Address formatting utilities

## Usage Example

```tsx
import { medicineApi, pharmacyApi } from '@/services';

// Search medicines
const searchMedicines = async (query: string) => {
  const response = await medicineApi.search({
    q: query,
    available_only: true,
    limit: 20
  });
  return response.data.medicines;
};

// Find nearby pharmacies
const findPharmacies = async (lat: number, lng: number) => {
  const response = await pharmacyApi.search({
    lat,
    lng,
    radius: 5
  });
  return response.data.pharmacies;
};
```

## Features Implemented

✅ Real-time medicine search integration
✅ Location-based pharmacy search
✅ Dynamic medicine display with backend data
✅ Stock availability status
✅ Error handling and loading states
✅ Google Maps integration for directions
✅ Responsive design
✅ TypeScript type safety

This integration provides a seamless experience between the frontend and backend, ensuring real-time data and accurate medicine/pharmacy information.