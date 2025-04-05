import { Ship } from "../pages/ShipCombat";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";

interface ShipDisplayProps {
  ship: Ship;
  onSelect: () => void;
  isActive: boolean;
}

const ShipDisplay = ({ ship, onSelect, isActive }: ShipDisplayProps) => {
  if (ship.destroyed) {
    return (
      <Card className="bg-background/50 opacity-50 cursor-not-allowed">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-md bg-card flex items-center justify-center">
              <div className="text-4xl text-destructive">X</div>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <h3 className="font-bold">
                  {ship.name}
                </h3>
                <Badge variant="destructive">Destroyed</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={`hover:border-primary/50 transition-all cursor-pointer ${
        isActive ? "border-primary border-2" : ""
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-md bg-card flex items-center justify-center">
            <span className="text-xl font-bold">{ship.name.charAt(0)}</span>
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center">
              <h3 className="font-bold">
                {ship.name}
              </h3>
              <Badge>{ship.faction}</Badge>
            </div>
            <div className="mt-2 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-primary w-14">Hull:</span>
                <Progress value={(ship.hull / ship.maxHull) * 100} className="h-2" />
                <span className="text-xs ml-1 w-12">
                  {ship.hull}/{ship.maxHull}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-blue-400 w-14">Shields:</span>
                <Progress value={(ship.shields / ship.maxShields) * 100} className="h-2" />
                <span className="text-xs ml-1 w-12">
                  {ship.shields}/{ship.maxShields}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShipDisplay;
