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