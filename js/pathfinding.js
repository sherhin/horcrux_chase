export function findPath(startCol, startRow, endCol, endRow, map) {
    const openList = [{ col: startCol, row: startRow, g: 0, h: heuristic(startCol, startRow, endCol, endRow), parent: null }];
    const closedList = [];

    while (openList.length > 0) {
        openList.sort((a, b) => (a.g + a.h) - (b.g + b.h));
        const current = openList.shift();
        closedList.push(current);

        if (current.col === endCol && current.row === endRow) {
            const path = [];
            let node = current;
            while (node.parent) {
                path.unshift(node);
                node = node.parent;
            }
            return path;
        }

        const neighbors = [
            { col: current.col + 1, row: current.row },
            { col: current.col - 1, row: current.row },
            { col: current.col, row: current.row + 1 },
            { col: current.col, row: current.row - 1 }
        ];

        for (const neighbor of neighbors) {
            if (map[neighbor.row]?.[neighbor.col] === 0 &&
                !closedList.find(n => n.col === neighbor.col && n.row === neighbor.row)) {
                if (!openList.find(n => n.col === neighbor.col && n.row === neighbor.row)) {
                    openList.push({
                        col: neighbor.col,
                        row: neighbor.row,
                        g: current.g + 1,
                        h: heuristic(neighbor.col, neighbor.row, endCol, endRow),
                        parent: current
                    });
                }
            }
        }
    }
    return [];
}

function heuristic(c, r, ec, er) {
    return Math.abs(c - ec) + Math.abs(r - er);
}
