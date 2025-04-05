export const getArc = (angle: number) => {
  if (angle >= 315 || angle < 45) return 'front';
  else if (angle >= 45 && angle < 135) return 'right';
  else if (angle >= 135 && angle < 225) return 'back';
  else if (angle >= 225 && angle < 315) return 'left';
  else return 'front';
}