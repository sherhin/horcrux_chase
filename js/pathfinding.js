class MinHeap {
  constructor() {
    this.heap = [];
  }
  size() {
    return this.heap.length;
  }
  push(node) {
    this.heap.push(node);
    this._bubbleUp(this.heap.length - 1);
  }
  pop() {
    if (this.heap.length === 1) return this.heap.pop();
    const top = this.heap[0];
    this.heap[0] = this.heap.pop();
    this._bubbleDown(0);
    return top;
  }
  _bubbleUp(index) {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if ((this.heap[index].g + this.heap[index].h) >= (this.heap[parent].g + this.heap[parent].h)) break;
      [this.heap[index], this.heap[parent]] = [this.heap[parent], this.heap[index]];
      index = parent;
    }
  }
  _bubbleDown(index) {
    const length = this.heap.length;
    while (true) {
      let left = 2 * index + 1;
      let right = 2 * index + 2;
      let smallest = index;
      if (
        left < length &&
        (this.heap[left].g + this.heap[left].h) < (this.heap[smallest].g + this.heap[smallest].h)
      ) {
        smallest = left;
      }
      if (
        right < length &&
        (this.heap[right].g + this.heap[right].h) < (this.heap[smallest].g + this.heap[smallest].h)
      ) {
        smallest = right;
      }
      if (smallest === index) break;
      [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
      index = smallest;
    }
  }
}

export function findPath(startCol, startRow, endCol, endRow, map) {
  return new Promise(resolve => {
    const openHeap = new MinHeap();
    const openSet = new Map();
    const closedSet = new Set();

    const startNode = {
      col: startCol,
      row: startRow,
      g: 0,
      h: heuristic(startCol, startRow, endCol, endRow),
      parent: null
    };
    openHeap.push(startNode);
    openSet.set(`${startCol},${startRow}`, startNode);

    function step() {
      let iterations = 0;
      const CHUNK = 100;
      while (openHeap.size() > 0 && iterations < CHUNK) {
        const current = openHeap.pop();
        openSet.delete(key(current));
        const currentKey = key(current);
        if (closedSet.has(currentKey)) {
          iterations++;
          continue;
        }
        closedSet.add(currentKey);

        if (current.col === endCol && current.row === endRow) {
          const path = [];
          let node = current;
          while (node.parent) {
            path.unshift(node);
            node = node.parent;
          }
          resolve(path);
          return;
        }

        const neighbors = [
          { col: current.col + 1, row: current.row },
          { col: current.col - 1, row: current.row },
          { col: current.col, row: current.row + 1 },
          { col: current.col, row: current.row - 1 }
        ];

        for (const neighbor of neighbors) {
          const nKey = `${neighbor.col},${neighbor.row}`;
          if (
            map[neighbor.row]?.[neighbor.col] === 0 &&
            !closedSet.has(nKey) &&
            !openSet.has(nKey)
          ) {
            const node = {
              col: neighbor.col,
              row: neighbor.row,
              g: current.g + 1,
              h: heuristic(neighbor.col, neighbor.row, endCol, endRow),
              parent: current
            };
            openHeap.push(node);
            openSet.set(nKey, node);
          }
        }
        iterations++;
      }

      if (openHeap.size() > 0) {
        setTimeout(step, 0);
      } else {
        resolve([]);
      }
    }

    step();
  });
}

function key(n) {
  return `${n.col},${n.row}`;
}

function heuristic(c, r, ec, er) {
  return Math.abs(c - ec) + Math.abs(r - er);
}
