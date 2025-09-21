import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import patientsSlice from './slices/patientsSlice';
import consultationsSlice from './slices/consultationsSlice';
import medicineSlice from './slices/medicineSlice';
import offlineSlice from './slices/offlineSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    patients: patientsSlice,
    consultations: consultationsSlice,
    medicine: medicineSlice,
    offline: offlineSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;