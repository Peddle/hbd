import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AudioState {
  musicEnabled: boolean;
  soundEffectsEnabled: boolean;
  musicVolume: number;
  soundEffectsVolume: number;
}

const initialState: AudioState = {
  musicEnabled: true,
  soundEffectsEnabled: true,
  musicVolume: 0.25, // Reduced from 0.5 to make 50% quieter
  soundEffectsVolume: 0.7,
};

export const audioSlice = createSlice({
  name: 'audio',
  initialState,
  reducers: {
    toggleMusic: (state) => {
      state.musicEnabled = !state.musicEnabled;
    },
    toggleSoundEffects: (state) => {
      state.soundEffectsEnabled = !state.soundEffectsEnabled;
    },
    setMusicVolume: (state, action: PayloadAction<number>) => {
      state.musicVolume = action.payload;
    },
    setSoundEffectsVolume: (state, action: PayloadAction<number>) => {
      state.soundEffectsVolume = action.payload;
    },
    resetAudioSettings: () => initialState,
  },
});

export const { 
  toggleMusic, 
  toggleSoundEffects, 
  setMusicVolume, 
  setSoundEffectsVolume,
  resetAudioSettings 
} = audioSlice.actions;

export default audioSlice.reducer;
