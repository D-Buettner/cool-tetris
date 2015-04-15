var colours = { I : "#00ffff",
                O : "#ffff00",
                T : "#551a8b",
                S : "#00ff00",
                Z : "#ff0000",
                J : "#0000ff",
                L : "#ffa500" 
                              };

function drawCanvas(height, width) {
  var cellSize = 20;
  var gridHeight = height * cellSize;
  var gridWidth = width * cellSize;

  var c = document.createElement("canvas");
  var holder = document.getElementById("game-window");
  holder.appendChild(c);
  c.id = "tetris-canvas";
  var ctx = c.getContext("2d");
  ctx.canvas.height = gridHeight;
  ctx.canvas.width = gridWidth;

  // Relies on a border being already drawn.
  for (var i = 1; i < width; i++) {
    // 0.5 ensures line is drawn to overlap border instead of starting on it.
    var x = i * cellSize - 0.5;
    ctx.moveTo(x, 0);
    ctx.lineTo(x, gridHeight);
  }

    for (var i = 1; i < height; i++) {
    // 0.5 ensures line is drawn to overlap border instead of starting on it.
    var y = i * cellSize - 0.5;
    ctx.moveTo(0, y);
    ctx.lineTo(gridWidth, y);
  }

  ctx.strokeStyle = "#eee";
  ctx.stroke();

  document.getElementById("tetris-canvas").style.background = '#032753';
}

function drawBlock(type)

function redraw(){
  // Refactor to only draw changed cells if performance is an issue.
}