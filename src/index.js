const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const container = document.querySelector(".canvas-container");

// Setze Canvas-Größe
let lineWidth = 2;
let gridHeight = 10;
let gridWidth = 30;
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

let dragging = false;
let lastX;
let lastY;
let marginLeft = 0;
let marginRight = 0;
let marginTop = 0;
let marginBottom = 0;

canvas.addEventListener(
  "mousedown",
  function (e) {
    var evt = e || event;
    dragging = true;
    lastX = evt.clientX;
    lastY = evt.clientY;
    e.preventDefault();
  },
  false
);

container.addEventListener(
  "mousemove",
  function (e) {
    var evt = e || event;
    if (dragging) {
      let deltaX = evt.clientX - lastX;
      lastX = evt.clientX;
      marginLeft += deltaX;
      canvas.style.marginLeft = marginLeft + "px";

      let deltaY = evt.clientY - lastY;
      lastY = evt.clientY;
      if (deltaY > 0) {
        if (marginTop != 0) {
          marginTop += deltaY;
        } else {
          marginBottom -= deltaY;
          if (marginBottom < 0) {
            marginTop -= marginBottom;
            marginBottom = 0;
          }
        }
      } else if (deltaY < 0) {
        if (marginBottom != 0) {
          marginBottom -= deltaY;
        } else {
          marginTop += deltaY;
          if (marginTop < 0) {
            marginBottom -= marginTop;
            marginTop = 0;
          }
        }
      }
      canvas.style.marginTop = marginTop + "px";
      canvas.style.marginBottom = marginBottom + "px";
    }
    e.preventDefault();
  },
  false
);

window.addEventListener(
  "mouseup",
  function () {
    dragging = false;
  },
  false
);
