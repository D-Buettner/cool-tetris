var CELL_SIZE = 20;
var BACKGROUND_COLOR = '#032753';

// Lowercase are for landed colors.
var COLORS = {  I : "#00ffff",
                O : "#ffff00",
                T : "#551a8b",
                S : "#00ff00",
                Z : "#ff0000",
                J : "#0000ff",
                L : "#ffa500",
                i : "#099",
                o : "#990",
                t : "#39125econ",
                s : "#090",
                z : "#900",
                j : "#009",
                l : "#946000",
                X : "grey",
                N : BACKGROUND_COLOR

                              };

function Canvas(height, width) {

  this.height = height;
  this.width = width;
  console.log(height, width);

  this.gridHeight = height * CELL_SIZE;
  this.gridWidth = width * CELL_SIZE;

  this.c = document.createElement("canvas");
  this.ctx = this.c.getContext("2d");
  var c = this.c;
  var ctx = this.ctx;

  holder = document.getElementById("game-window");
  holder.appendChild(c);
  c.id = "tetris-canvas";

  ctx.canvas.height = this.gridHeight;
  ctx.canvas.width = this.gridWidth;

  // Relies on a border being already drawn.
  // REFACTOR SO LOOP IS DONE IN PIXELS
  for (var i = 1; i < width; i++) {
    // 0.5 ensures line is drawn to overlap border instead of starting on it.
    var x = i * CELL_SIZE - 0.5;
    ctx.moveTo(x, 0);
    ctx.lineTo(x, this.gridHeight);
  }
  
  // too much space in bottom right corner error probably caused  here: line too long
  for (var i = 1; i < height; i++) {
    var y = i * CELL_SIZE - 0.5;
    ctx.moveTo(0, y);
    ctx.lineTo(this.gridWidth, y);
  }

  ctx.strokeStyle = "#eee";
  ctx.stroke();

  document.getElementById("tetris-canvas").style.background = BACKGROUND_COLOR;


}

Canvas.prototype.redraw = function(stateString) {
  console.log("redraw");
    // Convert string to coordinates
    for (var i = 0; i < stateString.length; i++) {
      // Element (x,y) = x + (y * gridWidth)
      var y = Math.floor(i / this.width);

      var x = i % this.width;

      this.drawBlock(stateString.charAt(i), x, y); 
    }
}

Canvas.prototype.drawBlock = function(type, x, y) {

  startX = x * CELL_SIZE;
  startY = y * CELL_SIZE;

  this.ctx.fillStyle = COLORS[type];
  this.ctx.fillRect(startX, startY, 19, 19);
  
}