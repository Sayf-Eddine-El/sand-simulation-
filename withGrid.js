const rows = 100;
const columns = 80;
const rectSize = 10;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const block = document.getElementById("block");
const fpsText = document.getElementById("fps");
const brushSize = document.getElementById("brush");

let lastLoop = new Date();

canvas.width = rows * rectSize;
canvas.height = columns * rectSize;

let grid = Array.from({ length: rows }, () =>
  Array.from({ length: columns }, () => null)
);

let brush = 1;
let isMouseDown = false;

canvas.addEventListener("mousedown", (e) => {
  isMouseDown = true;
  handleMouse(e);
});

canvas.addEventListener("mouseup", () => {
  isMouseDown = false;
});

canvas.addEventListener("mousemove", (e) => {
  if (isMouseDown) {
    handleMouse(e);
  }
});

const reset = () => {
  grid = Array.from({ length: rows }, () =>
    Array.from({ length: columns }, () => null)
  );
  draw();
};

const handleMouse = (e) => {
  const x = e.offsetX;
  const y = e.offsetY;

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < columns; j++) {
      if (
        y > j * rectSize &&
        y < j * rectSize + rectSize * brush &&
        x > i * rectSize &&
        x < i * rectSize + rectSize * brush
      ) {
        if (grid[i][j] == null) {
          const particle = {
            x: i,
            y: j,
            type: block.value,
            color:
              block.value == "sand"
                ? "yellow"
                : block.value == "water"
                ? "blue"
                : block.value == "stone"
                ? "grey"
                : block.value == "steam"
                ? "white"
                : null,
          };

          grid[i][j] = particle;
        }
      }
    }
  }
};

const handleSandMov = (x, y, grid, i, j) => {
  if (y < columns - 1) {
    const bellowValid = grid[i]?.[j + 1];
    const goLeft = grid[i + 1]?.[j + 1];
    const goRight = grid[i - 1]?.[j + 1];
    if (!bellowValid) {
      y += 1;
    } else if (goLeft && x > 0 && !goRight) {
      y += 1;
      x -= 1;
    } else if (goRight && x < rows - 1 && !goLeft) {
      y += 1;
      x += 1;
    } else if (!goLeft && !goRight) {
      y += 1;
      x += +[-1, 1][Math.round(Math.random())];
    }
  }

  return { x, y };
};
const handleWaterMov = (x, y, grid, i, j, nextGrid) => {
  const bellowValid = grid[i]?.[j + 1];
  const goBellowLeft = grid[i + 1]?.[j + 1];
  const goBellowRight = grid[i - 1]?.[j + 1];
  const goRight = !grid[i + 1]?.[j];
  const goLeft = !grid[i - 1]?.[j];
  if (y < columns - 1 && !nextGrid[i][j]?.moved) {
    if (!bellowValid && nextGrid[i]?.[j + 1] == null) {
      y += 1;
    } else if (
      !goBellowLeft &&
      !goBellowRight &&
      nextGrid[i]?.[j + 1] == null
    ) {
      y += 1;
      const n = Math.random() < 0.5 ? -1 : 1;

      if (n == 1) {
        if (nextGrid[i + 1]?.[j] == null) {
          x += 1;
        }
      } else if (nextGrid[i - 1]?.[j] == null) {
        x -= 1;
      }
    } else if (
      goBellowLeft &&
      x > 0 &&
      !goBellowRight &&
      nextGrid[i - 1]?.[j] == null &&
      nextGrid[i]?.[j + 1] == null
    ) {
      y += 1;
      x -= 1;
    } else if (
      goBellowRight &&
      x < rows - 1 &&
      !goBellowLeft &&
      nextGrid[i + 1]?.[j] == null &&
      nextGrid[i]?.[j + 1] == null
    ) {
      y += 1;
      x += 1;
    } else if (
      goRight &&
      x < rows - 1 &&
      !goLeft &&
      nextGrid[i + 1]?.[j] == null
    ) {
      x += 1;
    } else if (!goRight && x > 0 && goLeft && nextGrid[i - 1]?.[j] == null) {
      x -= 1;
    } else if (goRight && goLeft && x > 0 && x < rows - 1) {
      const n = Math.random() < 0.5 ? -1 : 1;

      if (n == 1) {
        if (nextGrid[i + 1]?.[j] == null) {
          x += 1;
        }
      } else if (nextGrid[i - 1]?.[j] == null) {
        x -= 1;
      }
    }
  }

  return { x, y };
};
const handleSteamMov = (x, y, grid, i, j) => {
  if (y > 0) {
    const bellowValid = grid[i]?.[j - 1];
    const goLeft = grid[i + 1]?.[j - 1];
    const goRight = grid[i - 1]?.[j - 1];
    if (!bellowValid) {
      y -= 1;
    } else if (goLeft && x > 0 && !goRight) {
      y -= 1;
      x -= 1;
    } else if (goRight && x < rows - 1 && !goLeft) {
      y -= 1;
      x += 1;
    } else if (!goLeft && !goRight) {
      y -= 1;
      x += +[-1, 1][Math.round(Math.random())];
    }
  }

  return { x, y };
};

const updateParticle = () => {
  const nextGrid = Array.from({ length: rows }, () =>
    Array.from({ length: columns }, () => null)
  );
  for (let i = rows - 1; i >= 0; i--) {
    for (let j = 0; j < grid[i].length; j++) {
      if (!grid[i][j]) continue;

      let x = grid[i][j].x;
      let y = grid[i][j].y;
      let lastX = x;
      let lastY = y;
      if (grid[i][j].type == "sand") {
        let result = handleSandMov(x, y, grid, i, j);
        x = result.x;
        y = result.y;
        if (nextGrid[x] && nextGrid[x][y] == null)
          nextGrid[x][y] = { ...grid[i][j], x, y };
      }
      if (grid[i][j].type == "water") {
        let result = handleWaterMov(x, y, grid, i, j, nextGrid);
        x = result.x;
        y = result.y;
        if (nextGrid[x] && nextGrid[x][y] == null)
          nextGrid[x][y] = { ...grid[i][j], x, y };
        else {
          nextGrid[lastX][lastY] = { ...grid[i][j], lastX, lastY };
        }
      }
      if (grid[i][j].type == "stone") {
        if (nextGrid[x] && nextGrid[x][y] == null)
          nextGrid[x][y] = { ...grid[i][j], x, y };
      }
      if (grid[i][j].type == "steam") {
        let result = handleSteamMov(x, y, grid, i, j);
        x = result.x;
        y = result.y;
        if (nextGrid[x] && nextGrid[x][y] == null)
          nextGrid[x][y] = { ...grid[i][j], x, y };
      }
    }
  }

  grid = nextGrid;
};

const draw = () => {
  ctx.clearRect(0, 0, rows * rectSize, columns * rectSize);
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid.length; j++) {
      if (!grid[i][j]) continue;
      let cell = grid[i][j];
      ctx.fillStyle = cell.color;
      ctx.fillRect(cell.x * rectSize, cell.y * rectSize, rectSize, rectSize);
    }
  }
};

const getParticleNum = () => {
  let num = 0;
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      if (grid[i][j] != null) {
        num += 1;
      }
    }
  }
  return num;
};

const showFps = () => {
  let thisLoop = new Date();
  let fps = 1000 / (thisLoop - lastLoop);
  lastLoop = thisLoop;
  fpsText.textContent = `FPS : ${Math.floor(fps)} `;
};

function animationLoop() {
  brush = Number(brushSize.value);
  showFps();
  updateParticle();
  draw();
  requestAnimationFrame(animationLoop);
}

animationLoop();
