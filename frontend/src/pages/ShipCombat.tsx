import ShipDisplay from "../components/ShipDisplay";
import WeaponPanel from "../components/WeaponPanel";
import CombatLog from "../components/CombatLog";
import TargetSelection from "../components/TargetSelection";
import BattleMap from "../components/BattleMap";
import ShipStats from "../components/ShipStats";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { 
  selectShip, 
  selectTarget, 
  addLogEntry, 
  attackTarget, 
  endPlayerTurn, 
  executeEnemyTurn 
} from "../store/slices/gameSlice";


export type Ship = {
  id: string;
  name: string;
  hull: number;
  maxHull: number;
  shields: number;
  maxShields: number;
  weapons: Weapon[];
  image: string;
  faction: string;
  position: { x: number; y: number };
  speed: number;
  speedRemaining: number;
  selected: boolean;
  targetable: boolean;
  destroyed: boolean;
};

export type Weapon = {
  id: string;
  name: string;
  damage: number;
  range: number;
  accuracy: number;
  energyCost: number;
  cooldown: number;
  currentCooldown: number;
};

export const mockPlayerShips: Ship[] = [
  {
    id: "player-1",
    name: "Avenger",
    hull: 100,
    maxHull: 100,
    shields: 75,
    maxShields: 75,
    weapons: [
      {
        id: "laser-1",
        name: "Beam Laser",
        damage: 15,
        range: 4,
        accuracy: 85,
        energyCost: 10,
        cooldown: 1,
        currentCooldown: 0,
      },
      {
        id: "missile-1",
        name: "Fusion Missile",
        damage: 30,
        range: 6,
        accuracy: 70,
        energyCost: 15,
        cooldown: 2,
        currentCooldown: 0,
      },
    ],
    image: "/ships/player_destroyer.png",
    faction: "Human",
    position: { x: -2, y: -3 },
    speed: 5,
    speedRemaining: 5,
    selected: true,
    targetable: false,
    destroyed: false,
  },
  {
    id: "player-2",
    name: "Guardian",
    hull: 150,
    maxHull: 150,
    shields: 100,
    maxShields: 100,
    weapons: [
      {
        id: "cannon-1",
        name: "Mass Driver",
        damage: 25,
        range: 5,
        accuracy: 75,
        energyCost: 12,
        cooldown: 1,
        currentCooldown: 0,
      },
      {
        id: "torpedo-1",
        name: "Quantum Torpedo",
        damage: 45,
        range: 7,
        accuracy: 65,
        energyCost: 20,
        cooldown: 3,
        currentCooldown: 0,
      },
    ],
    image: "/ships/player_cruiser.png",
    faction: "Human",
    position: { x: -1, y: 4 },
    speed: 4,
    speedRemaining: 2,
    selected: false,
    targetable: false,
    destroyed: false,
  },
];

export const mockEnemyShips: Ship[] = [
  {
    id: "enemy-1",
    name: "Devastator",
    hull: 120,
    maxHull: 120,
    shields: 80,
    maxShields: 80,
    weapons: [
      {
        id: "enemy-laser-1",
        name: "Plasma Cannon",
        damage: 18,
        range: 4,
        accuracy: 80,
        energyCost: 12,
        cooldown: 1,
        currentCooldown: 0,
      },
    ],
    image: "/ships/enemy_destroyer.png",
    faction: "Klackon",
    position: { x: 4, y: -3 },
    speed: 5,
    speedRemaining: 5,
    selected: false,
    targetable: true,
    destroyed: false,
  },
  {
    id: "enemy-2",
    name: "Annihilator",
    hull: 180,
    maxHull: 180,
    shields: 120,
    maxShields: 120,
    weapons: [
      {
        id: "enemy-cannon-1",
        name: "Disruptor Ray",
        damage: 28,
        range: 5,
        accuracy: 70,
        energyCost: 15,
        cooldown: 2,
        currentCooldown: 0,
      },
    ],
    image: "/ships/enemy_battleship.png",
    faction: "Klackon",
    position: { x: 4, y: 1 },
    speed: 5,
    speedRemaining: 5,
    selected: false,
    targetable: true,
    destroyed: false,
  },
];

export type LogEntry = {
  id: string;
  message: string;
  timestamp: number;
  type: "attack" | "defense" | "movement" | "info" | "system";
};

const ShipCombat = () => {
  const dispatch = useAppDispatch();
  const playerShips = useAppSelector((state) => state.game.playerShips);
  const enemyShips = useAppSelector((state) => state.game.enemyShips);
  const selectedShip = useAppSelector((state) => state.game.selectedShip);
  const targetShip = useAppSelector((state) => state.game.targetShip);
  const combatLogs = useAppSelector((state) => state.game.combatLogs);
  const currentTurn = useAppSelector((state) => state.game.currentTurn);
  const phase = useAppSelector((state) => state.game.phase);

  const handleShipSelect = (ship: number) => {
    dispatch(selectShip(ship));
    dispatch(addLogEntry({ message: `Selected ${playerShips[ship].name} for combat actions` }));
  };

  const handleTargetSelect = (ship: number) => {
    dispatch(selectTarget(ship));
    dispatch(addLogEntry({ message: `Targeting enemy vessel ${enemyShips[ship].name}` }));
  };

  const handleAttack = (weaponId: string) => {
    if (!selectedShip || !targetShip) return;

    const weapon = playerShips[selectedShip].weapons.find((w) => w.id === weaponId);
    if (!weapon) return;

    dispatch(attackTarget(weaponId));
    
    // Add log entries
    dispatch(addLogEntry({ 
      message: `${playerShips[selectedShip].name} fires ${weapon.name} at ${targetShip.name} for ${weapon.damage} damage!` 
    }));

    if (enemyShips[targetShip].shields > 0) {
      dispatch(addLogEntry({ 
        message: `${enemyShips[targetShip].name}'s shields absorb part of the damage.` 
      }));
    }

    const updatedTarget = enemyShips[targetShip];
    if (updatedTarget?.destroyed) {
      dispatch(addLogEntry({ 
        message: `${updatedTarget.name} has been destroyed!` 
      }));
    }

    // End player turn after attack
    setTimeout(() => {
      dispatch(endPlayerTurn());
      executeEnemyTurnAction();
    }, 1500);
  };

  const executeEnemyTurnAction = () => {
    // Log enemy attack
    dispatch(addLogEntry({ message: "Enemy fleet is preparing to attack..." }));

    setTimeout(() => {
      dispatch(executeEnemyTurn());
      
      const activeEnemies = enemyShips.filter((ship) => !ship.destroyed);
      if (activeEnemies.length === 0) {
        dispatch(addLogEntry({ 
          message: "Victory! All enemy ships have been destroyed.",
          type: "system" 
        }));
        return;
      }

      const activePlayerShips = playerShips.filter((ship) => !ship.destroyed);
      if (activePlayerShips.length === 0) {
        dispatch(addLogEntry({ 
          message: "Defeat! All your ships have been destroyed.",
          type: "system" 
        }));
        return;
      }
      
      // Add log for player turn
      setTimeout(() => {
        dispatch(addLogEntry({ message: "Your turn to attack" }));
      }, 1500);
    }, 1500);
  };

  const handleEndTurn = () => {
    dispatch(endPlayerTurn());
    executeEnemyTurnAction();
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">
            Orbital Combat - Sirius System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div>
              <span className="font-semibold">Turn: </span>
              <span className={`uppercase ${currentTurn === "player" ? "text-blue-500" : "text-red-500"}`}>
                {currentTurn}
              </span>
              <span className="ml-4 font-semibold">Phase: </span>
              <span className="uppercase">{phase}</span>
            </div>
            <Button 
              variant="destructive" 
              onClick={handleEndTurn}
              disabled={currentTurn !== "player"}
            >
              End Turn
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Player Ships */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Fleet</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {playerShips.map((ship) => (
                  <ShipDisplay 
                    key={ship.id} 
                    ship={ship} 
                    onSelect={() => handleShipSelect(ship)}
                    isActive={playerShips[selectedShip]?.id === ship.id}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {selectedShip && (
            <Card>
              <CardHeader>
                <CardTitle>Ship Details</CardTitle>
              </CardHeader>
              <CardContent>
                <ShipStats ship={playerShips[selectedShip]} />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Middle Column - Battle Map and Combat Controls */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Battle Map</CardTitle>
            </CardHeader>
            <CardContent>
              <BattleMap />
            </CardContent>
          </Card>

          {selectedShip && (
            <Card>
              <CardHeader>
                <CardTitle>Weapons Control</CardTitle>
              </CardHeader>
              <CardContent>
                <WeaponPanel 
                  weapons={playerShips[selectedShip].weapons} 
                  onFireWeapon={handleAttack}
                  disabled={currentTurn !== "player" || !targetShip}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Enemy Ships and Combat Log */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Enemy Fleet</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {enemyShips.map((ship) => (
                  <TargetSelection
                    key={ship.id}
                    ship={ship}
                    onSelect={() => handleTargetSelect(ship)}
                    isSelected={targetShip && enemyShips[targetShip].id === ship.id}
                    disabled={currentTurn !== "player" || ship.destroyed}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="h-96">
            <CardHeader>
              <CardTitle>Combat Log</CardTitle>
            </CardHeader>
            <CardContent>
              <CombatLog entries={combatLogs} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ShipCombat;
