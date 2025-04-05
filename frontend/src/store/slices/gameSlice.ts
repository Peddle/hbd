import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {Ship, Weapon, LogEntry, mockPlayerShips, mockEnemyShips} from '../../pages/ShipCombat';

export type ShipIndex = number

interface GameState {
  playerShips: Ship[];
  enemyShips: Ship[];
  selectedShip: ShipIndex | null;
  targetShip: ShipIndex | null;
  combatLogs: LogEntry[];
  currentTurn: 'player' | 'enemy';
  phase: 'move' | 'attack' | 'end';
}

const initialState: GameState = {
  playerShips: mockPlayerShips,
  enemyShips: mockEnemyShips,
  selectedShip: 0,
  targetShip: null,
  combatLogs: [
    {
      id: '1',
      message: 'Combat initiated with Klackon fleet',
      timestamp: Date.now(),
      type: 'system',
    },
    {
      id: '2',
      message: 'Your turn to attack',
      timestamp: Date.now(),
      type: 'info',
    },
  ],
  currentTurn: 'player',
  phase: 'attack',
};

export const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    selectShip: (state, action: PayloadAction<ShipIndex>) => {
      const ship = action.payload;
      state.playerShips = state.playerShips.map((s, i) => ({
        ...s,
        selected: i == ship,
      }));
      state.selectedShip = ship;
    },
    selectTarget: (state, action: PayloadAction<ShipIndex>) => {
      state.targetShip = action.payload;
    },
    moveShip: (state, action: PayloadAction<{ship: Ship, newPos: [number, number], cost: number}>) => {
      const {ship, newPos, cost} = action.payload;
      const shipIndex = state.playerShips.findIndex((s) => s.id === ship.id);
      const updatedShip = {
        ...state.playerShips[shipIndex],
        position: {x: newPos[0], y: newPos[1]},
        speedRemaining: state.playerShips[shipIndex].speedRemaining - cost,
      };
      state.playerShips[shipIndex] = updatedShip;
    },
    rotateShip: (state, action: PayloadAction<{ship: Ship, angle: number, cost: number}>) => {
      const {ship, angle, cost} = action.payload;
      const shipIndex = state.playerShips.findIndex((s) => s.id === ship.id);
      const updatedShip = {
        ...state.playerShips[shipIndex],
        facing: angle % 360,
        speedRemaining: state.playerShips[shipIndex].speedRemaining - cost,
      };
      state.playerShips[shipIndex] = updatedShip;
    },
    addLogEntry: (
      state,
      action: PayloadAction<{message: string; type?: LogEntry['type']}>
    ) => {
      const {message, type = 'info'} = action.payload;
      state.combatLogs = [
        {
          id: Date.now().toString(),
          message,
          timestamp: Date.now(),
          type,
        },
        ...state.combatLogs,
      ];
    },

    attackTarget: (state, action: PayloadAction<string>) => {
      const weaponId = action.payload;
      if (!state.selectedShip || !state.targetShip) return;

      const weapon = state.playerShips[state.selectedShip].weapons.find((w) => w.id === weaponId);
      if (!weapon) return;

      // Simulate attack
      const hitRoll = Math.random() * 100;
      const hit = hitRoll <= weapon.accuracy;

      if (hit) {
        // Calculate damage
        const damage = weapon.damage;

        // Apply damage to target

        if (state.targetShip > -1) {
          let ship = state.enemyShips[state.targetShip];

          // Apply damage to shields first, then hull
          let remainingDamage = damage;
          let newShields = ship.shields;

          if (newShields > 0) {
            if (remainingDamage > newShields) {
              remainingDamage -= newShields;
              newShields = 0;
            } else {
              newShields -= remainingDamage;
              remainingDamage = 0;
            }
          }

          const newHull = Math.max(0, ship.hull - remainingDamage);
          const destroyed = newHull <= 0;

          // Update the ship
          state.enemyShips[state.targetShip] = {
            ...ship,
            shields: newShields,
            hull: newHull,
            destroyed,
          };
        }
      }

      // Update weapon cooldown
      const updatedWeapons = state.playerShips[state.selectedShip].weapons.map((w) =>
        w.id === weaponId
          ? {...w, currentCooldown: w.cooldown}
          : w
      );
      const updatedShip = {...state.playerShips[state.selectedShip], weapons: updatedWeapons};

      state.playerShips = [...state.playerShips, updatedShip];
    },

    endPlayerTurn: (state) => {
      state.currentTurn = 'enemy';
      state.phase = 'attack';
    },

    executeEnemyTurn: (state) => {
      const activeEnemies = state.enemyShips.filter((ship) => !ship.destroyed);
      if (activeEnemies.length === 0) {
        return;
      }

      const activePlayerShips = state.playerShips.filter((ship) => !ship.destroyed);
      if (activePlayerShips.length === 0) {
        return;
      }

      // Enemy selects a random player ship to attack
      const randomPlayerShip =
        activePlayerShips[Math.floor(Math.random() * activePlayerShips.length)];

      // Enemy selects a random ship to attack with
      const randomEnemyShip =
        activeEnemies[Math.floor(Math.random() * activeEnemies.length)];

      const enemyWeapon = randomEnemyShip.weapons[0]; // Assuming each enemy has at least one weapon
      const hitRoll = Math.random() * 100;
      const hit = hitRoll <= enemyWeapon.accuracy;

      if (hit) {
        // Calculate damage
        const damage = enemyWeapon.damage;

        // Find target player ship index
        const targetIndex = state.playerShips.findIndex(
          (ship) => ship.id === randomPlayerShip.id
        );

        if (targetIndex !== -1) {
          let ship = state.playerShips[targetIndex];

          // Apply damage to shields first, then hull
          let remainingDamage = damage;
          let newShields = ship.shields;

          if (newShields > 0) {
            if (remainingDamage > newShields) {
              remainingDamage -= newShields;
              newShields = 0;
            } else {
              newShields -= remainingDamage;
              remainingDamage = 0;
            }
          }

          const newHull = Math.max(0, ship.hull - remainingDamage);
          const destroyed = newHull <= 0;

          // Update the ship
          state.playerShips[targetIndex] = {
            ...ship,
            shields: newShields,
            hull: newHull,
            destroyed,
          };
        }
      }

      // Reduce cooldowns for player weapons
      state.playerShips = state.playerShips.map((ship) => {
        const updatedWeapons = ship.weapons.map((w) => ({
          ...w,
          currentCooldown: Math.max(0, w.currentCooldown - 1),
        }));
        return {
          ...ship,
          speedRemaining: ship.speed,
          weapons: updatedWeapons
        };
      });

      // Start player turn
      state.currentTurn = 'player';
      state.phase = 'attack';
    },

    resetGame: () => initialState,
  },
});

export const {
  selectShip,
  selectTarget,
  addLogEntry,
  attackTarget,
  endPlayerTurn,
  executeEnemyTurn,
  resetGame
} = gameSlice.actions;

export default gameSlice.reducer;
