const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const container = document.querySelector(".canvas-container");
const startButton = document.getElementById("start-button");
const nextButton = document.getElementById("next-button");
const resetButton = document.getElementById("reset-button");
const generationDisplay = document.getElementById("generation-display");
const highscoreDisplay = document.getElementById("highscore-display");
const speedRange = document.getElementById("speedRange")

// Status Variablen

let panning = false,
  drawing = false,
  deleting = false,
  running = true,
  runningButtonOn = false,
  runningSpeed = 1,
  start = { x: 0, y: 0 };


// Darstellungs Einstellungen

let lineWidth = 2,
  gridHeight = 300,
  gridWidth = 300,
  borderWidth = 1,
  borderColor;

let scale = 1,
  minScale = 0.7,
  maxScale = 40,
  hideLineScaleMax = 3;

const colorLines = "#666",
  colorSquares = "#000";

const dragButton = 0,
  drawAndDeleteButton = 2;

ctx.lineWidth = lineWidth;
ctx.strokeStyle = colorLines;
ctx.fillStyle = colorSquares;

// Erstelle das Grid

let fields = [];
for (let i = 0; i < gridHeight; i++) {
  let row = [];
  for (let j = 0; j < gridWidth; j++) {
    row.push(0);
  }
  fields.push(row);
}

// Setze Canvas-Größe
speedRange.value = runningSpeed;

canvas.height = container.clientHeight;
canvas.width = container.clientHeight * (gridWidth / gridHeight);

canvas.width = canvas.width - (canvas.width % gridWidth);
canvas.height = canvas.height - (canvas.height % gridHeight);

canvas.style.width = canvas.width + "px";
canvas.style.height = canvas.height + "px";

canvas.height *= 5;
canvas.width *= 5;

let cellSize = canvas.height / gridHeight;

let pointX = canvas.offsetLeft,
  pointY = canvas.offsetTop;


// Zeichne das Grid

function drawGrid() {
  for (let i = 0; i <= gridWidth; i++) {
    let x = i * cellSize;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let i = 0; i <= gridHeight; i++) {
    let y = i * cellSize;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

function drawAllRects() {
  for (let i = 0; i < gridHeight; i++) {
    for (let j = 0; j < gridWidth; j++) {
      if (fields[i][j] == 1) drawOrDeleteRectAt(i, j, true);
    }
  }
}

function setTransform() {
  canvas.style.transform = `translate(${pointX - canvas.offsetLeft}px, ${
    pointY - canvas.offsetTop
  }px) scale(${scale})`;
}

function getFieldCoords(e) {
  mouseX = e.clientX - pointX;
  mouseY = e.clientY - pointY;
  let x = Math.floor(mouseX / ((canvas.offsetWidth / gridWidth) * scale));
  let y = Math.floor(mouseY / ((canvas.offsetHeight / gridHeight) * scale));
  return { y: y, x: x };
}

function drawOrDeleteRectAt(y, x, draw) {
  if (draw) {
    ctx.fillRect(
      x * cellSize + (scale > hideLineScaleMax ? lineWidth / 2 : 0),
      y * cellSize + (scale > hideLineScaleMax ? lineWidth / 2 : 0),
      cellSize - (scale > hideLineScaleMax ? lineWidth : 0),
      cellSize - (scale > hideLineScaleMax ? lineWidth : 0)
    );
    fields[y][x] = 1;
  } else {
    ctx.clearRect(
      x * cellSize + (scale > hideLineScaleMax ? lineWidth / 2 : 0),
      y * cellSize + (scale > hideLineScaleMax ? lineWidth / 2 : 0),
      cellSize - (scale > hideLineScaleMax ? lineWidth : 0),
      cellSize - (scale > hideLineScaleMax ? lineWidth : 0)
    );
    fields[y][x] = 0;
  }
  sendPythonData(y, x, draw);
}

function sendPythonData(y, x, draw) {
  let data = { action: "draw", y: y, x: x, draw: draw };
  let jsonData = JSON.stringify(data);
  window.sendDataToPython(jsonData);
}

function gameLoop() {
  if (runningButtonOn && running) {
    let data = JSON.parse(window.getDataFromPython());
    let coords_dead = data.coords_dead;
    let coords_alive = data.coords_alive;
    let generation = data.generation;
    let highscore = data.highscore;

    for (coords of coords_dead) {
      drawOrDeleteRectAt(coords[0], coords[1], false);
    }
    for (coords of coords_alive) {
      drawOrDeleteRectAt(coords[0], coords[1], true);
    }

    // Update generation and highscore display
    generationDisplay.innerText = `Generation: ${generation}`;
    highscoreDisplay.innerText = `Highscore: ${highscore}`;
  }
  requestAnimationFrame(gameLoop);
}

setTransform();

startButton.onclick = () => {
  if (runningButtonOn) {
    runningButtonOn = false;
    startButton.innerText = "Start";
  } else {
    runningButtonOn = true;
    startButton.innerText = "Stop";
  }
};

resetButton.onclick = () => {
  const data = JSON.stringify({ action: "reset" });
  window.sendDataToPython(data);

  // Reset the JavaScript grid
  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      if (fields[y][x] === 1) {
        drawOrDeleteRectAt(y, x, false);  // Clear the cell
      }
    }
  }

  // Reset generation and highscore display
  generationDisplay.innerText = "Generation: 0";
  highscoreDisplay.innerText = "Highscore: 0";
};

nextButton.onclick = () => {
  if (!runningButtonOn) {  // Only allow stepping if the game is paused
    const data = JSON.parse(window.getDataFromPython());
    const { coords_dead, coords_alive, generation, highscore } = data;

    // Update the grid visualization
    coords_dead.forEach(([y, x]) => drawOrDeleteRectAt(y, x, false));
    coords_alive.forEach(([y, x]) => drawOrDeleteRectAt(y, x, true));

    // Update the generation display
    generationDisplay.innerText = `Generation: ${generation}`;
    highscoreDisplay.innerText = `Highscore: ${highscore}`;
  }
};

speedRange.addEventListener("input", () => {
  runningSpeed = speedRange.value
})

canvas.addEventListener("contextmenu", function (event) {
  event.preventDefault();
});

canvas.onmousedown = function (e) {
  if (e.button == dragButton) {
    start = { x: e.clientX - pointX, y: e.clientY - pointY };
    panning = true;
  } else if (e.button == drawAndDeleteButton) {
    running = false;
    let coords = getFieldCoords(e),
      y = coords.y,
      x = coords.x;
    if (fields[y][x] == 0) {
      drawing = true;
      drawOrDeleteRectAt(y, x, true);
    } else if (fields[y][x] == 1) {
      deleting = true;
      drawOrDeleteRectAt(y, x, false);
    }
    console.log(running, runningButtonOn, drawing, deleting);
  }
};

canvas.onmousemove = function (e) {
  if (panning) {
    pointX = e.clientX - start.x;
    pointY = e.clientY - start.y;
    setTransform();
  }

  let coords = getFieldCoords(e),
    x = coords.x,
    y = coords.y;

  if (drawing) {
    fields[y][x] = 1;
    drawOrDeleteRectAt(y, x, true);
  } else if (deleting) {
    fields[y][x] = 0;
    drawOrDeleteRectAt(y, x, false);
  }
};

window.onmouseup = function (e) {
  if (e.button == dragButton) {
    panning = false;
  } else if (e.button == drawAndDeleteButton) {
    running = true;
    drawing = false;
    deleting = false;
  }
};

window.onwheel = function (e) {
  let xs = (e.clientX - pointX) / scale,
    ys = (e.clientY - pointY) / scale,
    delta = e.wheelDelta ? e.wheelDelta : -e.deltaY;

  if (delta < 0 && scale >= minScale) {
    if (scale > hideLineScaleMax && scale / 1.1 < hideLineScaleMax) {
      scale /= 1.1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawAllRects();
    }
    else scale /= 1.1;
    
  } else if (delta > 0 && scale <= maxScale) {
    if (scale < hideLineScaleMax && scale * 1.1 > hideLineScaleMax) {
      scale *= 1.1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawGrid();
      drawAllRects();
    }
    else scale *= 1.1;
  }

  pointX = e.clientX - xs * scale;
  pointY = e.clientY - ys * scale;

  setTransform();
};

setInterval(() => {
  if (runningButtonOn && running) gameLoop();
}, 1/runningSpeed);