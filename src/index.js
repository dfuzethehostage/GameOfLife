const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const container = document.querySelector(".canvas-container");

// Setze Canvas-Größe
let lineWidth = 2;
let gridHeight = 40;
let gridWidth = 60;
canvas.height = container.clientHeight;
canvas.width = container.clientHeight * (gridWidth / gridHeight);
container.clientWidth = canvas.width;
console.log(container);
// Grid-Parameter
let cellSize = canvas.height / gridHeight; // Größe der Zellen in Pixeln
let offsetX = 0; // Verschiebung in X-Richtung
let offsetY = 0; // Verschiebung in Y-Richtung

// Zeichne das Grid
function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = "#000";

  // Berechne den Startpunkt für das Grid
  const startX = offsetX % cellSize;
  const startY = offsetY % cellSize;

  // **Vertikale Linien**
  for (let i = 0; i <= gridWidth; i++) {
    let x = startX + i * cellSize;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  // **Horizontale Linien**
  for (let i = 0; i <= gridHeight; i++) {
    let y = startY + i * cellSize;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

drawGrid();

var scale = 1,
  panning = false,
  pointX = 0,
  pointY = 0,
  start = { x: 0, y: 0 };

function setTransform() {
  console.log(pointX, pointY);
  canvas.style.transform = `translate(${pointX}px, ${pointY}px) scale(${scale})`;
}

canvas.onmousedown = function (e) {
  e.preventDefault();
  start = { x: e.clientX - pointX, y: e.clientY - pointY };
  panning = true;
};

window.onmouseup = function (e) {
  panning = false;
};

container.onmousemove = function (e) {
  e.preventDefault();
  if (!panning) {
    return;
  }
  pointX = e.clientX - start.x;
  pointY = e.clientY - start.y;
  setTransform();
};

window.onwheel = function (e) {
  e.preventDefault();
  var xs = (e.clientX - pointX) / scale,
    ys = (e.clientY - pointY) / scale;
  delta = e.wheelDelta ? e.wheelDelta : -e.deltaY;
  scale *= delta < 0 ? (scale >= 0.7 ? 1 / 1.1 : 1) : 1.1;
  pointX = e.clientX - xs * scale;
  pointY = e.clientY - ys * scale;

  setTransform();
};
