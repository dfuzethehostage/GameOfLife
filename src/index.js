const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const container = document.querySelector(".canvas-container");

let panning = false,
  drawing = false,
  deleting = false,
  start = { x: 0, y: 0 };

let lineWidth = 1,
  gridHeight = 800,
  gridWidth = 800;

let scale = 1,
  minScale = 0.7,
  maxScale = 15,
  hideLineScaleMax = 3;

const colorLines = "#666",
  colorSquares = '#000';

const dragButton = 0,
  drawAndDeleteButton = 2;

let fields = [];
for (let i = 0; i < gridHeight; i++) {
  let row = [];
  for (let j = 0; j < gridWidth; j++) {
    row.push(0);
  }
  fields.push(row);
}

// Setze Canvas-Größe
canvas.height = container.clientHeight;
canvas.width = container.clientHeight * (gridWidth / gridHeight);

canvas.width = canvas.width - (canvas.width % gridWidth);
canvas.height = canvas.height - (canvas.height % gridHeight);

canvas.style.width = canvas.width + "px";
canvas.style.height = canvas.height + "px";

canvas.height *= 1;
canvas.width *= 1;

let cellSize = canvas.height / gridHeight;

let pointX = canvas.offsetLeft,
  pointY = canvas.offsetTop;

// Zeichne das Grid
function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = colorLines;
  ctx.fillStyle = colorSquares;

  for (let i = 0; i < gridHeight; i++) {
    for (let j = 0; j < gridWidth; j++) {
      if (fields[i][j] == 1) {
        ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
      }
    }
  }

  if (scale <= hideLineScaleMax) return;
  // **Vertikale Linien**
  for (let i = 1; i < gridWidth; i++) {
    let x = i * cellSize;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  // **Horizontale Linien**
  for (let i = 1; i < gridHeight; i++) {
    let y = i * cellSize;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

function setTransform() {
  canvas.style.transform = `translate(${pointX - canvas.offsetLeft}px, ${
    pointY - canvas.offsetTop
  }px) scale(${scale})`;
  drawGrid();
}

function getFieldCoords(e) {
  e.preventDefault();
  mouseX = e.clientX - pointX;
  mouseY = e.clientY - pointY;
  let x = Math.floor(
    mouseX / ((canvas.offsetHeight / gridHeight) * scale)
  );
  let y = Math.floor(
    mouseY / ((canvas.offsetHeight / gridHeight) * scale)
  );
  return { y: y, x: x };
}

setTransform();
drawGrid();

canvas.addEventListener("contextmenu", function (event) {
  event.preventDefault();
});

canvas.onmousedown = function (e) {
  e.preventDefault();
  if (e.button == dragButton) {
    start = { x: e.clientX - pointX, y: e.clientY - pointY };
    panning = true;
  } else if (e.button == drawAndDeleteButton) {
    let coords = getFieldCoords(e),
      y = coords.y,
      x = coords.x;

    if (fields[y][x] == 0) {
      drawing = true;
      fields[y][x] = 1;
    } else if (fields[y][x] == 1) {
      deleting = true;
      fields[y][x] = 0;
    }
    drawGrid(fields);
  }
};

canvas.onmousemove = function (e) {
  e.preventDefault();

  if (panning) {
    pointX = e.clientX - start.x;
    pointY = e.clientY - start.y;
    setTransform();
  }

  let coords = getFieldCoords(e),
  x = coords.x,
  y = coords.y;
  if (drawing) fields[y][x] = 1;
  else if (deleting) fields[y][x] = 0;

  drawGrid();
}

window.onmouseup = function (e) {
  e.preventDefault();
  if (e.button == dragButton) {
    panning = false;
  } else if (e.button == drawAndDeleteButton) {
    drawing = false;
    deleting = false;
  }
};

window.onwheel = function (e) {
  e.preventDefault();

  let xs = (e.clientX - pointX) / scale,
    ys = (e.clientY - pointY) / scale,
    delta = e.wheelDelta ? e.wheelDelta : -e.deltaY;

  if (delta < 0 && scale >= minScale) scale *= 1 / 1.1;
  else if (delta > 0 && scale <= maxScale) scale *= 1.1;

  pointX = e.clientX - xs * scale;
  pointY = e.clientY - ys * scale;

  setTransform();
};
