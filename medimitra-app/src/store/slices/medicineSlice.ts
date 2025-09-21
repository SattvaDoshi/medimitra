import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Medicine {
  id: string;
  name: string;
  genericName: string;
  brand: string;
  category: string;
  dosage: string;
  price: number;
  stock: number;
  pharmacyId: string;
}

interface Pharmacy {
  id: string;
  name: string;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  deliveryAvailable: boolean;
  medicines: Medicine[];
}

interface MedicineState {
  medicines: Medicine[];
  pharmacies: Pharmacy[];
  selectedPharmacy: Pharmacy | null;
  searchResults: Medicine[];
  loading: boolean;
  error: string | null;
}

const initialState: MedicineState = {
  medicines: [],
  pharmacies: [],
  selectedPharmacy: null,
  searchResults: [],
  loading: false,
  error: null,
};

const medicineSlice = createSlice({
  name: 'medicine',
  initialState,
  reducers: {
    setMedicineLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setMedicinesSuccess: (state, action: PayloadAction<Medicine[]>) => {
      state.medicines = action.payload;
      state.loading = false;
      state.error = null;
    },
    setPharmaciesSuccess: (state, action: PayloadAction<Pharmacy[]>) => {
      state.pharmacies = action.payload;
      state.loading = false;
      state.error = null;
    },
    setMedicineError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    setSearchResults: (state, action: PayloadAction<Medicine[]>) => {
      state.searchResults = action.payload;
    },
    setSelectedPharmacy: (state, action: PayloadAction<Pharmacy | null>) => {
      state.selectedPharmacy = action.payload;
    },
  },
});

export const {
  setMedicineLoading,
  setMedicinesSuccess,
  setPharmaciesSuccess,
  setMedicineError,
  setSearchResults,
  setSelectedPharmacy,
} = medicineSlice.actions;

export default medicineSlice.reducer;