import {useRef, useState, useEffect} from "react";
import {useSelector, useDispatch} from "react-redux";
import {gameSlice} from "@/store/slices/gameSlice";
import {Ship} from "../pages/ShipCombat";
import shipImage from "../assets/ship1.png";

const DEBUG = false;
const rotationCostMult = 3;
const ROTATION_LOCK_DEGREES = 5; //speed per 90 degrees


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
  // Initialize with null values that will be properly set once the container is measured
  // These will be calculated properly after initialization
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({x: 0, y: 0});
  const [hoverTile, setHoverTile] = useState<[number, number] | null>(null);
  const [scale, setScale] = useState(0.3);
  const scaledSquareSize = squareSize / scale;

  const mapCenterX = Math.floor(gridWidth / 2) * squareSize;
  const mapCenterY = Math.floor(gridHeight / 2) * squareSize;

  // Initial centering effect that runs once on mount
  useEffect(() => {
    if (containerRef.current) {
      const {clientWidth, clientHeight} = containerRef.current;
      setCanvasSize({width: clientWidth, height: clientHeight});

      // Center the map initially - the key is to NOT apply scale to the width/height here
      // because we want offsetX/Y to be in world coordinates (before scaling)
      setOffsetX(mapCenterX - (clientWidth / 2) * scale);
      setOffsetY(mapCenterY - (clientHeight / 2) * scale);
    }
  }, []);  // Empty dependency array means this only runs once on mount

  // Handle window resize separately
  useEffect(() => {
    const resizeCanvas = () => {
      if (containerRef.current) {
        const {clientWidth, clientHeight} = containerRef.current;
        setCanvasSize({width: clientWidth, height: clientHeight});

        // Keep the center point when resizing
        setOffsetX(mapCenterX - (clientWidth / 2) * scale);
        setOffsetY(mapCenterY - (clientHeight / 2) * scale);
      }
    };

    window.addEventListener("resize", resizeCanvas);

    // Prevent wheel event from propagating up to parent elements and prevent overscrolling
    const preventDefault = (e: WheelEvent) => {
      // Prevent overscrolling and bouncing effects globally
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    // Prevent touchmove events that could cause overscrolling
    const preventTouchMove = (e: TouchEvent) => {
      if (containerRef.current && containerRef.current.contains(e.target as Node)) {
        // Only prevent default if we're already at the edge of scrolling
        const el = e.target as HTMLElement;
        const isAtTop = el.scrollTop <= 0;
        const isAtBottom = el.scrollTop + el.clientHeight >= el.scrollHeight;

        if (isAtTop || isAtBottom) {
          e.preventDefault();
        }
      }
    };

    // Add passive: false to ensure preventDefault works
    document.addEventListener('wheel', preventDefault, {passive: false});
    document.addEventListener('touchmove', preventTouchMove, {passive: false});

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      document.removeEventListener('wheel', preventDefault);
      document.removeEventListener('touchmove', preventTouchMove);
    };
  }, [mapCenterX, mapCenterY]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button == 0) {
      setLastMousePos({x: e.clientX, y: e.clientY});
      //setIsDragging(true);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    // Prevent the default scroll behavior
    e.preventDefault();
    e.stopPropagation();

    // Make sure canvas reference exists
    if (!canvasRef.current) return;

    // Get center of the viewport/canvas
    const rect = canvasRef.current.getBoundingClientRect();
    const viewportCenterX = rect.width / 2;
    const viewportCenterY = rect.height / 2;

    // Calculate world coordinates of the center point
    const worldCenterX = viewportCenterX * scale + offsetX;
    const worldCenterY = viewportCenterY * scale + offsetY;

    // Update scale factor (zoom level) - inverted scroll direction
    const zoomDelta = e.deltaY * 0.001; // Inverted (positive) for reversed zoom direction
    const newScale = Math.max(0.1, Math.min(1.25, scale + zoomDelta)); // Limit minimum scale to 0.6 for reasonable zoom out

    if (newScale !== scale) {
      // Calculate new offsets to keep the world center point fixed at the viewport center
      const newOffsetX = worldCenterX - viewportCenterX * newScale;
      const newOffsetY = worldCenterY - viewportCenterY * newScale;

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
    const {x, y} = getWorldCoords(e, rect, scale, offsetX, offsetY);

    const gridX = Math.floor(x / squareSize) - Math.floor(gridWidth / 2);
    const gridY = Math.floor(y / squareSize) - Math.floor(gridHeight / 2);
    setHoverTile([gridX, gridY]);

    if (e.buttons === 1) {
      if (e.clientX !== lastMousePos.x || e.clientY !== lastMousePos.y) {
        setIsDragging(true);
      }
      if (isDragging) {
        const dx = e.clientX - lastMousePos.x;
        const dy = e.clientY - lastMousePos.y;
        setOffsetX(prev => prev - dx * scale);
        setOffsetY(prev => prev - dy * scale);
        setLastMousePos({x: e.clientX, y: e.clientY});
      }
    };
  }
  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(false);
    if (isDragging) {return;} //no triggers if dragging
    if (e.button !== 0) return; //left mouse handler

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
      if (gridX < -Math.floor(gridWidth / 2) || gridX >= Math.ceil(gridWidth / 2) ||
          gridY < -Math.floor(gridHeight / 2) || gridY >= Math.ceil(gridHeight / 2)) {
        return;
      }
      const dx = gridX - selectedShip.position.x;
      const dy = gridY - selectedShip.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      let angleDeg = Math.round(getAngleDeg(dx, dy) / ROTATION_LOCK_DEGREES) * ROTATION_LOCK_DEGREES ;

      const currentFacing = selectedShip.facing ?? 0;
      let rotationDiff = getRotationDiff(currentFacing, angleDeg);
      const rotationCost = rotationDiff / 90 * rotationCostMult;

      const totalCost = distance + rotationCost;

      if (totalCost <= selectedShip.speedRemaining) {
        dispatch(rotateShip({ship: selectedShip, angle: angleDeg, cost: rotationCost}));
        dispatch(moveShip({ship: selectedShip, newPos: [gridX, gridY], cost: distance}));
      }
    }
  };

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!canvasRef.current || !selectedShip) return;
    handleShipRotation(e);
  };

  const handleShipRotation = (e: React.MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    if (selectedShip) {
      const {x, y} = getWorldCoords(e, rect, scale, offsetX, offsetY);

      const shipX = (selectedShip.position.x + Math.floor(gridWidth / 2)) * squareSize;
      const shipY = (selectedShip.position.y + Math.floor(gridHeight / 2)) * squareSize;
      const shipCenterX = shipX + squareSize / 2;
      const shipCenterY = shipY + squareSize / 2;

      const dx = x - shipCenterX;
      const dy = y - shipCenterY;

      let angleDeg = getAngleDeg(dx, dy);
      const currentFacing = selectedShip.facing ?? 0;

      let rotationDiff = (angleDeg - currentFacing + 360) % 360;
      if (rotationDiff > 180) rotationDiff -= 360;

      const rotationMagnitude = Math.abs(rotationDiff);
      const maxPossibleRotation = selectedShip.speedRemaining * 90 / rotationCostMult;
      const clampedRotation = Math.max(Math.min(rotationMagnitude, maxPossibleRotation), 0);
      const newFacing = (currentFacing + Math.sign(rotationDiff) * clampedRotation + 360) % 360;
      const actualCost = clampedRotation / 90 * rotationCostMult;
      
      if (actualCost > selectedShip.speedRemaining) {
        console.warn("Rotation cost exceeds remaining speed", actualCost);
      }
      dispatch(gameSlice.actions.rotateShip({ship: selectedShip, angle: newFacing, cost: actualCost}));
    }
  };

  const getWorldCoords = (e: MouseEvent | React.MouseEvent, rect: DOMRect, scale: number, offsetX: number, offsetY: number) => {
    const x = (e.clientX - rect.left) * scale + offsetX;
    const y = (e.clientY - rect.top) * scale + offsetY;
    return {x, y};
  };

  const getAngleDeg = (dx: number, dy: number) => {
    return (Math.round(Math.atan2(dy, dx) * (180 / Math.PI) / ROTATION_LOCK_DEGREES) * ROTATION_LOCK_DEGREES + 360) % 360;
  };

  const getRotationDiff = (from: number, to: number) => {
    let diff = Math.abs(to - from) % 360;
    return diff > 180 ? 360 - diff : diff;
  };

  const getRotationCost = (from: number, to: number, costMultiplier: number = 1) => {
    const diff = getRotationDiff(from, to);
    return (diff / 90) * costMultiplier;
  };

  

  const drawShipSprite = (ctx, x: number, y: number, size: number, color, facing = 0) => {
    const cx = x + size / 2;
    const cy = y + size / 2;

    // Create a ship image if it doesn't exist
    const img = new Image();
    img.src = shipImage;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(((facing + 90) * Math.PI) / 180);

    // Add colored underglow (blue for human, red for enemy)
    const baseGlowColor = color === "#0f0" ? "0, 100, 255" : "255, 30, 30";

    // Create multiple layers of glow for a more blurred effect (30% smaller)
    for (let i = 4; i >= 0; i--) {
      const opacity = 0.3 - (i * 0.05);
      // Reduce radius by 30%
      const radius = (size / 2 + (i * size * 0.1)) * 0.7;

      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${baseGlowColor}, ${opacity})`;
      ctx.fill();
    }

    // Add an extra shadow blur (30% smaller)
    ctx.shadowColor = `rgba(${baseGlowColor}, 0.6)`;
    ctx.shadowBlur = size * 0.56; // 0.8 * 0.7
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Reset shadow for the ship image
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;

    // Draw the ship image
    // Center the image and scale appropriately
    const imageSize = size * 0.8; // Adjust size as needed
    ctx.drawImage(img, -imageSize / 2, -imageSize / 2, imageSize, imageSize);

    ctx.restore();
  };

  const drawShips = (ctx, ships: Ship[], color) => {
    ships.forEach((ship: Ship) => {
      const {x, y} = ship.position;
      const px = ((x + Math.floor(gridWidth / 2)) * squareSize - offsetX) / scale;
      const py = ((y + Math.floor(gridHeight / 2)) * squareSize - offsetY) / scale;
      // Pass blue for player ships, red for enemy ships
      drawShipSprite(ctx, px, py, squareSize / scale, color, ship.facing);
    });
  };

  const drawMovementRange = (ctx: CanvasRenderingContext2D) => {
    if (!selectedShip || selectedShip.speedRemaining == null) return;
    const maxRange = selectedShip.speedRemaining;
    const shipX = selectedShip.position.x;
    const shipY = selectedShip.position.y;
    const currentFacing = selectedShip.facing ?? 0;

    const min = Math.floor(-maxRange);
    const max = Math.ceil(maxRange);

    for (let y = min; y <= max; y++) {
      for (let x = min; x <= max; x++) {
        const dist = Math.sqrt(x * x + y * y);
        if (dist === 0 || dist > maxRange) continue;

        let angleDeg = getAngleDeg(x, y)

        const rotationCost = getRotationCost(currentFacing, angleDeg, rotationCostMult);

        const totalCost = dist + rotationCost;
        if (totalCost <= maxRange) {
          const gridX = shipX + x;
          const gridY = shipY + y;
          if (gridX < -Math.floor(gridWidth / 2) || gridX >= Math.ceil(gridWidth / 2) ||
              gridY < -Math.floor(gridHeight / 2) || gridY >= Math.ceil(gridHeight / 2)) {
            continue;
          }
          const px = ((gridX + Math.floor(gridWidth / 2)) * squareSize - offsetX) / scale;
          const py = ((gridY + Math.floor(gridHeight / 2)) * squareSize - offsetY) / scale;

          ctx.fillStyle = "rgba(0, 255, 255, 0.125)";
          ctx.fillRect(px, py, scaledSquareSize, scaledSquareSize);
        }
      }
    }
  };

  const drawHoverTile = (ctx: CanvasRenderingContext2D) => {
    if (!hoverTile) return;
    const [hx, hy] = hoverTile;
    const px = ((hx + Math.floor(gridWidth / 2)) * squareSize - offsetX) / scale;
    const py = ((hy + Math.floor(gridHeight / 2)) * squareSize - offsetY) / scale;

    const isEnemy = enemyShips.some((ship) => ship.position.x === hx && ship.position.y === hy);

    if (isEnemy) {
      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
      ctx.strokeRect(px, py, scaledSquareSize, scaledSquareSize);
      return;
    }

    if (!selectedShip || selectedShip.speedRemaining == null) return;
    const dx = hx - selectedShip.position.x;
    const dy = hy - selectedShip.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const angleRad = Math.atan2(dy, dx);
    let angleDeg = (angleRad * (180 / Math.PI) + 360) % 360;

    const currentFacing = selectedShip.facing ?? 0;
    let rotationDiff = Math.abs(angleDeg - currentFacing) % 360;
    if (rotationDiff > 180) rotationDiff = 360 - rotationDiff;
    const rotationCost = rotationDiff / 90 * rotationCostMult;

    const totalCost = distance + rotationCost;

    if (totalCost <= selectedShip.speedRemaining) {
      ctx.strokeStyle = "cyan";
      ctx.lineWidth = 2 / scale; // Adjust line width based on zoom level
      ctx.strokeRect(px, py, scaledSquareSize, scaledSquareSize);
    }
  };

  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    const QUADRANT_LINE_LENGTH = 300 * scaledSquareSize;
    const drawQuadrantLines = () => {
      const drawLines = (ship: Ship, length: number, color: string) => {
        const {x, y} = ship.position;
        const centerX = ((x + Math.floor(gridWidth / 2)) * squareSize - offsetX) / scale + squareSize / (2 * scale);
        const centerY = ((y + Math.floor(gridHeight / 2)) * squareSize - offsetY) / scale + squareSize / (2 * scale);

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(((ship.facing + 90) * Math.PI) / 180);

        ctx.strokeStyle = color;
        ctx.lineWidth = 1 / scale;

        // Diagonal line from top-left to bottom-right
        ctx.beginPath();
        ctx.moveTo(-length, -length);
        ctx.lineTo(length, length);
        ctx.stroke();

        // Diagonal line from top-right to bottom-left
        ctx.beginPath();
        ctx.moveTo(length, -length);
        ctx.lineTo(-length, length);
        ctx.stroke();

        ctx.restore();
      };

      if (selectedShip) {
        drawLines(selectedShip, QUADRANT_LINE_LENGTH, "rgba(43, 255, 0, 0.37)");
      }

      if (targetShip) {
        drawLines(targetShip, 1 * scaledSquareSize, "rgba(255, 0, 0, 0.6)");
      }
    };

    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);

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
          ctx.strokeStyle = "#2e294e";
        } else {
          ctx.fillStyle = "#0005";
          ctx.strokeStyle = "#2e294e";
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
    drawQuadrantLines();
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
  }, [offsetX, offsetY, canvasSize, playerShips, enemyShips, selectedShip, hoverTile, scale]);

  return (
    <div>
      <div
        ref={containerRef}
        style={{width: "100%", height: "100%"}}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onContextMenu={(e) => handleRightClick(e)}
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
