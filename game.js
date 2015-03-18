"use strict";

// Shape object includes name, location of starting blocks,
// and location of the pivot block.
var shapes = [
    
    { name: "i", startingCoordinates: [[1, 3],[1, 5],[1, 6],], pivot: [1, 4] },
    { name: "o", startingCoordinates: [[0, 4],[0, 5],[1, 5],], pivot: [1, 4] },
    { name: "t", startingCoordinates: [[0, 4],[1, 3],[1, 5],], pivot: [1, 4] },
    { name: "s", startingCoordinates: [[0, 4],[0, 5],[1, 3],], pivot: [1, 4] },
    { name: "z", startingCoordinates: [[0, 3],[0, 4],[1, 5],], pivot: [1, 4] },
    { name: "j", startingCoordinates: [[0, 3],[1, 3],[1, 5],], pivot: [1, 4] },
    { name: "l", startingCoordinates: [[0, 5],[1, 3],[1, 5],], pivot: [1, 4] },
    
];

function Game(height, width, level) {

  this.level = level;
  this.height = height;
  this.width = width;
  this.board = createBoard(height, width);
  this.shapeList = shapes;
  this.gotShape = false;
}

Game.prototype.toString = function() {
  console.log("toString called");
  var resultString =  "";
  // row and column measured from top-left.
  this.board.forEach(function(row) {
    row.forEach(function(col){
      if (col[0] === ".") {
        resultString += ".";
      } else if (col[0] === "o" || col[0] === "O") {
        resultString += "o";
      } else if (col[0] === "#") {
        resultString += "#";
      }
    });
    resultString += '<br>';
  });
  writeToWindow(resultString);
};

Game.prototype.step = function(objRef) {
  // set objRef to pass to interval function.
  if (!objRef) {
    var objRef = this;
  }
  // Maybe refactor this

  var moveQueue = [];
  if (objRef.gotShape === false) {
    objRef.newShape();
  }

  console.log("step function");
  // Go through rows backwards to avoid moving blocks more than once.
  for (var row = objRef.height - 1; row >= 0; row--) {
    objRef.board[row].forEach(function(element, column) {
      // Check square below.
      if (element === "o" || element === "O") {
        console.log('element found');
        var nextRow = row + 1;
        // Run collision detect then move if needed
        var didCollide = objRef.collisionDetect(nextRow, column);
        if (!didCollide) {
          objRef.setPoint(nextRow, column, element);
          objRef.setPoint(row, column, ".");
        }
      };
    });
  }
  objRef.toString();
  console.log("step concluding")
  var nextStep = setInterval(this.step, 1000, objRef);
};

Game.prototype.convertShape = function() {
  console.log("converting  shape");
  this.board.forEach(function(row, rowIndex) {
    row.forEach(function(element, elIndex) {
      if (element === "o" || element === "O") {
        this.setPoint(rowIndex, elIndex, "#");
        this.gotShape = false;
      }
    }, this);
  }, this);
}

Game.prototype.newShape = function() {
  // Select shape
  console.log("New shape");
  var type = randomShape();
  for (var i = 0; i < this.shapeList.length; i++) {
    if (this.shapeList[i].name === type) {
      // Write shape to page from stored coordinate pairs (x=[0], y=[1])
      var chosenShape = this.shapeList[i];
      chosenShape.startingCoordinates.forEach(function(point) {
        this.setPoint(point[0], point[1], "o");
      }, this);
      this.setPoint(chosenShape.pivot[0], chosenShape.pivot[1], "O");
    }
    this.gotShape = true;
  }
};

Game.prototype.collisionDetect = function(row, column) {
  console.log("collisionDetect called!!!");
  var collision = false;
  console.log(this.board);
  if (this.getPoint(row, column) === undefined) {
    console.log("hit the bottom");
    this.convertShape();
    return true;
  }
  this.board[row].forEach(function(col, colIndex) {

    if (this.getPoint(row, colIndex) === "#") {
      // Check cell above (redo this)
      console.log
      if (this.getPoint(row - 1, colIndex) !== ".") {
        console.log(this.getPoint(row-1, colIndex), "above");
        console.log(this.getPoint(row, colIndex), "below");
        console.log("hit shape");
        this.convertShape();
        collision = true;
      }
    }
  }, this);
  return collision;
}

Game.prototype.getPoint = function(row, col) {
  if (!this.board[row]) {
    return undefined;
  }
  var itemAtCoordinates = this.board[row][col];
  return itemAtCoordinates;
};

Game.prototype.setPoint = function(row, col, item) {
  console.log("setting item at..", row, col);
  this.board[row][col] = item;
};

Game.prototype.getActiveBlockLocations =  function() {
  // Returns a list of row col location pairs for active blocks
  var blocks = [];
  this.board.forEach(function(row, rowIndex) {
    row.forEach(function(col, colIndex) {
      if (col === "o" || col === "O") {
        console.log(colIndex)
        blocks.push({row:rowIndex, col:colIndex, blockType:col});
      }
    }, this);
  });
  return blocks;
};

Game.prototype.transformBlocks = function(blockList, f) {
  console.log("transforming blocks");
  // Wipe previous location
  blockList.forEach(function(block){
    this.setPoint(block.row, block.col, ".");
  }, this);

  blockList = blockList.map(f);

  blockList.forEach(function(block){
    console.log("TRANSFORRMMM", this);
    this.setPoint(block.row, block.col, block.blockType);
    console.log(this.board);
  }, this);
}


Game.prototype.move = function(direction) {
  console.log("moving", direction);

  if (direction === "left") {
    var transform = -1;
  } else if (direction === "right") {
    var transform = 1;
  }

  var blockList = this.getActiveBlockLocations();

  // Check if legal move
  var isLegal = true
  blockList.forEach(function(block){
    console.log("checking legality");
    var adjacentChar = this.getPoint(block.row, block.col + transform);
    if (adjacentChar === undefined || adjacentChar === "#") {
      console.log("illegal");
      isLegal = false;
    }
  }, this);

  if (!isLegal) {
    return;
  }

  this.transformBlocks(blockList, function(block) {
      console.log("this", block);
      block.col += transform;
      console.log(block);
      return block;
  });
  this.toString();
};

Game.prototype.rotateClockwise = function() {};
Game.prototype.drop = function() {};

function createBoard(height, width) {

  //defaults
  if (!height) {
    height = 22;
  }
  if (!width) {
    width = 10;
  }
  var board = [];
  for (var i = 0; i < height; i++) {
    board[i] = [];
    for (var j = 0; j < width; j++) {
      board[i][j] = '.';
    }
  }
  return board;
};

function randomShape() {
  var shapeString = "iotszjl";
  var randNum = Math.floor(Math.random() * 7);
  return shapeString.charAt(randNum);
}

function writeToWindow(string) {
    var target = document.getElementById("game_window");
    target.innerHTML = string;
}

function addKeyboardControl(GameObject) {
  document.addEventListener("keydown", function(event){
    switch (event.keyCode) {
      case 37:
        GameObject.move("left");
        break;
      case 39:
        GameObject.move("right");
        break;
      case 38:
        GameObject.rotateClockwise();
        break;
      case 40:
        GameObject.drop();
        break;

    }


  });
}

function run(height, width, level) {
  var currentGame = new Game(height, width, level);
  addKeyboardControl(currentGame);
  currentGame.newShape();
  currentGame.step();
}