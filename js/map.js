export const map = [
    [1,1,1,1,1,1,1,1,1,1,1,1],
    [0,0,0,0,0,0,0,0,1,1,0,1],
    [0,1,1,1,0,1,1,0,0,1,0,1],
    [0,1,0,0,0,0,1,0,0,1,0,1],
    [0,1,0,1,1,0,1,0,0,1,0,1],
    [0,0,0,0,0,0,1,0,0,0,0,1],
    [0,0,0,0,0,0,1,0,1,1,0,1],
    [0,1,1,1,1,0,1,0,1,1,0,1],
    [0,0,0,0,1,0,0,0,0,0,0,1],
    [0,1,0,1,1,0,0,0,1,1,0,1],
    [0,1,0,0,0,0,0,0,0,0,0,1],
    [0,1,0,1,1,1,0,1,1,0,1,1],
    [0,0,0,0,0,0,0,0,0,0,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1]
];

export function drawMap(ctx, tileSize, wallImage, floorImage) {
  for (let row = 0; row < map.length; row++) {
        for (let col = 0; col < map[row].length; col++) {
            const x = col * tileSize;
            const y = row * tileSize;

            if (map[row][col] === 1) {
                ctx.drawImage(wallImage, x, y, tileSize, tileSize);
            } else {
                ctx.drawImage(floorImage, x, y, tileSize, tileSize);
            }
        }
    }
}
