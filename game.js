"use strict";

var LEFT = -1;
var RIGHT = 1;

// Shape object includes name, location of starting blocks,
// and location of the pivot block.
var shapes = [
    
    { name: "I", startingCoordinates: [[1, 3],[1, 5],[1, 6],], pivot: [1, 4] },
    { name: "O", startingCoordinates: [[0, 4],[0, 5],[1, 5],], pivot: [1, 4] },
    { name: "T", startingCoordinates: [[0, 4],[1, 3],[1, 5],], pivot: [1, 4] },
    { name: "S", startingCoordinates: [[0, 4],[0, 5],[1, 3],], pivot: [1, 4] },
    { name: "Z", startingCoordinates: [[0, 3],[0, 4],[1, 5],], pivot: [1, 4] },
    { name: "J", startingCoordinates: [[0, 3],[1, 3],[1, 5],], pivot: [1, 4] },
    { name: "L", startingCoordinates: [[0, 5],[1, 3],[1, 5],], pivot: [1, 4] },
    
];

function Game(height, width, level) {
  this.level = level;
  this.height = height;
  this.width = width;
  this.board = createBoard(height, width);
  this.shapeList = shapes;
  this.gotShape = false;
  this.clearedLines = 0;
  this.score = 0;
  this.currentShape = "";
  this.dead = false;
  this.interval;
  this.speed = 1000;
  this.level = 1;
  this.newLevelFlag = true;
}

Game.prototype.getPoint = function(row, col) {
  if (!this.board[row] || !this.board[0][col]) {
    return -1;
  }
  var itemAtCoordinates = this.board[row][col];
  return itemAtCoordinates;
};

Game.prototype.setPoint = function(row, col, item) {
  this.board[row][col] = item;
};

Game.prototype.getActiveBlockLocations =  function() {
  // Returns a list of row col location pairs for active blocks
  var blocks = [];
  var bCount = 0
  this.board.some(function(row, rowIndex) {
    row.forEach(function(col, colIndex) {
      if (col === "o" || col === "O") {
        blocks.push({row:rowIndex, col:colIndex, blockType:col, currentShape: this.currentShape});
        bCount += 1;
      }  
    },this);
    return bCount === 4;
  }, this);
  return blocks;
};
// 25 15 05 06
Game.prototype.getTargetLocations = function(blockList, f) {
  var targetList = blockList.map(f);
  return targetList;
};

Game.prototype.checkLegality = function(blockList) {
  // CHecks legality. Returns 'clear' or reason that move is illegal.
  var isLegal = "clear";
  blockList.some(function(block) {
    var itemAtPoint = this.getPoint(block.row, block.col);
    if (itemAtPoint === -1) {

      if (block.col < 0) {
        isLegal = "offLeft";
        return false;
      } else if (block.col > this.width - 1) {
        isLegal = "offRight";
        return false;
      } else {
        isLegal = "offBottom";
        return false;
      }

    } else if (itemAtPoint.indexOf("X") > -1) {
      isLegal = "X";
      return false;
    }
  }, this);
  return isLegal;
};

Game.prototype.transformBlocks = function(blockList, targetList) {
  // Wipe previous location.
  blockList.forEach(function(block){
    this.setPoint(block.row, block.col, ".");
  }, this);
  // Set target location.
  targetList.forEach(function(block){
    this.setPoint(block.row, block.col, block.blockType);
  }, this);

  this.checkRows();
};

Game.prototype.step = function(objRef) {
  // set objRef to pass to interval function.
  if (!objRef) {
    var objRef = this;
  }

  objRef.checkRows();
  // Check for new shape or death.
  if (objRef.gotShape === false) {
    objRef.newShape();
    
  }

  if (objRef.dead) {

      clearInterval(objRef.interval);
      death();
    }
    objRef.moveDown();

    objRef.updateState();

    if (objRef.newLevelFlag === true) {
      
      // delete old interval
      if (objRef.interval) {
        clearInterval(objRef.interval);
      }
      
      objRef.interval = setInterval(objRef.step, objRef.speed, objRef);
      objRef.newLevelFlag = false;

  }

};

var convertShape = function(block) {
  // Current shape needed to retain color after landing.
  block.blockType = "X" + block.currentShape;

  return block;
}

Game.prototype.newShape = function() {
  // Select shape
  var type = randomShape();
  this.currentShape = type;
  for (var i = 0; i < this.shapeList.length; i++) {
    if (this.shapeList[i].name === type) {
      // Write shape to page from stored coordinate pairs (x=[0], y=[1])
      var chosenShape = this.shapeList[i];
      chosenShape.startingCoordinates.forEach(function(point) {
        
        // Check death.
        if (this.getPoint(point[0], point[1]) !== ".") {
          this.dead = true;
          console.log("death");
        }
        
        this.setPoint(point[0], point[1], "o");
      }, this); 
      this.setPoint(chosenShape.pivot[0], chosenShape.pivot[1], "O");
      this.gotShape = true;
      return;
    } 
  }
};

Game.prototype.checkRows = function() {
  // Check rows and apply scoring.
  var fullRow = true;
  var rowMulti = 0;
  var rowsCleared = false;
  // Check for cleared rows.

  this.board.forEach(function(row, rowIndex){
    fullRow = true;

    row.forEach(function(col){
      if (col.indexOf("X") === -1) {
        fullRow = false;
      }
    }, this);

    if (fullRow === true) {
      this.board.splice(rowIndex, 1);
      var newRow = [];
      for (var i = 0; i < this.width; i++){
        newRow.push(".");
      }
      rowsCleared = true;
      this.board.unshift(newRow);
      rowMulti += 1;
    }

  }, this);
  if (rowsCleared) {
    this.clearedLines += rowMulti;
    this.score += rowMulti * 10 * rowMulti;

    // Increase speed every 10 lines
    if (this.clearedLines % 2 === 0) {
      this.speed = 1000 - this.clearedLines * 5;
      this.level += 1;
      this.newLevelFlag = true;
    }
  }
};

Game.prototype.moveSideways = function(transform) {

  var blockList = this.getActiveBlockLocations();
  var targetList = this.getTargetLocations(blockList, function(block) {
    // Create copy of block to prevent errors.
    var newBlock = JSON.parse(JSON.stringify(block));
    newBlock.col += transform;
    return newBlock;
  });

  if (this.checkLegality(targetList) === "clear") {
    this.transformBlocks(blockList, targetList);
    this.updateState();
  }  
};

Game.prototype.moveDown = function() {
  var blockList = this.getActiveBlockLocations();

  var targetList = this.getTargetLocations(blockList, function(block) {
    // Clone obj to prevent modification of original.
    var newBlock = JSON.parse(JSON.stringify(block));
    newBlock.row += 1;
    return newBlock;
  });
  var isLegal = this.checkLegality(targetList);
  // Check legality then move or convert to landed.
  if (isLegal === "clear") {
    this.transformBlocks(blockList, targetList);
  } else {
    targetList = this.getTargetLocations(blockList, convertShape);
    this.transformBlocks(blockList, targetList);
    this.gotShape = false;
  }
this.updateState();
  
};

Game.prototype.rotate = function(direction) {
  var rotate = "";
  switch (this.currentShape) {
    case "I":
    // Add code for 'proper' I rotation.ro
      rotate = "I"
      break
    case "O":
      return;
    case "T":
    case "S":
    case "Z":
    case "J":
    case "L":
      break;
  }
  var pivotIndex;
  var pivotYRow;
  var pivotXCol;

  var blockList = this.getActiveBlockLocations();
  blockList.forEach(function(block, blockIndex) {
    if (block.blockType === "O") {
      pivotIndex = blockIndex;
      pivotYRow = block.row;
      pivotXCol = block.col;
    }
  });

  // Get  differences from pivot
  blockList.forEach(function(block, blockIndex){
    if (blockIndex !== pivotIndex) {
      var rowDifference = block.row - blockList[pivotIndex].row;
      var colDifference = block.col - blockList[pivotIndex].col;
      if (direction === "clockwise") {
        block.xColTransform = pivotXCol - rowDifference;
        block.yRowTransform = pivotYRow + colDifference;
      } else {
        block.xColTransform = pivotXCol + rowDifference;
        block.yRowTransform = pivotYRow - colDifference;
      }
    }
  });

  var targetList = this.getTargetLocations(blockList, function(block) {
    if (!isNaN(block.xColTransform)) {
      // SEPERATE INTO FUNCTION FOR CLARITY
      var newBlock = JSON.parse(JSON.stringify(block));
      newBlock.row = block.yRowTransform;
      newBlock.col = block.xColTransform;
      return newBlock;
    } else {
      return block;
    }
  });

  // Kick to side if next to wall. Cancel if overlapping block
  
  targetList = this.rotateCollisionHandler(targetList);

  // If handler has returned false, cancel rotation.
  if (!targetList) {
    return;
  }

  this.transformBlocks(blockList, targetList);

  this.updateState();
};

Game.prototype.rotateCollisionHandler = function(targetList) {
  var isLegal = this.checkLegality(targetList);
  if (isLegal !== "clear") {

      if (isLegal === "offLeft") {
        targetList = this.getTargetLocations(targetList, function(block) {
          var newBlock = JSON.parse(JSON.stringify(block));
          newBlock.col += 1;
          return newBlock;
        }, this);
        // Check again after 'kick'.
        return this.rotateCollisionHandler(targetList);

      } else if (isLegal === "offRight") {
        targetList = this.getTargetLocations(targetList, function(block) {
          var newBlock = JSON.parse(JSON.stringify(block));
          newBlock.col -= 1;
          return newBlock;
        }, this);
        return this.rotateCollisionHandler(targetList);
      }

      if (isLegal === "X") {
      return false;
    }
  }
  return targetList;
};

Game.prototype.updateState = function() {

  var resultString =  "";
  // row and column measured from top-left.
  this.board.forEach(function(row) {
    row.forEach(function(col){
      if (col[0] === ".") {
        resultString += "N";
      } else if (col[0] === "o" || col[0] === "O") {
        resultString += this.currentShape;
      } else if (col[0] === "X") {
        console.log(col);
        resultString += col[1];
      }
    }, this);
  }, this);
  // Better way to seperate view from logic?

  this.canvas.redraw(resultString);
};

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

function death() {
  console.log("You died!");
}

function randomShape() {
  var shapeString = "IOTSZJL";
  var randNum = Math.floor(Math.random() * shapeString.length);
  return shapeString.charAt(randNum);
}

function addKeyboardControl(GameObject) {
  document.addEventListener("keydown", function(event){
    switch (event.keyCode) {
      case 37:
        GameObject.moveSideways(LEFT);
        break;
      case 39:
        GameObject.moveSideways(RIGHT);
        break;
      case 38:
        GameObject.rotate("clockwise");
        break;
      case 90:
        GameObject.rotate("anti-clockwise");
        break;
      case 40:
        GameObject.moveDown();
        break;
    }
  });
}

function run(height, width, level) {
  console.log("starting game");
  var currentGame = new Game(height, width, level);
  currentGame.canvas = new Canvas(height, width);
  addKeyboardControl(currentGame);
  currentGame.step();
}