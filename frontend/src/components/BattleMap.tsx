import { Ship } from "../pages/ShipCombat";
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "./ui/hover-card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";

interface BattleMapProps {
  playerShips: Ship[];
  enemyShips: Ship[];
  selectedShip: Ship | null;
  targetShip: Ship | null;
}

const BattleMap = ({ 
  playerShips, 
  enemyShips,
  selectedShip,
  targetShip
}: BattleMapProps) => {
  // Create a 10x6 grid for the battle map
  const gridSize = { x: 10, y: 6 };
  
  // Get all ships on the map
  const allShips = [...playerShips, ...enemyShips];
  
  // Function to render cells
  const renderGrid = () => {
    const cells = [];
    
    for (let y = 0; y < gridSize.y; y++) {
      const row = [];
      
      for (let x = 0; x < gridSize.x; x++) {
        // Check if there's a ship at this position
        const shipAtPosition = allShips.find(
          (ship) => ship.position.x === x && ship.position.y === y
        );
        
        // Determine cell class based on ship presence and selection state
        const cellClass = shipAtPosition
          ? getShipCellClass(shipAtPosition)
          : "bg-card/20";
        
        // Calculate distance if we have selected ship and target
        let distance = null;
        if (selectedShip && shipAtPosition && shipAtPosition.id !== selectedShip.id) {
          distance = calculateDistance(selectedShip.position, shipAtPosition.position);
        }
        
        row.push(
          <div key={`${x}-${y}`} className="relative">
            {shipAtPosition ? (
              <HoverCard>
                <HoverCardTrigger asChild>
                  <div
                    className={`w-full h-full aspect-square rounded-md flex items-center justify-center text-sm font-bold ${cellClass}`}
                  >
                    {shipAtPosition.name.charAt(0)}
                    {shipAtPosition.destroyed && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl text-destructive">X</span>
                      </div>
                    )}
                  </div>
                </HoverCardTrigger>
                <HoverCardContent className="w-64">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold">{shipAtPosition.name}</h3>
                      <Badge variant={shipAtPosition.faction === "Human" ? "default" : "outline"}>
                        {shipAtPosition.faction}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-primary w-14">Hull:</span>
                        <Progress 
                          value={(shipAtPosition.hull / shipAtPosition.maxHull) * 100} 
                          className="h-2" 
                        />
                        <span className="text-xs ml-1 whitespace-nowrap">
                          {shipAtPosition.hull}/{shipAtPosition.maxHull}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-blue-400 w-14">Shields:</span>
                        <Progress 
                          value={(shipAtPosition.shields / shipAtPosition.maxShields) * 100} 
                          className="h-2" 
                        />
                        <span className="text-xs ml-1 whitespace-nowrap">
                          {shipAtPosition.shields}/{shipAtPosition.maxShields}
                        </span>
                      </div>
                    </div>
                    <div className="mt-1">
                      <p className="text-xs text-muted-foreground">
                        Position: {shipAtPosition.position.x},{shipAtPosition.position.y}
                      </p>
                      {distance !== null && (
                        <p className="text-xs text-muted-foreground">
                          Distance from selected: {distance.toFixed(1)} units
                        </p>
                      )}
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
            ) : (
              <div
                className={`w-full h-full aspect-square rounded-sm ${cellClass}`}
              ></div>
            )}
          </div>
        );
      }
      
      cells.push(
        <div key={`row-${y}`} className="flex gap-1">
          {row}
        </div>
      );
    }
    
    return cells;
  };
  
  // Function to determine cell class based on ship properties
  const getShipCellClass = (ship: Ship) => {
    if (ship.destroyed) {
      return "bg-muted/70";
    }
    
    if (ship.faction === "Human") {
      if (selectedShip && ship.id === selectedShip.id) {
        return "bg-primary";
      }
      return "bg-primary/60";
    } else {
      if (targetShip && ship.id === targetShip.id) {
        return "bg-destructive";
      }
      return "bg-destructive/60";
    }
  };
  
  // Calculate distance between two positions
  const calculateDistance = (pos1: { x: number; y: number }, pos2: { x: number; y: number }) => {
    return Math.sqrt(Math.pow(pos2.x - pos1.x, 2) + Math.pow(pos2.y - pos1.y, 2));
  };
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full min-h-[300px] bg-background rounded-lg p-4 bg-[url('/space-background.png')] bg-cover">
        {/* Star field background would be here in a real implementation */}
        <div className="space-y-1">{renderGrid()}</div>
        
        {/* Map legend */}
        <div className="absolute bottom-2 left-2 flex gap-2 items-center text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-sm bg-primary/60 mr-1"></div>
            <span>Your fleet</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-sm bg-destructive/60 mr-1"></div>
            <span>Enemy fleet</span>
          </div>
        </div>
      </div>
      
      {/* Distance indicator if a ship and target are selected */}
      {selectedShip && targetShip && (
        <div className="mt-2 text-sm">
          <span className="text-muted-foreground">Distance to target: </span>
          <span className="font-medium">
            {calculateDistance(selectedShip.position, targetShip.position).toFixed(1)} units
          </span>
        </div>
      )}
    </div>
  );
};

export default BattleMap;
