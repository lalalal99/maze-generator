const BGCOLOR = window
  .getComputedStyle(document.body, null)
  .getPropertyValue("background-color");

let canvas = document.querySelector(".canvas");
let ctx = canvas.getContext("2d");

let current;

class Maze {
  constructor(size, rows = 30, cols = 30) {
    this.size = size;
    this.rows = rows;
    this.cols = cols;

    this.cells = [];
    this.stack = [];
  }

  setup() {
    for (let r = 0; r < this.rows; r++) {
      this.cells.push([]);
      for (let c = 0; c < this.cols; c++) {
        this.cells[r].push(new Cell(r, c, this.size / this.rows, this));
      }
    }
    current = this.cells[0][0];
  }

  draw() {
    canvas.style.background = "black";
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, this.size, this.size);

    current.visited = true;

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        this.cells[r][c].draw();
      }
    }

    let size = this.size / this.rows;
    ctx.fillStyle = "#b3f2dd";
    ctx.fillRect(
      (this.rows - 1) * size,
      (this.cols - 1) * size,
      size - 1,
      size - 1
    );

    let next = current.getNextNeighbour();

    if (next) {
      next.visited = true;
      this.stack.push(current);
      current.highlight();
      removeWalls(current, next);
      current = next;
    } else if (this.stack.length > 0) {
      let cell = this.stack.pop();
      current = cell;
      current.highlight();
    }

    if (this.stack.length === 0) {
      return;
    }

    window.requestAnimationFrame(() => {
      this.draw();
    });
  }
}

class Cell {
  constructor(i, j, size, grid) {
    this.i = i;
    this.j = j;
    this.size = size;
    this.grid = grid;
    this.gridRows = grid.rows;
    this.gridCols = grid.cols;

    this.x = i * size;
    this.y = j * size;
    this.xs = this.x + this.size;
    this.ys = this.y + this.size;

    this.walls = {
      top: true,
      right: true,
      bottom: true,
      left: true,
    };

    this.visited = false;
  }

  getNextNeighbour() {
    let grid = this.grid.cells;
    let neighbours = [];

    let top = this.j !== 0 ? grid[this.i][this.j - 1] : undefined;
    let right =
      this.i !== this.gridCols - 1 ? grid[this.i + 1][this.j] : undefined;
    let bottom =
      this.j !== this.gridRows - 1 ? grid[this.i][this.j + 1] : undefined;
    let left = this.i !== 0 ? grid[this.i - 1][this.j] : undefined;

    if (top && !top.visited) neighbours.push(top);
    if (right && !right.visited) neighbours.push(right);
    if (bottom && !bottom.visited) neighbours.push(bottom);
    if (left && !left.visited) neighbours.push(left);

    return neighbours.length !== 0
      ? neighbours[Math.floor(Math.random() * neighbours.length)]
      : undefined;
  }

  highlight() {
    ctx.fillStyle = "#db5461";
    ctx.fillRect(this.x + 1, this.y + 1, this.size - 2, this.size - 2);
  }

  drawTopWall() {
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.xs, this.y);
    ctx.stroke();
  }

  drawRightWall() {
    ctx.beginPath();
    ctx.moveTo(this.xs, this.y);
    ctx.lineTo(this.xs, this.ys);
    ctx.stroke();
  }

  drawBottomWall() {
    ctx.beginPath();
    ctx.moveTo(this.x, this.ys);
    ctx.lineTo(this.xs, this.ys);
    ctx.stroke();
  }

  drawLeftWall() {
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x, this.ys);
    ctx.stroke();
  }

  draw() {
    ctx.strokeStyle = BGCOLOR ? BGCOLOR : WHITE;
    ctx.lineWidth = 2;

    if (this.walls.top) this.drawTopWall();
    if (this.walls.right) this.drawRightWall();
    if (this.walls.bottom) this.drawBottomWall();
    if (this.walls.left) this.drawLeftWall();
  }
}

function removeWalls(cell1, cell2) {
  let xdiff = cell1.i - cell2.i;
  let ydiff = cell1.j - cell2.j;

  if (xdiff === 1) {
    cell1.walls.left = false;
    cell2.walls.right = false;
  } else if (xdiff === -1) {
    cell1.walls.right = false;
    cell2.walls.left = false;
  }

  if (ydiff === 1) {
    cell1.walls.top = false;
    cell2.walls.bottom = false;
  } else if (ydiff === -1) {
    cell1.walls.bottom = false;
    cell2.walls.top = false;
  }
}

function main() {
  [canvas.width, canvas.height] = (() => {
    let maxSize = Math.min(window.screen.width, window.screen.height);
    maxSize = Math.floor(maxSize / 100) * 100;
    maxSize = maxSize < 500 ? maxSize : "500";
    return [maxSize, maxSize];
  }).call();
  const maze = new Maze(canvas.width, 20,20);
  maze.setup();
  maze.draw();
}
