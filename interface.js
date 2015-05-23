function displayCurrentInfo(level, score, lines) {
 
 var levelHolder = document.createElement("p");
 var scoreHolder = document.createElement("p");
 var linesHolder = document.createElement("p");
 var info = document.getElementById("game-info");

 while (info.firstChild) {
    info.removeChild(info.firstChild);
 }
 
 score = document.createTextNode("Score: " + score);
 level = document.createTextNode("Level: " + level);
 lines = document.createTextNode("Cleared: " + lines);

 levelHolder.appendChild(level);
 scoreHolder.appendChild(score);
 linesHolder.appendChild(lines);

 info.appendChild(levelHolder);
 info.appendChild(scoreHolder);
 info.appendChild(linesHolder);
}

function gameOver() {
  var gameOver = document.createElement("div");
  var gameOverText = document.createTextNode("Game Over!");
  var button = document.createElement("div");
  var buttonText = document.createTextNode("Play Again?");
  var canvas = document.getElementById("canvas-window");
  
  button.id = "button";
  gameOver.id = "game-over";
  
  gameOver.appendChild(gameOverText);
  button.appendChild(buttonText);
  canvas.appendChild(gameOver);
  canvas.appendChild(button);
  button.addEventListener("click", function() {
    while (canvas.firstChild) {
      canvas.removeChild(canvas.firstChild);
    }
    run(20.0,10.0,0);
  });
}