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

const applyDamage = (target: Ship, attacker: Ship, damage: number) => {
  let newShields = target.shields;
  let remainingDamage = damage;

  if (newShields) {
    const angleToTarget = Math.atan2(
      attacker.position.y - target.position.y,
      attacker.position.x - target.position.x
    );
    const angleDeg = (angleToTarget * 180) / Math.PI;
    const relativeAngle = (angleDeg - target.facing + 360) % 360;

    let arc: keyof typeof newShields = 'front';
    if (relativeAngle >= 315 || relativeAngle < 45) arc = 'front';
    else if (relativeAngle >= 45 && relativeAngle < 135) arc = 'right';
    else if (relativeAngle >= 135 && relativeAngle < 225) arc = 'back';
    else if (relativeAngle >= 225 && relativeAngle < 315) arc = 'left';

    if (newShields[arc] > 0) {
      if (remainingDamage > newShields[arc]) {
        remainingDamage -= newShields[arc];
        newShields[arc] = 0;
      } else {
        newShields[arc] -= remainingDamage;
        remainingDamage = 0;
      }
    }
  }

  const newHull = Math.max(0, target.hull - remainingDamage);
  const destroyed = newHull <= 0;

  return {
    ...target,
    shields: newShields,
    hull: newHull,
    destroyed,
  };
}

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
    addLogEntry: (state, action: PayloadAction<{message: string; type?: LogEntry['type']}>) => {
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
      if (state.selectedShip == null || state.targetShip == null) return;

      const attacker = state.playerShips[state.selectedShip];
      const weapon = attacker.weapons.find((w) => w.id === weaponId);
      if (!weapon) return;

      const target = state.enemyShips[state.targetShip];
      const hitRoll = Math.random() * 100;
      const hit = hitRoll <= weapon.accuracy;

      if (hit) {
        const updatedTarget = applyDamage(target, attacker, weapon.damage);
        state.enemyShips[state.targetShip] = updatedTarget;
      }

      const updatedWeapons = attacker.weapons.map((w) =>
        w.id === weaponId ? {...w, currentCooldown: w.cooldown} : w
      );
      state.playerShips[state.selectedShip] = {...attacker, weapons: updatedWeapons};
    },
    endPlayerTurn: (state) => {
      state.currentTurn = 'enemy';
      state.phase = 'attack';
    },
    executeEnemyTurn: (state) => {
      const activeEnemies = state.enemyShips.filter((ship) => !ship.destroyed);
      if (activeEnemies.length === 0) return;

      const activePlayers = state.playerShips.filter((ship) => !ship.destroyed);
      if (activePlayers.length === 0) return;

      const randomPlayer = activePlayers[Math.floor(Math.random() * activePlayers.length)];
      const randomEnemy = activeEnemies[Math.floor(Math.random() * activeEnemies.length)];

      const weapon = randomEnemy.weapons[0];
      const hitRoll = Math.random() * 100;
      const hit = hitRoll <= weapon.accuracy;

      const targetIndex = state.playerShips.findIndex((s) => s.id === randomPlayer.id);
      if (hit) {
        const updatedTarget = applyDamage(randomPlayer, randomEnemy, weapon.damage);
        state.playerShips[targetIndex] = updatedTarget;
      }

      state.playerShips = state.playerShips.map((ship) => {
        const updatedWeapons = ship.weapons.map((w) => ({
          ...w,
          currentCooldown: Math.max(0, w.currentCooldown - 1),
        }));
        return {...ship, speedRemaining: ship.speed, weapons: updatedWeapons};
      });

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
