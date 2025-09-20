import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SQLite from 'expo-sqlite';

// Import fixtures
import villagesData from '../../fixtures/villages.json';
import pharmaciesData from '../../fixtures/pharmacies.json';
import hospitalsData from '../../fixtures/hospitals.json';
import doctorsData from '../../fixtures/doctors.json';
import patientsData from '../../fixtures/patients.json';
import medicinesData from '../../fixtures/medicines.json';
import ashasData from '../../fixtures/ashas.json';

class MockAPI {
  private db: SQLite.SQLiteDatabase | null = null;

  constructor() {
    this.initDatabase();
  }

  private async initDatabase() {
    try {
      this.db = await SQLite.openDatabaseAsync('medimitra.db');
      await this.setupTables();
    } catch (error) {
      console.error('Database initialization error:', error);
    }
  }

  private async setupTables() {
    if (!this.db) return;

    const tables = [
      `CREATE TABLE IF NOT EXISTS offline_actions (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        payload TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        synced INTEGER DEFAULT 0
      )`,
      `CREATE TABLE IF NOT EXISTS consultations (
        id TEXT PRIMARY KEY,
        patient_id TEXT,
        doctor_id TEXT,
        type TEXT,
        status TEXT,
        scheduled_at TEXT,
        data TEXT
      )`,
      `CREATE TABLE IF NOT EXISTS medicine_requests (
        id TEXT PRIMARY KEY,
        patient_id TEXT,
        pharmacy_id TEXT,
        medicines TEXT,
        status TEXT,
        created_at TEXT
      )`
    ];

    for (const table of tables) {
      await this.db.execAsync(table);
    }
  }

  // Authentication APIs
  async login(phone: string): Promise<{ success: boolean; otp?: string }> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true, otp: '123456' };
  }

  async verifyOtp(phone: string, otp: string): Promise<{ success: boolean; user?: any; token?: string }> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (otp === '123456') {
      const user = {
        id: '1',
        phone,
        role: 'patient',
        name: 'Kamal Mishra'
      };
      
      await AsyncStorage.setItem('auth_token', 'mock-token-123');
      await AsyncStorage.setItem('user_data', JSON.stringify(user));
      
      return { success: true, user, token: 'mock-token-123' };
    }
    
    return { success: false };
  }

  // Patient APIs
  async getPatients(): Promise<any[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    return patientsData;
  }

  async getPatientRecords(patientId: string): Promise<any[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const patient = patientsData.find(p => p.id === patientId);
    return patient?.records || [];
  }

  async savePatientRecord(patientId: string, record: any): Promise<{ success: boolean }> {
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // In a real app, this would save to the backend
    // For offline support, save to local storage
    try {
      const existingRecords = await AsyncStorage.getItem(`records_${patientId}`);
      const records = existingRecords ? JSON.parse(existingRecords) : [];
      records.push({ ...record, id: Date.now().toString() });
      await AsyncStorage.setItem(`records_${patientId}`, JSON.stringify(records));
      
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  }

  // Medicine APIs
  async searchMedicines(query: string, lat?: number, lng?: number): Promise<any[]> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    return medicinesData.filter(medicine => 
      medicine.name.toLowerCase().includes(query.toLowerCase()) ||
      medicine.genericName.toLowerCase().includes(query.toLowerCase())
    );
  }

  async getNearbyPharmacies(lat: number, lng: number, radius: number = 10): Promise<any[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock distance calculation - in real app would use proper geospatial queries
    return pharmaciesData.map(pharmacy => ({
      ...pharmacy,
      distance: Math.random() * radius, // Mock distance
      estimatedTime: Math.floor(Math.random() * 30) + 10 // Mock travel time in minutes
    }));
  }

  async compareMedicinePrices(medicineName: string, lat: number, lng: number): Promise<any[]> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const results: any[] = [];
    pharmaciesData.forEach(pharmacy => {
      pharmacy.medicines.forEach(medicine => {
        if (medicine.name.toLowerCase().includes(medicineName.toLowerCase())) {
          results.push({
            ...medicine,
            pharmacy: {
              id: pharmacy.id,
              name: pharmacy.name,
              address: pharmacy.address,
              distance: Math.random() * 10,
              deliveryAvailable: pharmacy.deliveryAvailable
            }
          });
        }
      });
    });
    
    return results.sort((a, b) => a.price - b.price);
  }

  async requestMedicineDelivery(request: {
    patientId: string;
    pharmacyId: string;
    medicines: any[];
    address: string;
    scheduledFor: string;
  }): Promise<{ success: boolean; orderId?: string }> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      // Check if online - if offline, queue the request
      const isOnline = await this.checkOnlineStatus();
      
      if (!isOnline) {
        await this.queueOfflineAction('medicine_delivery_request', request);
        return { success: true, orderId: `offline_${Date.now()}` };
      }
      
      const orderId = `order_${Date.now()}`;
      
      // Save to local database
      if (this.db) {
        await this.db.runAsync(
          'INSERT INTO medicine_requests (id, patient_id, pharmacy_id, medicines, status, created_at) VALUES (?, ?, ?, ?, ?, ?)',
          [orderId, request.patientId, request.pharmacyId, JSON.stringify(request.medicines), 'pending', new Date().toISOString()]
        );
      }
      
      return { success: true, orderId };
    } catch (error) {
      return { success: false };
    }
  }

  // Hospital APIs
  async getNearbyHospitals(lat: number, lng: number): Promise<any[]> {
    await new Promise(resolve => setTimeout(resolve, 700));
    
    return hospitalsData.map(hospital => ({
      ...hospital,
      distance: Math.random() * 15,
      estimatedTime: Math.floor(Math.random() * 45) + 15
    }));
  }

  // Doctor APIs
  async getDoctorAvailability(doctorId: string): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const doctor = doctorsData.find(d => d.id === doctorId);
    return doctor ? {
      ...doctor,
      isOnline: Math.random() > 0.3, // 70% chance doctor is online
      nextAvailable: new Date(Date.now() + Math.random() * 2 * 60 * 60 * 1000).toISOString()
    } : null;
  }

  // AI APIs
  async symptomCheck(symptoms: string[], patientData?: any): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock AI symptom checker with basic rules
    const commonConditions = [
      { condition: 'Common Cold', confidence: 0.8, urgency: 'low', advice: 'Rest and hydration' },
      { condition: 'Fever', confidence: 0.7, urgency: 'medium', advice: 'Monitor temperature, consult if persists' },
      { condition: 'Headache', confidence: 0.6, urgency: 'low', advice: 'Pain relief medication' }
    ];
    
    if (symptoms.some(s => s.toLowerCase().includes('chest pain'))) {
      return {
        condition: 'Chest Pain',
        confidence: 0.9,
        urgency: 'high',
        advice: 'Seek immediate medical attention',
        emergency: true
      };
    }
    
    return commonConditions[Math.floor(Math.random() * commonConditions.length)];
  }

  // ASHA APIs
  async getAshaHouseholds(ashaId: string): Promise<any[]> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const asha = ashasData.find(a => a.id === ashaId);
    return asha?.households || [];
  }

  async addHousehold(ashaId: string, householdData: any): Promise<{ success: boolean }> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      // Save to local storage for offline support
      const key = `households_${ashaId}`;
      const existing = await AsyncStorage.getItem(key);
      const households = existing ? JSON.parse(existing) : [];
      households.push({ ...householdData, id: Date.now().toString() });
      await AsyncStorage.setItem(key, JSON.stringify(households));
      
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  }

  // Offline Support
  private async queueOfflineAction(type: string, payload: any): Promise<void> {
    if (!this.db) return;
    
    const action = {
      id: Date.now().toString(),
      type,
      payload: JSON.stringify(payload),
      timestamp: Date.now(),
      synced: 0
    };
    
    await this.db.runAsync(
      'INSERT INTO offline_actions (id, type, payload, timestamp, synced) VALUES (?, ?, ?, ?, ?)',
      [action.id, action.type, action.payload, action.timestamp, action.synced]
    );
  }

  async getPendingOfflineActions(): Promise<any[]> {
    if (!this.db) return [];
    
    const result = await this.db.getAllAsync(
      'SELECT * FROM offline_actions WHERE synced = 0 ORDER BY timestamp ASC'
    );
    
    return result.map((row: any) => ({
      ...row,
      payload: JSON.parse(row.payload)
    }));
  }

  async markActionSynced(actionId: string): Promise<void> {
    if (!this.db) return;
    
    await this.db.runAsync(
      'UPDATE offline_actions SET synced = 1 WHERE id = ?',
      [actionId]
    );
  }

  private async checkOnlineStatus(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch('https://www.google.com', { 
        method: 'HEAD',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      return false;
    }
  }

  // Data getters for fixtures
  getVillages() { return villagesData; }
  getPharmacies() { return pharmaciesData; }
  getHospitals() { return hospitalsData; }
  getDoctors() { return doctorsData; }
  getMedicines() { return medicinesData; }
  getAshas() { return ashasData; }
}

export const mockAPI = new MockAPI();