import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Patient {
  id: string;
  name: string;
  phone: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  village: string;
  medicalHistory: string[];
  lastVisit?: string;
  status: 'active' | 'inactive';
  avatarSeed: string;
}

interface PatientsState {
  patients: Patient[];
  selectedPatient: Patient | null;
  loading: boolean;
  error: string | null;
}

const initialState: PatientsState = {
  patients: [],
  selectedPatient: null,
  loading: false,
  error: null,
};

const patientsSlice = createSlice({
  name: 'patients',
  initialState,
  reducers: {
    setPatientsLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setPatientsSuccess: (state, action: PayloadAction<Patient[]>) => {
      state.patients = action.payload;
      state.loading = false;
      state.error = null;
    },
    setPatientsError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    addPatient: (state, action: PayloadAction<Patient>) => {
      state.patients.push(action.payload);
    },
    updatePatient: (state, action: PayloadAction<{ id: string; updates: Partial<Patient> }>) => {
      const index = state.patients.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.patients[index] = { ...state.patients[index], ...action.payload.updates };
      }
    },
    setSelectedPatient: (state, action: PayloadAction<Patient | null>) => {
      state.selectedPatient = action.payload;
    },
  },
});

export const {
  setPatientsLoading,
  setPatientsSuccess,
  setPatientsError,
  addPatient,
  updatePatient,
  setSelectedPatient,
} = patientsSlice.actions;

export default patientsSlice.reducer;