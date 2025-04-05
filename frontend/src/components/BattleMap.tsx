import {useRef, useState, useEffect} from "react";
import {useSelector, useDispatch} from "react-redux";
import {gameSlice} from "@/store/slices/gameSlice";
import {Ship} from "../pages/ShipCombat";


const DEBUG = false;

const BattleMap = () => {
  const dispatch = useDispatch();
  const {selectShip, selectTarget, moveShip} = gameSlice.actions;

  const gridWidth = 30;
  const gridHeight = 30;
  const squareSize = 25;

  const playerShips: Ship[] = useSelector((state: any) => state.game.playerShips);
  const enemyShips: Ship[] = useSelector((state: any) => state.game.enemyShips);
  const selectedShipIndex: number | null = useSelector((state: any) => state.game.selectedShip);
  const targetShipIndex: number | null = useSelector((state: any) => state.game.targetShip);

  const selectedShip = selectedShipIndex != null ? playerShips[selectedShipIndex] : null;
  const targetShip = targetShipIndex != null ? enemyShips[targetShipIndex] : null;

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({width: 0, height: 0});
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({x: 0, y: 0});
  const [hoverTile, setHoverTile] = useState<[number, number] | null>(null);

  const mapCenterX = Math.floor(gridWidth / 2) * squareSize;
  const mapCenterY = Math.floor(gridHeight / 2) * squareSize;

  useEffect(() => {
    const resizeCanvas = () => {
      if (containerRef.current) {
        const {clientWidth, clientHeight} = containerRef.current;
        setCanvasSize({width: clientWidth, height: clientHeight});
        setOffsetX(mapCenterX - clientWidth / 2);
        setOffsetY(mapCenterY - clientHeight / 2);
      }
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [mapCenterX, mapCenterY]);

  const handleMouseDown = (e: MouseEvent) => {
    setIsDragging(true);
    setLastMousePos({x: e.clientX, y: e.clientY});
  };

  const handleMouseMove = (e: MouseEvent) => {
    const rect = (canvasRef.current as HTMLCanvasElement).getBoundingClientRect();
    const x = e.clientX - rect.left + offsetX;
    const y = e.clientY - rect.top + offsetY;

    const gridX = Math.floor(x / squareSize) - Math.floor(gridWidth / 2);
    const gridY = Math.floor(y / squareSize) - Math.floor(gridHeight / 2);
    setHoverTile([gridX, gridY]);

    if (isDragging) {
      const dx = e.clientX - lastMousePos.x;
      const dy = e.clientY - lastMousePos.y;
      setLastMousePos({x: e.clientX, y: e.clientY});
      setOffsetX((prev) => prev - dx);
      setOffsetY((prev) => prev - dy);
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(false);

    const rect = (canvasRef.current as HTMLCanvasElement).getBoundingClientRect();
    const x = e.clientX - rect.left + offsetX;
    const y = e.clientY - rect.top + offsetY;

    const gridX = Math.floor(x / squareSize) - Math.floor(gridWidth / 2);
    const gridY = Math.floor(y / squareSize) - Math.floor(gridHeight / 2);

    const clickedPlayerIndex = playerShips.findIndex(
      (ship) => ship.position.x === gridX && ship.position.y === gridY
    );
    if (clickedPlayerIndex !== -1) {
      dispatch(selectShip(clickedPlayerIndex));
      return;
    }

    const clickedEnemyIndex = enemyShips.findIndex(
      (ship) => ship.position.x === gridX && ship.position.y === gridY
    );
    if (clickedEnemyIndex !== -1) {
      dispatch(selectTarget(clickedEnemyIndex));
      return;
    }

    if (selectedShip && selectedShip.speedRemaining != null) {
      const dx = gridX - selectedShip.position.x;
      const dy = gridY - selectedShip.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance <= selectedShip.speedRemaining) {
        dispatch(moveShip({ship: selectedShip, newPos: [gridX, gridY], cost: distance}));
      }
    }
  };

  const drawShips = (ctx, ships, color) => {
    ships.forEach((ship) => {
      const x = (ship.position.x + Math.floor(gridWidth / 2)) * squareSize - offsetX;
      const y = (ship.position.y + Math.floor(gridHeight / 2)) * squareSize - offsetY;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x + squareSize / 2, y + squareSize / 2, squareSize / 3, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  const drawMovementRange = (ctx) => {
    if (!selectedShip || selectedShip.speedRemaining == null) return;
    const radius = selectedShip.speedRemaining;
    const shipX = selectedShip.position.x;
    const shipY = selectedShip.position.y;

    for (let y = -radius; y <= radius; y++) {
      for (let x = -radius; x <= radius; x++) {
        const dist = Math.sqrt(x * x + y * y);
        if (dist <= radius) {
          const gridX = shipX + x;
          const gridY = shipY + y;
          const px = (gridX + Math.floor(gridWidth / 2)) * squareSize - offsetX;
          const py = (gridY + Math.floor(gridHeight / 2)) * squareSize - offsetY;

          ctx.fillStyle = "rgba(0, 255, 255, 0.2)";
          ctx.fillRect(px, py, squareSize, squareSize);
        }
      }
    }
  };

  const drawHoverTile = (ctx) => {
    if (!selectedShip || selectedShip.speedRemaining == null || !hoverTile) return;
    const [hx, hy] = hoverTile;
    const dx = hx - selectedShip.position.x;
    const dy = hy - selectedShip.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= selectedShip.speedRemaining) {
      const px = (hx + Math.floor(gridWidth / 2)) * squareSize - offsetX;
      const py = (hy + Math.floor(gridHeight / 2)) * squareSize - offsetY;
      ctx.strokeStyle = "cyan";
      ctx.lineWidth = 2;
      ctx.strokeRect(px, py, squareSize, squareSize);
    }
  };

  const drawGrid = (ctx) => {
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
    const startCol = Math.floor(offsetX / squareSize);
    const startRow = Math.floor(offsetY / squareSize);
    const endCol = Math.ceil((offsetX + canvasSize.width) / squareSize);
    const endRow = Math.ceil((offsetY + canvasSize.height) / squareSize);

    for (let y = startRow; y < endRow; y++) {
      for (let x = startCol; x < endCol; x++) {
        const px = x * squareSize - offsetX;
        const py = y * squareSize - offsetY;

        const mapX = x - Math.floor(gridWidth / 2);
        const mapY = y - Math.floor(gridHeight / 2);

        if (x < 0 || y < 0 || x >= gridWidth || y >= gridHeight) {
          ctx.fillStyle = "#eee";
          ctx.strokeStyle = "#ccc";
        } else {
          ctx.fillStyle = "#222";
          ctx.strokeStyle = "#444";
        }

        ctx.fillRect(px, py, squareSize, squareSize);
        ctx.strokeRect(px, py, squareSize, squareSize);

        if (DEBUG) {
          ctx.fillStyle = "#888";
          ctx.font = "12px sans-serif";
          ctx.fillText(`${mapX},${mapY}`, px + 4, py + 14);
        }
      }
    }

    drawMovementRange(ctx);
    drawHoverTile(ctx);
    drawShips(ctx, playerShips, "#0f0");
    drawShips(ctx, enemyShips, "#f00");
  };

  useEffect(() => {
    if (canvasRef.current && canvasSize.width && canvasSize.height) {
      const canvas = canvasRef.current as HTMLCanvasElement;
      canvas.width = canvasSize.width;
      canvas.height = canvasSize.height;
      const ctx = canvas.getContext("2d");
      drawGrid(ctx);
    }
  }, [offsetX, offsetY, canvasSize, playerShips, enemyShips, selectedShip, hoverTile]);

  return (
    <div>
      <div
        ref={containerRef}
        style={{width: "100%", height: "500px"}}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <canvas
          ref={canvasRef}
          style={{width: "100%", height: "100%", display: "block", backgroundColor: "#111"}}
        />
      </div>
    </div>
  );
};

export default BattleMap;
