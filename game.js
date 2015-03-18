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
  console.log(this.height, this.width);
}

Game.prototype.toString = function() {
  var resultString =  "";
  this.board.forEach(function(row) {
    console.log()
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

  // Maybe refactor this

  // objRef needed to keep this binding the same.
  var moveQueue = [];
  if (!objRef) {
    var objRef = this;
  }
  if (objRef.gotShape === false) {
    objRef.newShape();
  }

  console.log("step function");
  // Go through rows backwards to avoid moving blocks more than once.
  for (var row = objRef.height - 1; row >= 0; row--) {
    console.log("row: ", row);
    objRef.board[row].forEach(function(element, column) {
      // Check square below.
      if (element === "o" || element === "O") {
        var nextRow = row + 1;
        // Run collision detect then move if needed
        var didCollide = objRef.collisionDetect(nextRow, column);
        if (!didCollide) {

          console.log("setting point", nextRow, column);
          objRef.setPoint(nextRow, column, element);
          objRef.setPoint(row, column, ".");
          console.log("shape moved to row: ", nextRow);
        }
      };
    });
  }
  objRef.toString();
  console.log("creating new timer..");
  var nextStep = setInterval(this.step, 1000, objRef);
};

Game.prototype.convertShape = function() {
  var objRef = this;
  console.log("calling convert shape");
  this.board.forEach(function(row, rowIndex) {
    console.log('hey', row, rowIndex);
    row.forEach(function(element, elIndex) {
      if (element === "o" || element === "O") {

        console.log("block detected");
        console.log("row is... ",row,"elIndex is..",elIndex,"element is..",element);
        objRef.setPoint(rowIndex, elIndex, "#");
        console.log(objRef.board);
        objRef.gotShape = false;
      }
    });
  });
}

Game.prototype.newShape = function() {
  var objRef = this;
  // Select shape
  var type = randomShape();
  for (var i = 0; i < this.shapeList.length; i++) {
    if (this.shapeList[i].name === type) {
      // Write shape to page from stored coordinate pairs (x=[0], y=[1])
      var chosenShape = this.shapeList[i];
      chosenShape.startingCoordinates.forEach(function(point) {
        objRef.setPoint(point[0], point[1], "o");
      });
      objRef.setPoint(chosenShape.pivot[0], chosenShape.pivot[1], "O");
    }
    this.gotShape = true;
  }
  console.log(this.board);
};

Game.prototype.collisionDetect = function(row, column) {
  var objRef = this;
  var collision = false;
  console.log('function collision detect for row: ', row, " and column: ", column);
  console.log(this.getPoint(row, column));
  console.log(objRef.board)
  if (objRef.getPoint(row, column) === undefined) {
    objRef.convertShape();
    return true;
  }
  objRef.board[row].forEach(function(col, colIndex) {
    if (objRef.getPoint(row, colIndex) === "#") {
      console.log("collision");
      objRef.convertShape();
      collision = true;
    }
  });
  return collision;
}

// x and y measured from top-left

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

function run(height, width, level) {
  var currentGame = new Game(height, width, level);
  currentGame.newShape();
  currentGame.step();
}