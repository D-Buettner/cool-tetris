var CELL_SIZE = 20;
var BACKGROUND_COLOR = '#032753';

// Lowercase are for landed colors.
var COLORS = {  
              // Main Colors
                I : "#00ffff",
                O : "#ffff00",//
                T : "#9d11f5",//
                S : "#00ff00",//
                Z : "#ff0000",//
                J : "#1a00f7",
                L : "#ff540e",

              // Top Highlight
                ih : "#ccffff",//
                oh : "#ffffcc",//
                th : "#ebccfb",//
                sh : "#ccffcc",//
                zh : "#ffcccc",//
                jh : "#cfcffb",
                lh : "#ffd7cc",

              // Side Shadow
                is : "#00cccc",//
                os : "#cccc44",//
                ts : "#7e0dcc",//
                ss : "#01cc40",//
                zs : "#cc0013",//
                js : "#130dc2",
                ls : "#e6311b",

              // Bottom Shadow
                i : "#007f7f",
                o : "#7f7f26",//
                t : "#4e047f",//
                s : "#017f24",//
                z : "#7f0007",//
                j : "#0a0575",
                l : "#99210f",

              // Other

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


  var startX = x * CELL_SIZE;
  var startY = y * CELL_SIZE;
   
  //console.log(startX) // should show problem with bottom corner bug. 
  this.ctx.fillStyle = COLORS[type];
  this.ctx.fillRect(startX, startY, 19, 19);
  if (type !== 'N') {
    this.drawShadows(type, startX, startY);
  }
}

Canvas.prototype.drawShadows = function(type, x, y) {

  console.log("drawing shadows")
  var ctx = this.ctx;
  var shadowSize = CELL_SIZE / 8;
  
  ctx.beginPath();
  ctx.moveTo(x, y + CELL_SIZE);
  ctx.lineTo(x + shadowSize, y + CELL_SIZE - shadowSize);
  ctx.lineTo(x + CELL_SIZE - shadowSize, y + CELL_SIZE - shadowSize);
  ctx.lineTo(x + CELL_SIZE, y + CELL_SIZE);
  // Change to shadow color.
  ctx.fillStyle = COLORS[type.toLowerCase()];
  ctx.fill();




}