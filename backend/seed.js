import mongoose from 'mongoose';
import User from './src/models/User.js';
import Pharmacy from './src/models/Pharmacy.js';
import Medicine from './src/models/Medicine.js';
import dotenv from 'dotenv';

dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medimitra');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Pharmacy.deleteMany({});
    await Medicine.deleteMany({});
    console.log('Cleared existing data');

    // Sample Users (Pharmacy Owners)
    const users = [
      // Mumbai Pharmacy Owners
      {
        name: 'Rajesh Kumar',
        email: 'rajesh.pharmacy@gmail.com',
        password: 'password123',
        role: 'pharmacy_owner',
        phone: '9876543210',
        location: {
          type: 'Point',
          coordinates: [72.8296, 19.0596], // Bandra West coordinates
          address: {
            street: 'Hill Road',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400050',
            country: 'India'
          }
        },
        isVerified: true
      },
      {
        name: 'Priya Sharma',
        email: 'priya.meds@gmail.com',
        password: 'password123',
        role: 'pharmacy_owner',
        phone: '9876543211',
        location: {
          type: 'Point',
          coordinates: [72.8296, 19.0596], // Bandra West coordinates
          address: {
            street: 'Linking Road',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400050',
            country: 'India'
          }
        },
        isVerified: true
      },
      {
        name: 'Amit Singh',
        email: 'amit.healthcare@gmail.com',
        password: 'password123',
        role: 'pharmacy_owner',
        phone: '9876543212',
        location: {
          type: 'Point',
          coordinates: [72.8577, 19.1197], // Andheri coordinates
          address: {
            street: 'SV Road',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400058',
            country: 'India'
          }
        },
        isVerified: true
      },
      {
        name: 'Sunita Patel',
        email: 'sunita.pharma@gmail.com',
        password: 'password123',
        role: 'pharmacy_owner',
        phone: '9876543213',
        location: {
          type: 'Point',
          coordinates: [72.8577, 19.1197], // Andheri coordinates
          address: {
            street: 'Andheri East Main Road',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400069',
            country: 'India'
          }
        },
        isVerified: true
      },
      {
        name: 'Vikram Rao',
        email: 'vikram.medical@gmail.com',
        password: 'password123',
        role: 'pharmacy_owner',
        phone: '9876543214',
        location: {
          type: 'Point',
          coordinates: [72.8577, 19.1197], // Andheri coordinates
          address: {
            street: 'J.B. Nagar',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400059',
            country: 'India'
          }
        },
        isVerified: true
      },
      // Delhi Pharmacy Owners
      {
        name: 'Ravi Gupta',
        email: 'ravi.delhi@gmail.com',
        password: 'password123',
        role: 'pharmacy_owner',
        phone: '9876543215',
        location: {
          type: 'Point',
          coordinates: [77.1025, 28.7041], // Delhi coordinates
          address: {
            street: 'Karol Bagh',
            city: 'New Delhi',
            state: 'Delhi',
            pincode: '110005',
            country: 'India'
          }
        },
        isVerified: true
      },
      {
        name: 'Meera Jain',
        email: 'meera.health@gmail.com',
        password: 'password123',
        role: 'pharmacy_owner',
        phone: '9876543216',
        location: {
          type: 'Point',
          coordinates: [77.1025, 28.7041], // Delhi coordinates
          address: {
            street: 'Lajpat Nagar',
            city: 'New Delhi',
            state: 'Delhi',
            pincode: '110024',
            country: 'India'
          }
        },
        isVerified: true
      },
      {
        name: 'Suresh Verma',
        email: 'suresh.meds@gmail.com',
        password: 'password123',
        role: 'pharmacy_owner',
        phone: '9876543217',
        location: {
          type: 'Point',
          coordinates: [77.1025, 28.7041], // Delhi coordinates
          address: {
            street: 'Rajouri Garden',
            city: 'New Delhi',
            state: 'Delhi',
            pincode: '110027',
            country: 'India'
          }
        },
        isVerified: true
      }
    ];

    const createdUsers = await User.insertMany(users);
    console.log('Created users:', createdUsers.length);

    // Sample Pharmacies
    const pharmacies = [
      // Mumbai Pharmacies - Bandra West (2)
      {
        name: 'MediCare Pharmacy',
        owner: createdUsers[0]._id,
        license_number: 'MHMC2024001',
        location: {
          type: 'Point',
          coordinates: [72.8296, 19.0596], // Bandra West
          address: {
            street: 'Hill Road, Shop No. 15',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400050',
            country: 'India'
          }
        },
        contact: {
          phone: '2223456789',
          email: 'contact@medicare.in'
        },
        operating_hours: {
          monday: { open: '09:00', close: '21:00' },
          tuesday: { open: '09:00', close: '21:00' },
          wednesday: { open: '09:00', close: '21:00' },
          thursday: { open: '09:00', close: '21:00' },
          friday: { open: '09:00', close: '21:00' },
          saturday: { open: '09:00', close: '21:00' },
          sunday: { open: '10:00', close: '18:00' }
        },
        services: ['home_delivery', '24_hours', 'online_ordering', 'prescription_service'],
        rating: { average: 4.5, count: 125 },
        isActive: true,
        isVerified: true
      },
      {
        name: 'HealthPlus Medical Store',
        owner: createdUsers[1]._id,
        license_number: 'MHHP2024002',
        location: {
          type: 'Point',
          coordinates: [72.8296, 19.0596], // Bandra West
          address: {
            street: 'Linking Road, Plot No. 45',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400050',
            country: 'India'
          }
        },
        contact: {
          phone: '2224567890',
          email: 'info@healthplus.in'
        },
        operating_hours: {
          monday: { open: '08:00', close: '22:00' },
          tuesday: { open: '08:00', close: '22:00' },
          wednesday: { open: '08:00', close: '22:00' },
          thursday: { open: '08:00', close: '22:00' },
          friday: { open: '08:00', close: '22:00' },
          saturday: { open: '08:00', close: '22:00' },
          sunday: { open: '09:00', close: '20:00' }
        },
        services: ['home_delivery', 'online_ordering', 'prescription_service', 'consultation'],
        rating: { average: 4.2, count: 89 },
        isActive: true,
        isVerified: true
      },
      // Mumbai Pharmacies - Andheri (3)
      {
        name: 'Wellness Pharmacy',
        owner: createdUsers[2]._id,
        license_number: 'MHWP2024003',
        location: {
          type: 'Point',
          coordinates: [72.8577, 19.1197], // Andheri
          address: {
            street: 'SV Road, Sector V',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400058',
            country: 'India'
          }
        },
        contact: {
          phone: '2225678901',
          email: 'support@wellnesspharma.in'
        },
        operating_hours: {
          monday: { open: '09:30', close: '20:30' },
          tuesday: { open: '09:30', close: '20:30' },
          wednesday: { open: '09:30', close: '20:30' },
          thursday: { open: '09:30', close: '20:30' },
          friday: { open: '09:30', close: '20:30' },
          saturday: { open: '09:30', close: '20:30' },
          sunday: { open: '10:00', close: '17:00' }
        },
        services: ['home_delivery', 'prescription_service'],
        rating: { average: 4.0, count: 67 },
        isActive: true,
        isVerified: true
      },
      {
        name: 'Apollo Pharmacy',
        owner: createdUsers[3]._id,
        license_number: 'MHAP2024004',
        location: {
          type: 'Point',
          coordinates: [72.8577, 19.1197], // Andheri
          address: {
            street: 'Andheri East Main Road, No. 123',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400069',
            country: 'India'
          }
        },
        contact: {
          phone: '2226789012',
          email: 'andheri@apollopharmacy.in'
        },
        operating_hours: {
          monday: { open: '08:30', close: '21:30' },
          tuesday: { open: '08:30', close: '21:30' },
          wednesday: { open: '08:30', close: '21:30' },
          thursday: { open: '08:30', close: '21:30' },
          friday: { open: '08:30', close: '21:30' },
          saturday: { open: '08:30', close: '21:30' },
          sunday: { open: '09:00', close: '19:00' }
        },
        services: ['home_delivery', '24_hours', 'online_ordering', 'prescription_service', 'consultation'],
        rating: { average: 4.7, count: 203 },
        isActive: true,
        isVerified: true
      },
      {
        name: 'MedLife Pharmacy',
        owner: createdUsers[4]._id,
        license_number: 'MHML2024005',
        location: {
          type: 'Point',
          coordinates: [72.8577, 19.1197], // Andheri
          address: {
            street: 'J.B. Nagar, Road No. 12',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400059',
            country: 'India'
          }
        },
        contact: {
          phone: '2227890123',
          email: 'contact@medlife.in'
        },
        operating_hours: {
          monday: { open: '09:00', close: '22:00' },
          tuesday: { open: '09:00', close: '22:00' },
          wednesday: { open: '09:00', close: '22:00' },
          thursday: { open: '09:00', close: '22:00' },
          friday: { open: '09:00', close: '22:00' },
          saturday: { open: '09:00', close: '22:00' },
          sunday: { open: '10:00', close: '20:00' }
        },
        services: ['home_delivery', 'online_ordering', 'prescription_service'],
        rating: { average: 4.3, count: 156 },
        isActive: true,
        isVerified: true
      },
      // Delhi Pharmacies (3)
      {
        name: 'Delhi Health Pharmacy',
        owner: createdUsers[5]._id,
        license_number: 'DLHP2024006',
        location: {
          type: 'Point',
          coordinates: [77.1025, 28.7041], // Delhi
          address: {
            street: 'Karol Bagh Main Market',
            city: 'New Delhi',
            state: 'Delhi',
            pincode: '110005',
            country: 'India'
          }
        },
        contact: {
          phone: '1123456789',
          email: 'contact@delhihealth.in'
        },
        operating_hours: {
          monday: { open: '09:00', close: '21:00' },
          tuesday: { open: '09:00', close: '21:00' },
          wednesday: { open: '09:00', close: '21:00' },
          thursday: { open: '09:00', close: '21:00' },
          friday: { open: '09:00', close: '21:00' },
          saturday: { open: '09:00', close: '21:00' },
          sunday: { open: '10:00', close: '18:00' }
        },
        services: ['home_delivery', 'online_ordering', 'prescription_service'],
        rating: { average: 4.4, count: 98 },
        isActive: true,
        isVerified: true
      },
      {
        name: 'Lajpat Medical Store',
        owner: createdUsers[6]._id,
        license_number: 'DLLM2024007',
        location: {
          type: 'Point',
          coordinates: [77.1025, 28.7041], // Delhi
          address: {
            street: 'Lajpat Nagar Central Market',
            city: 'New Delhi',
            state: 'Delhi',
            pincode: '110024',
            country: 'India'
          }
        },
        contact: {
          phone: '1124567890',
          email: 'info@lajpatmedical.in'
        },
        operating_hours: {
          monday: { open: '08:30', close: '20:30' },
          tuesday: { open: '08:30', close: '20:30' },
          wednesday: { open: '08:30', close: '20:30' },
          thursday: { open: '08:30', close: '20:30' },
          friday: { open: '08:30', close: '20:30' },
          saturday: { open: '08:30', close: '20:30' },
          sunday: { open: '09:00', close: '19:00' }
        },
        services: ['home_delivery', 'prescription_service', 'consultation'],
        rating: { average: 4.1, count: 76 },
        isActive: true,
        isVerified: true
      },
      {
        name: 'Rajouri Pharmacy',
        owner: createdUsers[7]._id,
        license_number: 'DLRP2024008',
        location: {
          type: 'Point',
          coordinates: [77.1025, 28.7041], // Delhi
          address: {
            street: 'Rajouri Garden Ring Road',
            city: 'New Delhi',
            state: 'Delhi',
            pincode: '110027',
            country: 'India'
          }
        },
        contact: {
          phone: '1125678901',
          email: 'support@rajouripharma.in'
        },
        operating_hours: {
          monday: { open: '09:00', close: '22:00' },
          tuesday: { open: '09:00', close: '22:00' },
          wednesday: { open: '09:00', close: '22:00' },
          thursday: { open: '09:00', close: '22:00' },
          friday: { open: '09:00', close: '22:00' },
          saturday: { open: '09:00', close: '22:00' },
          sunday: { open: '10:00', close: '20:00' }
        },
        services: ['home_delivery', '24_hours', 'online_ordering', 'prescription_service'],
        rating: { average: 4.6, count: 142 },
        isActive: true,
        isVerified: true
      }
    ];

    const createdPharmacies = await Pharmacy.insertMany(pharmacies);
    console.log('Created pharmacies:', createdPharmacies.length);

    // Update users with pharmacy references
    for (let i = 0; i < createdUsers.length; i++) {
      await User.findByIdAndUpdate(createdUsers[i]._id, {
        pharmacy: createdPharmacies[i]._id
      });
    }

    // Sample Medicines
    const medicines = [
      // Mumbai Bandra West Pharmacy 1 Medicines
      {
        name: 'Paracetamol',
        generic_name: 'Acetaminophen',
        brand: 'Crocin',
        composition: 'Paracetamol 500mg',
        category: 'tablet',
        dosage_form: 'Tablet',
        strength: '500mg',
        pack_size: 'Strip of 10 tablets',
        manufacturer: 'GlaxoSmithKline',
        batch_number: 'CR2024001',
        manufacturing_date: new Date('2024-01-15'),
        expiry_date: new Date('2026-01-14'),
        mrp: 25.00,
        selling_price: 22.50,
        pharmacy: createdPharmacies[0]._id,
        stock: {
          current_quantity: 150,
          minimum_threshold: 20,
          unit: 'strips'
        },
        prescription_required: false,
        tags: ['pain_relief', 'fever', 'headache'],
        description: 'Effective pain relief and fever reducer',
        side_effects: ['Nausea', 'Skin rash'],
        storage_conditions: 'Store in cool, dry place below 25°C',
        isActive: true
      },
      {
        name: 'Amoxicillin',
        generic_name: 'Amoxicillin Trihydrate',
        brand: 'Amoxil',
        composition: 'Amoxicillin 500mg',
        category: 'capsule',
        dosage_form: 'Capsule',
        strength: '500mg',
        pack_size: 'Strip of 10 capsules',
        manufacturer: 'Cipla',
        batch_number: 'AM2024002',
        manufacturing_date: new Date('2024-02-01'),
        expiry_date: new Date('2025-01-31'),
        mrp: 85.00,
        selling_price: 78.00,
        pharmacy: createdPharmacies[0]._id,
        stock: {
          current_quantity: 75,
          minimum_threshold: 15,
          unit: 'strips'
        },
        prescription_required: true,
        tags: ['antibiotic', 'infection'],
        description: 'Broad-spectrum antibiotic for bacterial infections',
        side_effects: ['Diarrhea', 'Nausea', 'Vomiting'],
        storage_conditions: 'Store below 25°C',
        isActive: true
      },

      // Mumbai Bandra West Pharmacy 2 Medicines
      {
        name: 'Ibuprofen',
        generic_name: 'Ibuprofen',
        brand: 'Brufen',
        composition: 'Ibuprofen 400mg',
        category: 'tablet',
        dosage_form: 'Tablet',
        strength: '400mg',
        pack_size: 'Strip of 15 tablets',
        manufacturer: 'Abbott',
        batch_number: 'IB2024003',
        manufacturing_date: new Date('2024-01-20'),
        expiry_date: new Date('2026-01-19'),
        mrp: 45.00,
        selling_price: 42.00,
        pharmacy: createdPharmacies[1]._id,
        stock: {
          current_quantity: 120,
          minimum_threshold: 25,
          unit: 'strips'
        },
        prescription_required: false,
        tags: ['pain_relief', 'inflammation', 'arthritis'],
        description: 'NSAID for pain and inflammation relief',
        side_effects: ['Stomach upset', 'Heartburn'],
        storage_conditions: 'Store in cool place',
        isActive: true
      },
      {
        name: 'Aspirin',
        generic_name: 'Acetylsalicylic Acid',
        brand: 'Ecosprin',
        composition: 'Aspirin 75mg',
        category: 'tablet',
        dosage_form: 'Tablet',
        strength: '75mg',
        pack_size: 'Strip of 14 tablets',
        manufacturer: 'USV',
        batch_number: 'AS2024004',
        manufacturing_date: new Date('2024-03-01'),
        expiry_date: new Date('2025-02-28'),
        mrp: 12.00,
        selling_price: 10.50,
        pharmacy: createdPharmacies[1]._id,
        stock: {
          current_quantity: 200,
          minimum_threshold: 30,
          unit: 'strips'
        },
        prescription_required: false,
        tags: ['blood_thinner', 'heart_health'],
        description: 'Antiplatelet medication for cardiovascular health',
        side_effects: ['Stomach irritation', 'Bleeding risk'],
        storage_conditions: 'Store in dry place',
        isActive: true
      },

      // Mumbai Andheri Pharmacy 1 Medicines
      {
        name: 'Cetirizine',
        generic_name: 'Cetirizine Hydrochloride',
        brand: 'Zyrtec',
        composition: 'Cetirizine 10mg',
        category: 'tablet',
        dosage_form: 'Tablet',
        strength: '10mg',
        pack_size: 'Strip of 10 tablets',
        manufacturer: 'Dr. Reddy\'s',
        batch_number: 'CT2024005',
        manufacturing_date: new Date('2024-02-15'),
        expiry_date: new Date('2026-02-14'),
        mrp: 18.00,
        selling_price: 16.00,
        pharmacy: createdPharmacies[2]._id,
        stock: {
          current_quantity: 180,
          minimum_threshold: 20,
          unit: 'strips'
        },
        prescription_required: false,
        tags: ['allergy', 'antihistamine'],
        description: 'Antihistamine for allergy relief',
        side_effects: ['Drowsiness', 'Dry mouth'],
        storage_conditions: 'Store below 30°C',
        isActive: true
      },
      {
        name: 'Omeprazole',
        generic_name: 'Omeprazole',
        brand: 'Omez',
        composition: 'Omeprazole 20mg',
        category: 'capsule',
        dosage_form: 'Capsule',
        strength: '20mg',
        pack_size: 'Strip of 15 capsules',
        manufacturer: 'Dr. Reddy\'s',
        batch_number: 'OM2024006',
        manufacturing_date: new Date('2024-01-10'),
        expiry_date: new Date('2025-01-09'),
        mrp: 95.00,
        selling_price: 88.00,
        pharmacy: createdPharmacies[2]._id,
        stock: {
          current_quantity: 90,
          minimum_threshold: 12,
          unit: 'strips'
        },
        prescription_required: true,
        tags: ['acid_reflux', 'stomach'],
        description: 'Proton pump inhibitor for acid reflux',
        side_effects: ['Headache', 'Diarrhea'],
        storage_conditions: 'Store below 25°C',
        isActive: true
      },

      // Mumbai Andheri Pharmacy 2 Medicines
      {
        name: 'Metformin',
        generic_name: 'Metformin Hydrochloride',
        brand: 'Glycomet',
        composition: 'Metformin 500mg',
        category: 'tablet',
        dosage_form: 'Tablet',
        strength: '500mg',
        pack_size: 'Strip of 10 tablets',
        manufacturer: 'USV',
        batch_number: 'MT2024007',
        manufacturing_date: new Date('2024-03-15'),
        expiry_date: new Date('2026-03-14'),
        mrp: 35.00,
        selling_price: 32.00,
        pharmacy: createdPharmacies[3]._id,
        stock: {
          current_quantity: 160,
          minimum_threshold: 25,
          unit: 'strips'
        },
        prescription_required: true,
        tags: ['diabetes', 'blood_sugar'],
        description: 'Oral antidiabetic medication',
        side_effects: ['Nausea', 'Diarrhea', 'Metallic taste'],
        storage_conditions: 'Store in cool, dry place',
        isActive: true
      },
      {
        name: 'Vitamin D3',
        generic_name: 'Cholecalciferol',
        brand: 'D-Rise',
        composition: 'Vitamin D3 60,000 IU',
        category: 'capsule',
        dosage_form: 'Capsule',
        strength: '60,000 IU',
        pack_size: 'Strip of 4 capsules',
        manufacturer: 'USV',
        batch_number: 'VD2024008',
        manufacturing_date: new Date('2024-02-20'),
        expiry_date: new Date('2025-02-19'),
        mrp: 120.00,
        selling_price: 110.00,
        pharmacy: createdPharmacies[3]._id,
        stock: {
          current_quantity: 85,
          minimum_threshold: 10,
          unit: 'strips'
        },
        prescription_required: false,
        tags: ['vitamin', 'bone_health', 'immunity'],
        description: 'Vitamin D supplement for bone health',
        side_effects: ['Nausea', 'Constipation'],
        storage_conditions: 'Store below 25°C',
        isActive: true
      },

      // Mumbai Andheri Pharmacy 3 Medicines
      {
        name: 'Azithromycin',
        generic_name: 'Azithromycin',
        brand: 'Zithromax',
        composition: 'Azithromycin 500mg',
        category: 'tablet',
        dosage_form: 'Tablet',
        strength: '500mg',
        pack_size: 'Strip of 3 tablets',
        manufacturer: 'Pfizer',
        batch_number: 'AZ2024009',
        manufacturing_date: new Date('2024-01-25'),
        expiry_date: new Date('2025-01-24'),
        mrp: 180.00,
        selling_price: 165.00,
        pharmacy: createdPharmacies[4]._id,
        stock: {
          current_quantity: 65,
          minimum_threshold: 8,
          unit: 'strips'
        },
        prescription_required: true,
        tags: ['antibiotic', 'infection', 'respiratory'],
        description: 'Macrolide antibiotic for bacterial infections',
        side_effects: ['Diarrhea', 'Nausea', 'Abdominal pain'],
        storage_conditions: 'Store below 30°C',
        isActive: true
      },
      {
        name: 'Diclofenac',
        generic_name: 'Diclofenac Sodium',
        brand: 'Voveran',
        composition: 'Diclofenac 50mg',
        category: 'tablet',
        dosage_form: 'Tablet',
        strength: '50mg',
        pack_size: 'Strip of 10 tablets',
        manufacturer: 'Novartis',
        batch_number: 'DC2024010',
        manufacturing_date: new Date('2024-03-10'),
        expiry_date: new Date('2026-03-09'),
        mrp: 28.00,
        selling_price: 25.00,
        pharmacy: createdPharmacies[4]._id,
        stock: {
          current_quantity: 140,
          minimum_threshold: 18,
          unit: 'strips'
        },
        prescription_required: false,
        tags: ['pain_relief', 'inflammation', 'arthritis'],
        description: 'NSAID for pain and inflammation',
        side_effects: ['Stomach upset', 'Dizziness'],
        storage_conditions: 'Store in cool place',
        isActive: true
      },

      // Delhi Pharmacy 1 Medicines
      {
        name: 'Ranitidine',
        generic_name: 'Ranitidine Hydrochloride',
        brand: 'Zantac',
        composition: 'Ranitidine 150mg',
        category: 'tablet',
        dosage_form: 'Tablet',
        strength: '150mg',
        pack_size: 'Strip of 10 tablets',
        manufacturer: 'GlaxoSmithKline',
        batch_number: 'RN2024011',
        manufacturing_date: new Date('2024-02-10'),
        expiry_date: new Date('2025-02-09'),
        mrp: 15.00,
        selling_price: 13.50,
        pharmacy: createdPharmacies[5]._id,
        stock: {
          current_quantity: 110,
          minimum_threshold: 15,
          unit: 'strips'
        },
        prescription_required: false,
        tags: ['acid_reflux', 'stomach', 'ulcer'],
        description: 'H2 blocker for acid reflux and ulcers',
        side_effects: ['Headache', 'Dizziness'],
        storage_conditions: 'Store below 25°C',
        isActive: true
      },
      {
        name: 'Ciprofloxacin',
        generic_name: 'Ciprofloxacin',
        brand: 'Ciplox',
        composition: 'Ciprofloxacin 500mg',
        category: 'tablet',
        dosage_form: 'Tablet',
        strength: '500mg',
        pack_size: 'Strip of 10 tablets',
        manufacturer: 'Cipla',
        batch_number: 'CP2024012',
        manufacturing_date: new Date('2024-03-05'),
        expiry_date: new Date('2025-03-04'),
        mrp: 75.00,
        selling_price: 68.00,
        pharmacy: createdPharmacies[5]._id,
        stock: {
          current_quantity: 95,
          minimum_threshold: 12,
          unit: 'strips'
        },
        prescription_required: true,
        tags: ['antibiotic', 'infection', 'urinary'],
        description: 'Fluoroquinolone antibiotic for bacterial infections',
        side_effects: ['Nausea', 'Diarrhea', 'Dizziness'],
        storage_conditions: 'Store below 25°C',
        isActive: true
      },

      // Delhi Pharmacy 2 Medicines
      {
        name: 'Losartan',
        generic_name: 'Losartan Potassium',
        brand: 'Cozaar',
        composition: 'Losartan 50mg',
        category: 'tablet',
        dosage_form: 'Tablet',
        strength: '50mg',
        pack_size: 'Strip of 10 tablets',
        manufacturer: 'Merck',
        batch_number: 'LS2024013',
        manufacturing_date: new Date('2024-01-30'),
        expiry_date: new Date('2026-01-29'),
        mrp: 85.00,
        selling_price: 78.00,
        pharmacy: createdPharmacies[6]._id,
        stock: {
          current_quantity: 80,
          minimum_threshold: 10,
          unit: 'strips'
        },
        prescription_required: true,
        tags: ['hypertension', 'blood_pressure', 'heart'],
        description: 'ARB medication for hypertension',
        side_effects: ['Dizziness', 'Fatigue'],
        storage_conditions: 'Store below 25°C',
        isActive: true
      },

      // Delhi Pharmacy 3 Medicines
      {
        name: 'Atorvastatin',
        generic_name: 'Atorvastatin Calcium',
        brand: 'Lipitor',
        composition: 'Atorvastatin 10mg',
        category: 'tablet',
        dosage_form: 'Tablet',
        strength: '10mg',
        pack_size: 'Strip of 10 tablets',
        manufacturer: 'Pfizer',
        batch_number: 'AT2024014',
        manufacturing_date: new Date('2024-02-25'),
        expiry_date: new Date('2025-02-24'),
        mrp: 120.00,
        selling_price: 110.00,
        pharmacy: createdPharmacies[7]._id,
        stock: {
          current_quantity: 70,
          minimum_threshold: 8,
          unit: 'strips'
        },
        prescription_required: true,
        tags: ['cholesterol', 'heart_health', 'statin'],
        description: 'Statin medication for cholesterol management',
        side_effects: ['Muscle pain', 'Liver enzyme changes'],
        storage_conditions: 'Store below 25°C',
        isActive: true
      },
      {
        name: 'Folic Acid',
        generic_name: 'Folic Acid',
        brand: 'Folvite',
        composition: 'Folic Acid 5mg',
        category: 'tablet',
        dosage_form: 'Tablet',
        strength: '5mg',
        pack_size: 'Strip of 10 tablets',
        manufacturer: 'Abbott',
        batch_number: 'FA2024015',
        manufacturing_date: new Date('2024-03-20'),
        expiry_date: new Date('2026-03-19'),
        mrp: 8.00,
        selling_price: 7.00,
        pharmacy: createdPharmacies[7]._id,
        stock: {
          current_quantity: 200,
          minimum_threshold: 25,
          unit: 'strips'
        },
        prescription_required: false,
        tags: ['vitamin', 'pregnancy', 'anemia'],
        description: 'Vitamin supplement for pregnancy and anemia',
        side_effects: ['Nausea', 'Loss of appetite'],
        storage_conditions: 'Store in cool, dry place',
        isActive: true
      }
    ];

    const createdMedicines = await Medicine.insertMany(medicines);
    console.log('Created medicines:', createdMedicines.length);

    // Update pharmacies with medicine inventory
    for (let i = 0; i < createdPharmacies.length; i++) {
      const pharmacyMedicines = createdMedicines.filter(med => med.pharmacy.toString() === createdPharmacies[i]._id.toString());
      const medicineIds = pharmacyMedicines.map(med => med._id);

      await Pharmacy.findByIdAndUpdate(createdPharmacies[i]._id, {
        inventory: medicineIds
      });
    }

    console.log('Database seeded successfully!');
    console.log('Summary:');
    console.log('- Users created:', createdUsers.length);
    console.log('- Pharmacies created:', createdPharmacies.length);
    console.log('- Medicines created:', createdMedicines.length);

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the seed function
seedDatabase();