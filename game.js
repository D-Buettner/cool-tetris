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
  this.clearedLines = 0;
  this.score = 0;
  this.currentShape = "";
  this.dead = false;
  this.interval;
  console.log(this.board);
}

Game.prototype.getPoint = function(row, col) {
  if (!this.board[row] || !this.board[0][col]) {
    return "doesNotExist";
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
        blocks.push({row:rowIndex, col:colIndex, blockType:col});
        bCount += 1;
      }  
    });
    return bCount === 4;
  });
  return blocks;
};
// 25 15 05 06
Game.prototype.getTargetLocations = function(blockList, f) {
  var targetList = blockList.map(f);
  console.log("new blocklist", targetList);
  return targetList;
};

Game.prototype.checkLegality = function(blockList) {
  console.log("calling is legal");
  console.log(this.board);
  console.log(blockList);
  // CHecks legality. Returns 'clear' or reason that move is illegal.
  var isLegal = "clear";
  blockList.some(function(block) {
    console.log('checking legality', block.row, block.col);
    var itemAtPoint = this.getPoint(block.row, block.col);
    if (itemAtPoint === "doesNotExist") {

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

    } else if (itemAtPoint === "#") {
      isLegal = "#";
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
  console.log(targetList);
  // Set target location.
  targetList.forEach(function(block){
    this.setPoint(block.row, block.col, block.blockType);
  }, this);

  this.checkRows();
};

Game.prototype.step = function(objRef) {
  console.log("step");
  // set objRef to pass to interval function.
  if (!objRef) {
    var objRef = this;
  }

  objRef.checkRows();
  // Check for new shape or death.
  if (objRef.gotShape === false) {
    console.log("doing a new shape from step");
    objRef.newShape();
    
  }

  if (objRef.dead) {

      clearInterval(objRef.interval);
      death();
    }
    console.log("moving down");
    objRef.moveDown();

    objRef.toString();

    if (objRef.interval === undefined) {
      objRef.interval = setInterval(this.step, 1000, objRef);
  }

};

var convertShape = function(block) {
  console.log("converting  shape");
  block.blockType = "#";
  return block;
}

Game.prototype.newShape = function() {
  // Select shape
  console.log("New shape");
  console.log(this.board);
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
          console.log(this, this.dead);
        }
        
        this.setPoint(point[0], point[1], "o");
      }, this); 
      this.setPoint(chosenShape.pivot[0], chosenShape.pivot[1], "O");
      this.gotShape = true;
      console.log(this.board);
      return;
    } 
  }
};

Game.prototype.checkRows = function() {
  // Check rows and apply scoring.
  console.log("calling check rows..");
  var fullRow = true;
  var rowMulti = 0;
  var rowsCleared = false;
  // Check for cleared rows.

  this.board.forEach(function(row, rowIndex){
    fullRow = true;

    row.forEach(function(col){
      if (col !== "#") {
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
  }
};

Game.prototype.moveSideways = function(direction) {
  if (direction === "left") {
    var transform = -1;
  } else if (direction === "right") {
    var transform = 1;
  }

  var blockList = this.getActiveBlockLocations();
  var targetList = this.getTargetLocations(blockList, function(block) {
    // Create copy of block to prevent errors.
    var newBlock = JSON.parse(JSON.stringify(block));
    newBlock.col += transform;
    return newBlock;
  });

  if (this.checkLegality(targetList) === "clear") {
    this.transformBlocks(blockList, targetList);
    this.toString();
  }  
};

Game.prototype.moveDown = function() {
  console.log("calling move");
  var blockList = this.getActiveBlockLocations();
  console.log(blockList);

  var targetList = this.getTargetLocations(blockList, function(block) {
    // Clone obj to prevent modification of original.
    var newBlock = JSON.parse(JSON.stringify(block));
    newBlock.row += 1;
    return newBlock;
  });
  var isLegal = this.checkLegality(targetList);
  // Check legality then move or convert to landed.
  if (isLegal === "clear") {
    console.log("legal move");
    this.transformBlocks(blockList, targetList);
  } else {
    console.log('converting');
    targetList = this.getTargetLocations(blockList, convertShape);
    this.transformBlocks(blockList, targetList);
    this.gotShape = false;
  }
this.toString();
  
};

Game.prototype.rotate = function(direction) {
  console.log("CALLING ROTATE");
  console.log(this.currentShape);
  var rotate = "";
  switch (this.currentShape) {
    case "i":
      rotate = "i"
      break
    case "o":
      return;
    case "t":
    case "s":
    case "z":
    case "j":
    case "l":
      break;
  }
  var pivotIndex;
  var pivotYRow;
  var pivotXCol;

  var blockList = this.getActiveBlockLocations();
  blockList.forEach(function(block, blockIndex) {
    console.log(block, block.blockType)
    if (block.blockType === "O") {
      pivotIndex = blockIndex;
      pivotYRow = block.row;
      pivotXCol = block.col;
    }
  });
  console.log("piv index", pivotIndex);

  // Get  differences from pivot
  blockList.forEach(function(block, blockIndex){
    if (blockIndex !== pivotIndex) {
      console.log(block);
      var rowDifference = block.row - blockList[pivotIndex].row;
      console.log("row y difference from pivot", rowDifference);
      var colDifference = block.col - blockList[pivotIndex].col;
      console.log("column x difference from pivot", colDifference);
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

  this.toString();
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

      if (isLegal === "#") {
      return false;
    }
  }
  return targetList;
};

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
  resultString += '<br><br> Score: ';
  resultString += this.score;
  writeToWindow(resultString);
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
  console.log('making',board);
  return board;

};

function death() {
  writeToWindow("You died!");
}

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
        GameObject.moveSideways("left");
        break;
      case 39:
        GameObject.moveSideways("right");
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
  console.log(currentGame.board);
  addKeyboardControl(currentGame);
  currentGame.step();
}