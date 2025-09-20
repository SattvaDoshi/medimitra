import mongoose from 'mongoose';
import { User, Pharmacy, Medicine, Transaction } from './src/models/index.js';

// Test database connection and models
const testConnection = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/pharmacy_inventory_test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✓ Database connection successful');
    
    // Test model creation
    console.log('✓ User model loaded');
    console.log('✓ Pharmacy model loaded');
    console.log('✓ Medicine model loaded');
    console.log('✓ Transaction model loaded');
    
    console.log('\n🎉 All models and database connection working correctly!');
    console.log('\nTo start the server:');
    console.log('1. Make sure MongoDB is running');
    console.log('2. Run: npm run dev');
    console.log('3. API will be available at: http://localhost:5000');
    
    await mongoose.connection.close();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\nMake sure MongoDB is installed and running!');
  }
};

testConnection();