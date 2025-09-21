import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Consultation {
  id: string;
  patientId: string;
  doctorId: string;
  type: 'video' | 'audio' | 'chat';
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  scheduledAt: string;
  duration?: number;
  diagnosis?: string;
  prescription?: string;
  voicePrescription?: string;
  notes?: string;
}

interface ConsultationsState {
  consultations: Consultation[];
  activeConsultation: Consultation | null;
  loading: boolean;
  error: string | null;
}

const initialState: ConsultationsState = {
  consultations: [],
  activeConsultation: null,
  loading: false,
  error: null,
};

const consultationsSlice = createSlice({
  name: 'consultations',
  initialState,
  reducers: {
    setConsultationsLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setConsultationsSuccess: (state, action: PayloadAction<Consultation[]>) => {
      state.consultations = action.payload;
      state.loading = false;
      state.error = null;
    },
    setConsultationsError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    addConsultation: (state, action: PayloadAction<Consultation>) => {
      state.consultations.push(action.payload);
    },
    updateConsultation: (state, action: PayloadAction<{ id: string; updates: Partial<Consultation> }>) => {
      const index = state.consultations.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.consultations[index] = { ...state.consultations[index], ...action.payload.updates };
      }
    },
    setActiveConsultation: (state, action: PayloadAction<Consultation | null>) => {
      state.activeConsultation = action.payload;
    },
  },
});

export const {
  setConsultationsLoading,
  setConsultationsSuccess,
  setConsultationsError,
  addConsultation,
  updateConsultation,
  setActiveConsultation,
} = consultationsSlice.actions;

export default consultationsSlice.reducer;