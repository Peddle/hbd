import {useRef, useState, useEffect} from "react";
import {useSelector, useDispatch} from "react-redux";
import {gameSlice} from "@/store/slices/gameSlice";
import {Ship} from "../pages/ShipCombat";


const DEBUG = false;

const BattleMap = () => {
  const dispatch = useDispatch();
  const {selectShip, selectTarget, moveShip, rotateShip} = gameSlice.actions;

  const gridWidth = 30;
  const gridHeight = 30;
  const squareSize = 25;

  const playerShips: Ship[] = useSelector((state: any) => state.game.playerShips);
  const enemyShips: Ship[] = useSelector((state: any) => state.game.enemyShips);
  const selectedShipIndex: number | null = useSelector((state: any) => state.game.selectedShip);
  const targetShipIndex: number | null = useSelector((state: any) => state.game.targetShip);

  const selectedShip = selectedShipIndex != null ? playerShips[selectedShipIndex] : null;
  const targetShip = targetShipIndex != null ? enemyShips[targetShipIndex] : null;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({width: 0, height: 0});
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({x: 0, y: 0});
  const [hoverTile, setHoverTile] = useState<[number, number] | null>(null);
  const [scale, setScale] = useState(1);

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
    
    // Prevent wheel event from propagating up to parent elements
    const preventDefault = (e: WheelEvent) => {
      if (containerRef.current && containerRef.current.contains(e.target as Node)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };
    
    // Add passive: false to ensure preventDefault works
    document.addEventListener('wheel', preventDefault, { passive: false });
    
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      document.removeEventListener('wheel', preventDefault);
    };
  }, [mapCenterX, mapCenterY]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setLastMousePos({x: e.clientX, y: e.clientY});
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    // Prevent the default scroll behavior
    e.preventDefault();
    e.stopPropagation();
    
    // Make sure canvas reference exists
    if (!canvasRef.current) return;
    
    // Get mouse position relative to canvas
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Calculate world coordinates before zoom
    const worldX = mouseX + offsetX;
    const worldY = mouseY + offsetY;
    
    // Update scale factor (zoom level)
    const zoomDelta = -e.deltaY * 0.001; // Adjust sensitivity here
    const newScale = Math.max(0.25, Math.min(5, scale + zoomDelta));
    
    // Calculate new offsets to keep the point under the mouse fixed
    if (newScale !== scale) {
      const newOffsetX = worldX - mouseX * (newScale / scale);
      const newOffsetY = worldY - mouseY * (newScale / scale);
      
      setScale(newScale);
      setOffsetX(newOffsetX);
      setOffsetY(newOffsetY);
    }
    
    // Return false to ensure the event doesn't bubble up
    return false;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) * scale + offsetX;
    const y = (e.clientY - rect.top) * scale + offsetY;

    const gridX = Math.floor(x / squareSize) - Math.floor(gridWidth / 2);
    const gridY = Math.floor(y / squareSize) - Math.floor(gridHeight / 2);
    setHoverTile([gridX, gridY]);

    if (isDragging) {
      const dx = e.clientX - lastMousePos.x;
      const dy = e.clientY - lastMousePos.y;
      setLastMousePos({x: e.clientX, y: e.clientY});
      setOffsetX((prev) => prev - dx * scale);
      setOffsetY((prev) => prev - dy * scale);
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(false);

    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) * scale + offsetX;
    const y = (e.clientY - rect.top) * scale + offsetY;

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

      const angleRad = Math.atan2(dx, dy);
      let angleDeg = (angleRad * (180 / Math.PI) + 360) % 360;
      angleDeg = Math.round(angleDeg / 90) * 90;

      const currentFacing = selectedShip.facing ?? 0;
      const rotationDiff = Math.abs(angleDeg - currentFacing) % 360;
      const rotationCost = (rotationDiff / 90) * 1;

      const totalCost = distance + rotationCost;

      if (totalCost <= selectedShip.speedRemaining) {
        if (rotationCost > 0) {
          dispatch(rotateShip({ship: selectedShip, angle: angleDeg, cost: rotationCost}));
        }
        dispatch(moveShip({ship: selectedShip, newPos: [gridX, gridY], cost: distance}));
      }
    }
  };

  const drawShips = (ctx: CanvasRenderingContext2D, ships: Ship[], color: string) => {
    ships.forEach((ship) => {
      const x = ((ship.position.x + Math.floor(gridWidth / 2)) * squareSize - offsetX) / scale;
      const y = ((ship.position.y + Math.floor(gridHeight / 2)) * squareSize - offsetY) / scale;
      const scaledSquareSize = squareSize / scale;
      
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x + scaledSquareSize / 2, y + scaledSquareSize / 2, scaledSquareSize / 3, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  const drawMovementRange = (ctx: CanvasRenderingContext2D) => {
    if (!selectedShip || selectedShip.speedRemaining == null) return;
    const radius = selectedShip.speedRemaining;
    const shipX = selectedShip.position.x;
    const shipY = selectedShip.position.y;

    const min = Math.floor(-radius);
    const max = Math.ceil(radius);
    const scaledSquareSize = squareSize / scale;

    for (let y = min; y <= max; y++) {
      for (let x = min; x <= max; x++) {
        const dist = Math.sqrt(x * x + y * y);
        if (dist <= radius) {
          const gridX = shipX + x;
          const gridY = shipY + y;
          const px = ((gridX + Math.floor(gridWidth / 2)) * squareSize - offsetX) / scale;
          const py = ((gridY + Math.floor(gridHeight / 2)) * squareSize - offsetY) / scale;

          ctx.fillStyle = "rgba(0, 255, 255, 0.125)";
          ctx.fillRect(px, py, scaledSquareSize, scaledSquareSize);
        }
      }
    }
  };

  const drawHoverTile = (ctx: CanvasRenderingContext2D) => {
    if (!selectedShip || selectedShip.speedRemaining == null || !hoverTile) return;
    const [hx, hy] = hoverTile;
    const dx = hx - selectedShip.position.x;
    const dy = hy - selectedShip.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= selectedShip.speedRemaining) {
      const px = ((hx + Math.floor(gridWidth / 2)) * squareSize - offsetX) / scale;
      const py = ((hy + Math.floor(gridHeight / 2)) * squareSize - offsetY) / scale;
      const scaledSquareSize = squareSize / scale;
      
      ctx.strokeStyle = "cyan";
      ctx.lineWidth = 2 / scale; // Adjust line width based on zoom level
      ctx.strokeRect(px, py, scaledSquareSize, scaledSquareSize);
    }
  };

  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
    const scaledSquareSize = squareSize / scale;
    
    // Calculate visible grid cells based on scale
    const startCol = Math.floor((offsetX / scale) / scaledSquareSize);
    const startRow = Math.floor((offsetY / scale) / scaledSquareSize);
    const endCol = Math.ceil(((offsetX / scale) + canvasSize.width) / scaledSquareSize);
    const endRow = Math.ceil(((offsetY / scale) + canvasSize.height) / scaledSquareSize);

    for (let y = startRow; y < endRow; y++) {
      for (let x = startCol; x < endCol; x++) {
        const px = (x * squareSize - offsetX) / scale;
        const py = (y * squareSize - offsetY) / scale;

        const mapX = x - Math.floor(gridWidth / 2);
        const mapY = y - Math.floor(gridHeight / 2);

        if (x < 0 || y < 0 || x >= gridWidth || y >= gridHeight) {
          ctx.fillStyle = "#0f172b55";
          ctx.strokeStyle = "#FFF2";
        } else {
          ctx.fillStyle = "#0005";
          ctx.strokeStyle = "#FFF2";
        }

        ctx.fillRect(px, py, scaledSquareSize, scaledSquareSize);
        ctx.strokeRect(px, py, scaledSquareSize, scaledSquareSize);

        if (DEBUG) {
          ctx.fillStyle = "#888";
          const fontSize = 12 / scale;
          ctx.font = `${fontSize}px sans-serif`;
          ctx.fillText(`${mapX},${mapY}`, px + 4 / scale, py + 14 / scale);
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
      if (ctx) {
        drawGrid(ctx);
      }
    }
  }, [offsetX, offsetY, canvasSize, playerShips, enemyShips, selectedShip, hoverTile]);

  return (
    <div>
      <div
        ref={containerRef}
        style={{width: "100%", height: "100%"}}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <canvas
          ref={canvasRef}
          style={{width: "100%", height: "100%", display: "block", backgroundColor: "transparent"}}
        />
      </div>
    </div>
  );
};

export default BattleMap;
