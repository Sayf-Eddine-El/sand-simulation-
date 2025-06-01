const rows = 165 / 2;
const columns = 80 / 2;
const rectSize = 10 * 2;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const block = document.getElementById("block");
const fpsText = document.getElementById("fps");
const brushSize = document.getElementById("brush");

let lastLoop = new Date();

canvas.width = rows * rectSize;
canvas.height = columns * rectSize;

let x;
let y;

const grid = Array.from({ length: rows }, () =>
  Array.from({ length: columns }, () => null)
);

let arrayOfSands = [];
let brush = Number(brushSize.value) || 1;
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
  arrayOfSands = [];
  draw();
};

const handleMouse = (e) => {
  x = e.x;
  y = e.y;
  let i, j;
  for (i = 0; i < rows; i++) {
    for (j = 0; j < columns; j++) {
      if (
        y > j * rectSize &&
        y < j * rectSize + rectSize * brush &&
        x > i * rectSize &&
        x < i * rectSize + rectSize * brush
      ) {
        arrayOfSands.push({
          x: i,
          y: j,
          color: block.value,
        });
      }
    }
  }
};

const updateParticle = () => {
  for (let i = 0; i < arrayOfSands.length; i++) {
    if (arrayOfSands[i].y < columns - 1) {
      let bellowValid = false;
      let goLeft = false;
      let goRight = false;
      for (let j = 0; j < arrayOfSands.length && i != j; j++) {
        if (
          arrayOfSands[j].y == arrayOfSands[i].y + 1 &&
          arrayOfSands[j].x == arrayOfSands[i].x
        ) {
          bellowValid = true;
        }
        if (
          arrayOfSands[i].x + 1 == arrayOfSands[j].x &&
          arrayOfSands[j].y == arrayOfSands[i].y + 1
        ) {
          goLeft = true;
        }
        if (
          arrayOfSands[i].x - 1 == arrayOfSands[j].x &&
          arrayOfSands[j].y == arrayOfSands[i].y + 1
        ) {
          goRight = true;
        }
      }

      if (bellowValid) {
        if (goLeft && !goRight) {
          if (arrayOfSands[i].x > 0) {
            arrayOfSands[i].x -= 1;
            arrayOfSands[i].y += 1;
          }
        } else if (!goLeft && goRight) {
          if (arrayOfSands[i].x < rows) {
            arrayOfSands[i].x += 1;
            arrayOfSands[i].y += 1;
          }
        } else if (!goLeft && !goRight) {
          if (Math.round(Math.random()) == 0) {
            if (arrayOfSands[i].x < rows) {
              arrayOfSands[i].x += 1;
              arrayOfSands[i].y += 1;
            }
          } else {
            if (arrayOfSands[i].x > 0) {
              arrayOfSands[i].x -= 1;
              arrayOfSands[i].y += 1;
            }
          }
        }
      } else {
        arrayOfSands[i].y += 1;
      }
    }
  }
};

const draw = () => {
  ctx.clearRect(0, 0, rows * rectSize, columns * rectSize);
  for (let i = 0; i < arrayOfSands.length; i++) {
    ctx.fillStyle = arrayOfSands[i].color;
    ctx.fillRect(
      arrayOfSands[i].x * rectSize,
      arrayOfSands[i].y * rectSize,
      rectSize,
      rectSize
    );
  }
};

const showFps = () => {
  let thisLoop = new Date();
  let fps = 1000 / (thisLoop - lastLoop);
  lastLoop = thisLoop;
  fpsText.textContent = `FPS : ${Math.floor(fps)} , Particle : ${
    arrayOfSands.length
  }`;
};

function animationLoop() {
  brush = Number(brushSize.value);
  showFps();
  updateParticle();
  draw();
  requestAnimationFrame(animationLoop);
}

animationLoop();
