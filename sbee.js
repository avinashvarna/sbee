var inputWords = document.getElementById("inputWords");
var scoreField = document.getElementById("score");
var foundWordsField = document.getElementById("foundWords");
var score = 0;
var foundWords = new Set();

function update() {
    const words = inputWords.value.trim().split(/\s+/g);
    // console.log(words);
    inputWords.value = "";
    for (var i=0; i < words.length; i++) {
        var currentWord = words[i];
        if(!foundWords.has(currentWord)) {
            score += currentWord.length;
            let uniqueChars = new Set();
            for(let j=0; j < currentWord.length; j++) {
                uniqueChars.add(currentWord[j].toLowerCase());
            }
            // console.log(uniqueChars);
            if(uniqueChars.size == 7) {
                score += 7;
                foundWordsField.innerHTML += " <b>" + currentWord + "</b>";
            } else {
                foundWordsField.innerHTML += " " + currentWord;
            }
        }
        foundWords.add(currentWord);
    }
    scoreField.innerHTML = "Score: " + score;
}