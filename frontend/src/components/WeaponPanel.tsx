import { Weapon } from "../pages/ShipCombat";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Badge } from "./ui/badge";

interface WeaponPanelProps {
  weapons: Weapon[];
  onFireWeapon: (weaponId: string) => void;
  disabled: boolean;
}

const WeaponPanel = ({ weapons, onFireWeapon, disabled }: WeaponPanelProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Select a weapon to fire</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {weapons.map((weapon) => {
          const onCooldown = weapon.currentCooldown > 0;
          const isDisabled = disabled || onCooldown;
          
          return (
            <TooltipProvider key={weapon.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative">
                    <Button
                      variant="outline"
                      className="w-full h-full justify-between p-3"
                      onClick={() => onFireWeapon(weapon.id)}
                      disabled={isDisabled}
                    >
                      <div className="flex flex-col items-start">
                        <span className="font-bold">{weapon.name}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            DMG: {weapon.damage}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            ACC: {weapon.accuracy}%
                          </Badge>
                        </div>
                      </div>
                      
                      {onCooldown && (
                        <Badge variant="secondary" className="ml-2">
                          CD: {weapon.currentCooldown}
                        </Badge>
                      )}
                    </Button>
                    {onCooldown && (
                      <div className="absolute inset-0 bg-black/40 rounded flex items-center justify-center pointer-events-none">
                        <span className="text-sm font-semibold">Cooling Down</span>
                      </div>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-1">
                    <p className="font-semibold">{weapon.name}</p>
                    <p>Damage: {weapon.damage}</p>
                    <p>Range: {weapon.range} units</p>
                    <p>Accuracy: {weapon.accuracy}%</p>
                    <p>Energy Cost: {weapon.energyCost}</p>
                    <p>Cooldown: {weapon.cooldown} turns</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
      
      {disabled && !weapons.some(w => w.currentCooldown > 0) && (
        <p className="text-muted-foreground text-sm">Select a target to fire weapons</p>
      )}
    </div>
  );
};

export default WeaponPanel;
