import { configureStore } from '@reduxjs/toolkit';
import gameReducer from './slices/gameSlice';
import menuReducer from './slices/menuSlice';
import audioReducer from './slices/audioSlice';

export const store = configureStore({
  reducer: {
    game: gameReducer,
    menu: menuReducer,
    audio: audioReducer,
    // Add more reducers here as your application grows
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
