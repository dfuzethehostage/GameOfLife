const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const container = document.querySelector(".canvas-container");

let scale = 1,
  panning = false,
  drawing = false,
  deleting = false,
  start = { x: 0, y: 0 },
  lineWidth = 2,
  gridHeight = 300,
  gridWidth = 400,
  minScale = 0.7,
  maxScale = 15,
  hideLineScale = 3,
  colorLines = "#666",
  colorSquares = rgb(0, 0, 0);

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

canvas.height *= 8;
canvas.width *= 8;

let cellSize = canvas.height / gridHeight;
let pointX = canvas.offsetLeft,
  pointY = canvas.offsetTop;

setTransform();

// Zeichne das Grid
function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = "#666";
  ctx.fillStyle = "black";

  for (let i = 0; i < gridHeight; i++) {
    for (let j = 0; j < gridWidth; j++) {
      if (fields[i][j] == 1) {
        ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
      }
    }
  }

  if (scale <= hideLineScale) return;

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

drawGrid();

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
  let x = Math.floor(mouseX / ((canvas.offsetHeight / gridHeight) * scale));
  let y = Math.floor(mouseY / ((canvas.offsetHeight / gridHeight) * scale));
  return { y: y, x: x };
}

canvas.onmousedown = function (e) {
  if (e.button == 2) {
    e.preventDefault();
    start = { x: e.clientX - pointX, y: e.clientY - pointY };
    panning = true;
  } else if (e.button == 0) {
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

window.onmouseup = function (e) {
  if (e.button == 2) {
    panning = false;
  } else if (e.button == 0) {
    drawing = false;
    deleting = false;
  }
};

canvas.onmousemove = function (e) {
  if (e.button == 2) {
    e.preventDefault();
    if (!panning) {
      return;
    }
    pointX = e.clientX - start.x;
    pointY = e.clientY - start.y;
    setTransform();
  } else if (e.button == 0) {
    let coords = getFieldCoords(e),
      x = coords.x,
      y = coords.y;
    if (drawing) fields[y][x] = 1;
    else if (deleting) fields[y][x] = 0;
    drawGrid();
  }
};

window.onwheel = function (e) {
  e.preventDefault();
  let xs = (e.clientX - pointX) / scale,
    ys = (e.clientY - pointY) / scale;
  delta = e.wheelDelta ? e.wheelDelta : -e.deltaY;

  if (delta < 0 && scale >= minScale) scale *= 1 / 1.1;
  else if (delta > 0 && scale <= maxScale) scale *= 1.1;

  pointX = e.clientX - xs * scale;
  pointY = e.clientY - ys * scale;

  setTransform();
};
