const BGCOLOR = window
  .getComputedStyle(document.body, null)
  .getPropertyValue("background-color");

let canvas = document.querySelector(".canvas");
let ctx = canvas.getContext("2d");

let current;
let onGoing = false;

class Maze {
  constructor(size, withWalls, rows = 30, cols = 30) {
    this.size = size;
    this.rows = rows;
    this.cols = cols;
    this.withWalls = withWalls;

    this.cells = [];
    this.stack = [];
  }

  setup() {
    for (let r = 0; r < this.rows; r++) {
      this.cells.push([]);
      for (let c = 0; c < this.cols; c++) {
        this.cells[r].push(
          new Cell(r, c, this.size / this.rows, this, this.withWalls)
        );
      }
    }
    current = this.cells[0][0];
    current.highlight();
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

    // Draws goal
    let size = this.size / this.rows;
    ctx.fillStyle = "#b3f2dd";
    ctx.fillRect(
      (this.rows - 1) * size,
      (this.cols - 1) * size,
      size - 1,
      size - 1
    );
  }
}

class Cell {
  constructor(i, j, size, grid, hasWalls) {
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

    this.walls = hasWalls
      ? {
          top: true,
          right: true,
          bottom: true,
          left: true,
        }
      : {
          top: false,
          right: false,
          bottom: false,
          left: false,
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

[canvas.width, canvas.height] = (() => {
  let maxSize = Math.min(window.screen.width, window.screen.height);
  maxSize = Math.floor(maxSize / 100) * 100;
  maxSize = maxSize < 500 ? maxSize : "500";
  return [maxSize, maxSize];
}).call();

let MAZE = new Maze(canvas.width, true);
MAZE.setup();
MAZE.draw();

function DFS() {
  if (!onGoing) {
    let maze = new Maze(canvas.width, true);
    maze.setup();
    maze.draw();
    MAZE = maze;
    dfs(maze);
  }

  function dfs(maze) {
    onGoing = true;
    let next = current.getNextNeighbour();

    if (next) {
      next.visited = true;
      maze.stack.push(current);
      current.highlight();
      removeWalls(current, next);
      current = next;
    } else if (maze.stack.length > 0) {
      let cell = maze.stack.pop();
      current = cell;
      current.highlight();
    }

    if (maze.stack.length === 0) {
      onGoing = false;
      return;
    }

    window.requestAnimationFrame(() => {
      maze.draw();
      dfs(maze);
    });
  }
}

function RECURSIVE_DIVISION() {
  if (!onGoing) {
    let maze = new Maze(canvas.width, false);
    maze.setup();
    maze.draw();
    MAZE = maze;
    drawBorders(MAZE);
    r_d(
      maze,
      [
        { x: 0, y: 0 },
        { x: maze.cells.length, y: maze.cells.length },
      ],
      true
    );
  }

  function r_d(maze, chamber) {
    // isGoing = true;
    // console.log(chamber);
    // let chamberLength = horizontal
    //   ? chamber[1].x - chamber[0].x
    //   : chamber[1].y - chamber[0].y;
    // let randomIndex = Math.random() * chamberLength;

    let chambers = splitChamber(maze, chamber);
    chambers.forEach((c) => {
      splitChamber(maze, c);
    });
    // drawLine(maze, 25, 25, 25, 30, horizontal);

    window.requestAnimationFrame(() => {
      maze.draw();
      // r_d(maze, chamber);
    });
  }

  function drawBorders(maze) {
    for (let i = 0; i < maze.cells.length; i++) {
      maze.cells[i][0].walls.top = true;
    }
    for (let i = 0; i < maze.cells.length; i++) {
      maze.cells[0][i].walls.left = true;
    }
    for (let i = 0; i < maze.cells.length; i++) {
      maze.cells[maze.cells.length - 1][i].walls.right = true;
    }
    for (let i = 0; i < maze.cells.length; i++) {
      maze.cells[i][maze.cells.length - 1].walls.bottom = true;
    }
  }

  function splitChamber(maze, chamber) {
    console.log(chamber);

    if (
      chamber[1].y - chamber[0].y === 1 ||
      chamber[1].x - chamber[0].x === 1
    ) {
      console.log("End of recursion");
      return;
    }

    let randomX = Math.floor(Math.random() * (chamber[1].x - chamber[0].x));
    let randomY = Math.floor(Math.random() * (chamber[1].y - chamber[0].y));

    // Disegna riga orizzontale
    for (let x = chamber[0].x; x < chamber[1].x; x++) {
      let cellCurrent = maze.cells[x][randomY];
      let cellBelow = maze.cells[x][randomY + 1];

      cellCurrent.walls.bottom = true;
      if (cellBelow) cellBelow.walls.top = true;
    }

    // Disegna riga verticale
    for (let y = chamber[0].y; y < chamber[1].y; y++) {
      let cellCurrent = maze.cells[randomX][y];
      let cellBelow = maze.cells[randomX + 1][y];

      cellCurrent.walls.right = true;
      if (cellBelow) cellBelow.walls.left = true;
    }

    // TODO

    let tlchamber = [chamber[0], { x: randomX, y: randomY }];
    let trchamber = [
      { x: randomX, y: chamber[0].y },
      { x: chamber[1].x, y: randomY },
    ];
    let blchamber = [
      { x: chamber[0].x, y: randomY },
      { x: randomX, y: chamber[1].y },
    ];
    let brchamber = [{ x: randomX, y: randomY }, chamber[1]];

    return [tlchamber, trchamber, blchamber, brchamber];
  }
}
