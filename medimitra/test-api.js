// Simple test script to verify backend API responses
import { medicineApi } from './src/services/medicineApi.js';

const testApi = async () => {
  try {
    console.log('Testing Medicine API...');
    
    // Test 1: Get all medicines
    console.log('\n1. Testing GET /api/medicine');
    const allMedicines = await medicineApi.getAll({ available_only: true, limit: 5 });
    console.log('Response:', JSON.stringify(allMedicines, null, 2));
    
    // Test 2: Search medicines
    console.log('\n2. Testing GET /api/medicine/search');
    const searchResults = await medicineApi.search({ q: 'paracetamol', limit: 5 });
    console.log('Search Response:', JSON.stringify(searchResults, null, 2));
    
  } catch (error) {
    console.error('API Test Failed:', error);
  }
};

testApi();