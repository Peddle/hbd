import {useRef, useState, useEffect} from "react";
import {Ship} from "../pages/ShipCombat";

const DEBUG = false;

interface BattleMapProps {
  playerShips: Ship[];
  enemyShips: Ship[];
  selectedShip: Ship | null;
  targetShip: Ship | null;
}



const BattleMap = ({
  playerShips,
  enemyShips,
}: BattleMapProps) => {
  const gridWidth = 30; // number of columns
  const gridHeight = 30; // number of rows
  const squareSize = 25; // pixel size of each square

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({width: 0, height: 0});
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({x: 0, y: 0});

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
    if (isDragging) {
      const dx = e.clientX - lastMousePos.x;
      const dy = e.clientY - lastMousePos.y;
      setLastMousePos({x: e.clientX, y: e.clientY});
      setOffsetX((prev) => prev - dx);
      setOffsetY((prev) => prev - dy);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
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
  }, [offsetX, offsetY, canvasSize, playerShips, enemyShips]);

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

