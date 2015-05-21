function displayCurrentInfo(level, score) {
 
 console.log("woo");
 var scoreHolder = document.createElement("div");
 var levelHolder = document.createElement("div");
 var info = document.getElementById("game-info");

 while (info.firstChild) {
    info.removeChild(info.firstChild);
 }
 
 score = document.createTextNode("Score: " + score);
 level = document.createTextNode("Level: " + level);

 scoreHolder.appendChild(score);
 levelHolder.appendChild(level);

 info.appendChild(level);
 info.appendChild(document.createElement("br"));
 info.appendChild(score);
}