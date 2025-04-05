import { Ship } from "../pages/ShipCombat";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";

interface ShipStatsProps {
  ship: Ship;
  onFireWeapon?: (weaponId: string) => void;
  disabled?: boolean;
}

const ShipStats = ({ ship, onFireWeapon, disabled = false }: ShipStatsProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">{ship.name}</h3>
        <Badge variant="outline">{ship.faction}</Badge>
      </div>
      
      <Separator />
      
      <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Hull:</span>
          <span className="font-medium">{ship.hull}/{ship.maxHull}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Shields:</span>
          <span className="font-medium">{ship.shields}/{ship.maxShields}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Position:</span>
          <span className="font-medium">{ship.position.x},{ship.position.y}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Status:</span>
          <span className="font-medium">
            {ship.destroyed ? "Destroyed" : ship.selected ? "Active" : "Standby"}
          </span>
        </div>
      </div>
      
      <Separator />
      
      <div>
        <h4 className="font-medium mb-2">Weapons ({ship.weapons.length})</h4>
        <div className="space-y-2">
          {ship.weapons.map((weapon) => (
            <div 
              key={weapon.id} 
              className={`bg-background/50 p-2 rounded-md text-sm ${onFireWeapon && !disabled && weapon.currentCooldown === 0 ? "cursor-pointer hover:bg-muted transition-colors" : ""} ${disabled || weapon.currentCooldown > 0 ? "opacity-70" : ""}`}
              onClick={() => {
                if (onFireWeapon && !disabled && weapon.currentCooldown === 0) {
                  onFireWeapon(weapon.id);
                }
              }}
              title={onFireWeapon && !disabled && weapon.currentCooldown === 0 ? "Click to fire" : undefined}
            >
              <div className="flex justify-between">
                <span className="font-medium">{weapon.name}</span>
                <span className={weapon.currentCooldown > 0 ? "text-yellow-400" : "text-green-400"}>
                  {weapon.currentCooldown > 0 ? `Cooldown: ${weapon.currentCooldown}` : "Ready"}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1 mt-1 text-xs text-muted-foreground">
                <div>DMG: {weapon.damage}</div>
                <div>RNG: {weapon.range}</div>
                <div>ACC: {weapon.accuracy}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShipStats;
