import { useState } from "react";
import ShipDisplay from "../components/ShipDisplay";
import WeaponPanel from "../components/WeaponPanel";
import CombatLog from "../components/CombatLog";
import TargetSelection from "../components/TargetSelection";
import BattleMap from "../components/BattleMap";
import ShipStats from "../components/ShipStats";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
//import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
//import { Separator } from "../components/ui/separator";

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
  const [playerShips, setPlayerShips] = useState<Ship[]>(mockPlayerShips);
  const [enemyShips, setEnemyShips] = useState<Ship[]>(mockEnemyShips);
  const [selectedShip, setSelectedShip] = useState<Ship | null>(mockPlayerShips[0]);
  const [targetShip, setTargetShip] = useState<Ship | null>(null);
  const [combatLogs, setCombatLogs] = useState<LogEntry[]>([
    {
      id: "1",
      message: "Combat initiated with Klackon fleet",
      timestamp: Date.now(),
      type: "system",
    },
    {
      id: "2",
      message: "Your turn to attack",
      timestamp: Date.now(),
      type: "info",
    },
  ]);
  const [currentTurn, setCurrentTurn] = useState<"player" | "enemy">("player");
  const [phase, setPhase] = useState<"move" | "attack" | "end">("attack");

  const handleShipSelect = (ship: Ship) => {
    const updatedPlayerShips = playerShips.map((s) => ({
      ...s,
      selected: s.id === ship.id,
    }));
    setPlayerShips(updatedPlayerShips);
    setSelectedShip(ship);
    addLogEntry(`Selected ${ship.name} for combat actions`);
  };

  const handleTargetSelect = (ship: Ship) => {
    setTargetShip(ship);
    addLogEntry(`Targeting enemy vessel ${ship.name}`);
  };

  const handleAttack = (weaponId: string) => {
    if (!selectedShip || !targetShip) return;

    const weapon = selectedShip.weapons.find((w) => w.id === weaponId);
    if (!weapon) return;

    // Simulate attack
    const hitRoll = Math.random() * 100;
    const hit = hitRoll <= weapon.accuracy;

    if (hit) {
      // Calculate damage
      const damage = weapon.damage;
      const updatedEnemyShips = enemyShips.map((ship) => {
        if (ship.id === targetShip.id) {
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
          
          return {
            ...ship,
            shields: newShields,
            hull: newHull,
            destroyed,
          };
        }
        return ship;
      });

      setEnemyShips(updatedEnemyShips);
      addLogEntry(
        `${selectedShip.name} fires ${weapon.name} at ${targetShip.name} for ${damage} damage!`
      );

      if (targetShip.shields > 0) {
        addLogEntry(
          `${targetShip.name}'s shields absorb part of the damage.`
        );
      }

      const updatedTarget = updatedEnemyShips.find(
        (ship) => ship.id === targetShip.id
      );
      if (updatedTarget?.destroyed) {
        addLogEntry(`${targetShip.name} has been destroyed!`);
      }
    } else {
      addLogEntry(
        `${selectedShip.name} fires ${weapon.name} at ${targetShip.name} but misses!`
      );
    }

    // Update weapon cooldown
    const updatedPlayerShips = playerShips.map((ship) => {
      if (ship.id === selectedShip.id) {
        const updatedWeapons = ship.weapons.map((w) =>
          w.id === weaponId
            ? { ...w, currentCooldown: w.cooldown }
            : w
        );
        return { ...ship, weapons: updatedWeapons };
      }
      return ship;
    });

    setPlayerShips(updatedPlayerShips);

    // End player turn after attack
    setTimeout(() => {
      setCurrentTurn("enemy");
      setPhase("attack");
      executeEnemyTurn();
    }, 1500);
  };

  const executeEnemyTurn = () => {
    // Simulate enemy attack
    addLogEntry("Enemy fleet is preparing to attack...");

    setTimeout(() => {
      const activeEnemies = enemyShips.filter((ship) => !ship.destroyed);
      if (activeEnemies.length === 0) {
        addLogEntry("Victory! All enemy ships have been destroyed.");
        return;
      }

      const activePlayerShips = playerShips.filter((ship) => !ship.destroyed);
      if (activePlayerShips.length === 0) {
        addLogEntry("Defeat! All your ships have been destroyed.");
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
        const updatedPlayerShips = playerShips.map((ship) => {
          if (ship.id === randomPlayerShip.id) {
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
            
            return {
              ...ship,
              shields: newShields,
              hull: newHull,
              destroyed,
            };
          }
          return ship;
        });

        setPlayerShips(updatedPlayerShips);
        addLogEntry(
          `${randomEnemyShip.name} fires ${enemyWeapon.name} at ${randomPlayerShip.name} for ${damage} damage!`
        );

        if (randomPlayerShip.shields > 0) {
          addLogEntry(
            `${randomPlayerShip.name}'s shields absorb part of the damage.`
          );
        }

        const updatedTarget = updatedPlayerShips.find(
          (ship) => ship.id === randomPlayerShip.id
        );
        if (updatedTarget?.destroyed) {
          addLogEntry(`${randomPlayerShip.name} has been destroyed!`);
        }
      } else {
        addLogEntry(
          `${randomEnemyShip.name} fires ${enemyWeapon.name} at ${randomPlayerShip.name} but misses!`
        );
      }

      // End enemy turn
      setTimeout(() => {
        setCurrentTurn("player");
        setPhase("attack");
        
        // Reduce cooldowns for player weapons
        const updatedPlayerShips = playerShips.map((ship) => {
          const updatedWeapons = ship.weapons.map((w) => ({
            ...w,
            currentCooldown: Math.max(0, w.currentCooldown - 1),
          }));
          return { ...ship, weapons: updatedWeapons };
        });
        setPlayerShips(updatedPlayerShips);

        addLogEntry("Your turn to attack");
      }, 1500);
    }, 1500);
  };

  const addLogEntry = (message: string, type: LogEntry["type"] = "info") => {
    setCombatLogs((prevLogs) => [
      {
        id: Date.now().toString(),
        message,
        timestamp: Date.now(),
        type,
      },
      ...prevLogs,
    ]);
  };

  const handleEndTurn = () => {
    setCurrentTurn("enemy");
    executeEnemyTurn();
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
                    isActive={selectedShip?.id === ship.id}
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
                <ShipStats ship={selectedShip} />
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
              <BattleMap 
                playerShips={playerShips} 
                enemyShips={enemyShips}
                selectedShip={selectedShip}
                targetShip={targetShip}
              />
            </CardContent>
          </Card>

          {selectedShip && (
            <Card>
              <CardHeader>
                <CardTitle>Weapons Control</CardTitle>
              </CardHeader>
              <CardContent>
                <WeaponPanel 
                  weapons={selectedShip.weapons} 
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
                    isSelected={targetShip?.id === ship.id}
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
