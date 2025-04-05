import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type MenuType = 'start' | 'battle' | 'shipbuilding';

interface MenuState {
  activeMenu: MenuType;
  previousMenu: MenuType | null;
  menuHistory: MenuType[];
  maxHistoryLength: number;
}

const initialState: MenuState = {
  activeMenu: 'start',
  previousMenu: null,
  menuHistory: ['start'],
  maxHistoryLength: 10
};

export const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    // Navigate to a specific menu
    navigateTo: (state, action: PayloadAction<MenuType>) => {
      const newMenu = action.payload;
      
      // Don't do anything if we're already on this menu
      if (state.activeMenu === newMenu) return;
      
      // Store current menu as previous before changing
      state.previousMenu = state.activeMenu;
      state.activeMenu = newMenu;
      
      // Add to history
      state.menuHistory.push(newMenu);
      
      // Limit history size
      if (state.menuHistory.length > state.maxHistoryLength) {
        state.menuHistory.shift();
      }
    },
    
    // Go back to previous menu if available
    navigateBack: (state) => {
      if (state.previousMenu) {
        state.activeMenu = state.previousMenu;
        state.previousMenu = state.menuHistory[state.menuHistory.length - 3] || null;
        state.menuHistory.pop();
      }
    },
    
    // Reset menus to start
    resetToStart: (state) => {
      state.activeMenu = 'start';
      state.previousMenu = null;
      state.menuHistory = ['start'];
    }
  },
});

export const { navigateTo, navigateBack, resetToStart } = menuSlice.actions;

export default menuSlice.reducer;
