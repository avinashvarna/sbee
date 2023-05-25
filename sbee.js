var inputWords = document.getElementById("inputWords");
var scoreField = document.getElementById("score");
var foundWordsField = document.getElementById("foundWords");
var score = 0;
var foundWords = new Set();

function init() {
    if(localStorage.getItem("sbee.date") == new Date().toLocaleDateString()) {
        wordList = localStorage.getItem("sbee.wordList");
        update(wordList);
    }
}

function update(wordList) {
    if(!wordList) wordList = inputWords.value;
    const words = wordList.trim().split(/\s+/g);
    inputWords.value = "";
    for (let i=0; i < words.length; i++) {
        let currentWord = words[i].toLowerCase();
        if(!foundWords.has(currentWord)) {
            score += currentWord.length == 4 ? 1 : currentWord.length;
            let uniqueChars = new Set(currentWord);
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
    localStorage.setItem("sbee.date", new Date().toLocaleDateString());
    localStorage.setItem("sbee.wordList", [...foundWords].join(" "));
}
