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
}

Game.prototype.getPoint = function(row, col) {
  if (!this.board[row]) {
    return undefined;
  }
  var itemAtCoordinates = this.board[row][col];
  return itemAtCoordinates;
};

Game.prototype.setPoint = function(row, col, item) {
  console.log("set point");
  console.log(item);
  console.log("setting point..", row, col, item);
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
    // counter + some loop allow f to return once blocks are located.
    return bCount === 4;
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
  console.log("new blocklist", blockList);
  blockList.forEach(function(block){
    this.setPoint(block.row, block.col, block.blockType);
  }, this);
  this.checkRows();
}

Game.prototype.step = function(objRef) {
  console.log("step");
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

    objRef.toString();

    if (objRef.interval === undefined) {
      objRef.interval = setInterval(this.step, 600, objRef);
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

  // Check if legal move
  var isLegal = true

  // refactor this with rotate legality check
  blockList.forEach(function(block) {
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
      block.col += transform;
      return block;
  });
  this.toString();
};

Game.prototype.moveDown = function() {
  var blockList = this.getActiveBlockLocations();
  console.log(blockList);
  // Block at end of list should be lowest.
  if (this.getPoint(blockList[blockList.length -1].row + 1, 0) === undefined) {
    this.transformBlocks(blockList, convertShape);
    this.gotShape = false;
    return;
  }
  blockList.forEach(function(block) {
    var charBelow = this.getPoint(block.row + 1, block.col);
    if (charBelow === "#") {
      this.transformBlocks(blockList, convertShape);
      this.gotShape = false;
      return;
    }
  }, this);
  if (!this.gotShape) {
    return;
  }

  this.transformBlocks(blockList, function(block){
    block.row += 1;
    return block;
  });
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
      
      console.log("block.xColTransform", block.xColTransform);
      console.log("block.yRowTransform", block.yRowTransform);
    }
  });
  // check move doesnt go out.
  this.kickInBoard(blockList);
  console.log("after kick", blockList);
  this.transformBlocks(blockList, function(block){
    if (block.xColTransform) {
    block.row = block.yRowTransform;
    block.col = block.xColTransform;
  }
  
    return block;
  });
  this.toString();
    // append xy transforms to block object
};

Game.prototype.kickInBoard = function(blockList, row, col) {
  // 'Kick' if going off the side
  console.log("kick function", blockList);
  blockList.forEach(function(block){
    if (block.xColTransform && block.xColTransform < 0) {
      this.transformBlocks(blockList, function(block){
        block.xColTransform += 1;
        return this.kickInBoard(blockList);
      });
    } else if (block.xColTransform && 
                block.xColTransform > this.width - 1) {
      
      this.transformBlocks(blockList, function(block){
        block.xColTransform -= 1;
        return this.kickInBoard(blockList);
      });
    }
  }, this);
} 

Game.prototype.kickInBoard = function(blockList, row, col) {
  // 'Kick' if going off the side
  blockList.forEach(function(block){
    if (block.col < 0) {
      this.transformBlocks(blockList, function(block){
        block.col += 1;
        this.kickInBoard(blockList);
      });
    } else if (block.col > this.width - 1) {
      this.transformBlocks(blockList, function(block){
        block.col -= 1;
        this.kickInBoard(blockList);
      });
    }
  }, this);
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
      case 40:
        GameObject.moveDown();
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