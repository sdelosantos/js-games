export const Directions = {
  LEFT: "LEFT",
  RIGHT: "RIGHT",
  TOP: "TOP",
  BOTTOM: "BOTTOM",
};
export const CollisionTypes = {
  GAME_OBJECT: "GAME_OBJECT",
  BOUNDARY_COLLISION: "BOUNDARY_COLLISION",
  ALLOCATED_BOARD_SPACE: "ALLOCATED_BOARD_SPACE",
};
/**
 *
 * @param {Number[][]} poligonArray
 * @param {Number} positionX
 * @param {Number} positionY
 * @returns {Array<{x: Number; y: Number;}>}
 */
function getCollisionBox(poligonArray, positionX, positionY) {
  const box = [];

  poligonArray.forEach((row, polyY) => {
    row.forEach((value, polyX) => {
      if (value) {
        const x = polyX + positionX + 1;
        const y = polyY + positionY + 1;
        box.push({ x, y });
      }
    });
  });

  return box;
}
const processCollisionData = (collisionStore, collisionData) => {
  const collisiones = [...collisionStore];
  const previewCollisionIndex = collisiones.findIndex(
    (col) => col.side === collisionData.side
  );
  if (previewCollisionIndex >= 0) {
    const currentCoor = collisiones[previewCollisionIndex].coor;
    collisiones[previewCollisionIndex].coor = [
      ...currentCoor,
      ...collisionData.coor,
    ];
  } else {
    collisiones.push(collisionData);
  }
  return collisiones;
};
const getCollisionData = (x, y, collisionType) => {
  return (side) => {
    return {
      side,
      collisionType,
      coor: [{ x, y }],
    };
  };
};

export function boundaryCollisionDetection({
  poligonObject,
  poligonPositionX,
  poligonPositionY,
  sceneWidth: rightBoundary,
  sceneHeight: bottonBoundary,
}) {
  const leftBoundary = 0;
  const topBoundary = 0;
  let collisiones = [];

  const poligonBox = getCollisionBox(
    poligonObject,
    poligonPositionX,
    poligonPositionY
  );

  for (const { x, y } of poligonBox) {
    const fn = getCollisionData(x, y, CollisionTypes.BOUNDARY_COLLISION);

    if (x <= leftBoundary || poligonPositionX <= leftBoundary) {
      collisiones = processCollisionData(collisiones, fn(Directions.LEFT));
    }
    if (x >= rightBoundary || poligonPositionX >= rightBoundary) {
      collisiones = processCollisionData(collisiones, fn(Directions.RIGHT));
    }
    if (y <= topBoundary || poligonPositionY <= topBoundary) {
      collisiones = processCollisionData(collisiones, fn(Directions.TOP));
    }
    if (y >= bottonBoundary || poligonPositionY >= bottonBoundary) {
      collisiones = processCollisionData(collisiones, fn(Directions.BOTTOM));
    }
  }
  return collisiones;
}
export function allocatedSpaceCollisionDetection({
  boardArray,
  poligonObject,
  poligonPositionX,
  poligonPositionY,
}) {
  const poligonBox = getCollisionBox(
    poligonObject,
    poligonPositionX,
    poligonPositionY
  );
  let collisiones = [];

  for (const { x, y } of poligonBox) {
    const fn = getCollisionData(x, y, CollisionTypes.ALLOCATED_BOARD_SPACE);
    if (boardArray[y] && boardArray[y][x - 1]) {
      collisiones = processCollisionData(collisiones, fn(null));
    }
  }
  return collisiones;
}
