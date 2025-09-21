import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface OfflineAction {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
  synced: boolean;
}

interface OfflineState {
  isOnline: boolean;
  pendingActions: OfflineAction[];
  syncInProgress: boolean;
  lastSync: number | null;
}

const initialState: OfflineState = {
  isOnline: true,
  pendingActions: [],
  syncInProgress: false,
  lastSync: null,
};

const offlineSlice = createSlice({
  name: 'offline',
  initialState,
  reducers: {
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },
    addPendingAction: (state, action: PayloadAction<Omit<OfflineAction, 'id' | 'timestamp' | 'synced'>>) => {
      const pendingAction: OfflineAction = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: Date.now(),
        synced: false,
      };
      state.pendingActions.push(pendingAction);
    },
    markActionSynced: (state, action: PayloadAction<string>) => {
      const action_item = state.pendingActions.find(a => a.id === action.payload);
      if (action_item) {
        action_item.synced = true;
      }
    },
    clearSyncedActions: (state) => {
      state.pendingActions = state.pendingActions.filter(a => !a.synced);
    },
    setSyncInProgress: (state, action: PayloadAction<boolean>) => {
      state.syncInProgress = action.payload;
    },
    setLastSync: (state, action: PayloadAction<number>) => {
      state.lastSync = action.payload;
    },
  },
});

export const {
  setOnlineStatus,
  addPendingAction,
  markActionSynced,
  clearSyncedActions,
  setSyncInProgress,
  setLastSync,
} = offlineSlice.actions;

export default offlineSlice.reducer;