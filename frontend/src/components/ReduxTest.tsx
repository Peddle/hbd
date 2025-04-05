import { useAppSelector, useAppDispatch } from "../store/hooks";
import { resetGame } from "../store/slices/gameSlice";
import { Button } from "./ui/button";

const ReduxTest = () => {
  const dispatch = useAppDispatch();
  const playerShips = useAppSelector((state) => state.game.playerShips);
  const enemyShips = useAppSelector((state) => state.game.enemyShips);
  
  return (
    <div className="p-4 bg-muted rounded-md">
      <h2 className="text-lg font-bold mb-2">Redux State Test</h2>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <h3 className="font-medium">Player Ships: {playerShips.length}</h3>
          <ul className="text-sm">
            {playerShips.map(ship => (
              <li key={ship.id} className="flex justify-between">
                <span>{ship.name}</span>
                <span>Hull: {ship.hull}/{ship.maxHull}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-medium">Enemy Ships: {enemyShips.length}</h3>
          <ul className="text-sm">
            {enemyShips.map(ship => (
              <li key={ship.id} className="flex justify-between">
                <span>{ship.name}</span>
                <span>Hull: {ship.hull}/{ship.maxHull}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => dispatch(resetGame())}
      >
        Reset Game
      </Button>
    </div>
  );
};

export default ReduxTest;
