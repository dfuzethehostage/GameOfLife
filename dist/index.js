const container = document.querySelector(".canvas-container");
let isDown = false;
let startX, startY, scrollLeft, scrollTop;

container.addEventListener("mousedown", (e) => {
  isDown = true;
  startX = e.pageX - container.offsetLeft;
  startY = e.pageY - container.offsetTop;
  scrollLeft = container.scrollLeft;
  scrollTop = container.scrollTop;
});

container.addEventListener("mouseleave", () => (isDown = false));
container.addEventListener("mouseup", () => (isDown = false));

container.addEventListener("mousemove", (e) => {
  if (!isDown) return;
  e.preventDefault();
  const x = e.pageX - container.offsetLeft;
  const y = e.pageY - container.offsetTop;
  container.scrollLeft = scrollLeft - (x - startX);
  container.scrollTop = scrollTop - (y - startY);
});

console.log(window.innerWidth, window.innerHeight);

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let canvasSize = 4;
// Erhöhe die Auflösung des Canvas für hochauflösende Bildschirme
const ratio = window.devicePixelRatio || 1;
canvas.width = window.innerWidth * ratio * canvasSize;
canvas.height = window.innerHeight * ratio * canvasSize;
ctx.scale(ratio, ratio);

// Definiere das Gitter
function drawGrid(cellSize = 50) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.lineWidth = 1; // Dünnere Linie
  ctx.strokeStyle = "#000"; // Dunkle Farbe
  ctx.lineCap = "butt"; // Scharfe Enden
  ctx.lineJoin = "miter"; // Scharfe Verbindungen
  ctx.globalAlpha = 1; // Keine Transparenz
  // Vertikale Linien
  for (let x = 0; x <= canvas.width; x += cellSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  // Horizontale Linien
  for (let y = 0; y <= canvas.height; y += cellSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}
drawGrid(50); // 50px große Zellen
// Optional: Grid neu zeichnen, wenn Fenstergröße sich ändert
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth * ratio;
  canvas.height = window.innerHeight * ratio;
  ctx.scale(ratio, ratio);
  drawGrid(50);
});
