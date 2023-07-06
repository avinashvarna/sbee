const inputWords = document.getElementById("inputWords");
const scoreField = document.getElementById("score");
const foundWordsField = document.getElementById("foundWords");
const alertPlaceholder = document.getElementById('liveAlertPlaceholder');
const levelsPlaceholder = document.getElementById('levelsPlaceholder');
const foundCountPlaceholder = document.getElementById('foundCountPlaceholder');
const answerPlaceholder = document.getElementById("answers");
const hintsPlaceholder = document.getElementById("hints");
var score = 0, totalScore = 0, amazingScore, geniusScore;
const foundWords = new Set();
const hints = new Map();
const twoLetters = new Map();

const appendAlert = (message, type) => {
  const wrapper = document.createElement('div')
  wrapper.innerHTML = [
    `<div class="alert alert-${type}" role="alert">`,
    `   <div>${message}</div>`,
    '</div>'
  ].join('')

  alertPlaceholder.append(wrapper)
  setTimeout(function() {
        bootstrap.Alert.getOrCreateInstance(document.querySelector(".alert")).close();
    }, 1000)
}

function computeScore(word) {
    let score = word.length == 4 ? 1 : word.length;
    if(pangrams.has(word)) {
        score += 7;
    }
    return score;
}

function init() {
    const ansArray = [...answers];
    const lengths = ansArray.map(x => x.length);
    const maxLen = Math.max(...lengths);
    var wordList;
    for (const answer of ansArray) {
        let start = answer[0];
        if(!hints.has(start)) {
            let arr = new Array();
            arr.length = maxLen;
            arr.fill(0)
            hints.set(start, arr);
        }
        arr = hints.get(start);
        arr[answer.length-1] += 1;
        start = answer.slice(0, 2);
        if(!twoLetters.has(start)) {
            twoLetters.set(start, 0);
        }
        twoLetters.set(start, twoLetters.get(start)+1);
        totalScore += computeScore(answer);
    }
    amazingScore = Math.ceil(0.5 * totalScore);
    geniusScore = Math.ceil(0.7 * totalScore);
    levelsPlaceholder.innerHTML = `A: ${amazingScore} G: ${geniusScore}`;
    if(localStorage.getItem("sbee.date") == new Date().toLocaleDateString()) {
        wordList = localStorage.getItem("sbee.wordList");
    }
    update(wordList);
}

function update(wordList) {
    if(!wordList) wordList = inputWords.value;
    const words = wordList.trim().split(/\s+/g).map(x => x.toLowerCase());
    inputWords.value = "";
    let prevScore = score;

    for (const currentWord of words) {
        if (answers.has(currentWord)) {
            score += computeScore(currentWord);
            if(pangrams.has(currentWord)) {
                foundWordsField.innerHTML += " <b>" + currentWord + "</b>";
                appendAlert(`Pangram: ${currentWord}`, "success");
                pangrams.delete(currentWord);
            } else {
                foundWordsField.innerHTML += " " + currentWord;
            }
            answers.delete(currentWord);
            foundWords.add(currentWord);
            arr = hints.get(currentWord[0]);
            arr[currentWord.length-1] -= 1;
            start = currentWord.slice(0, 2);
            twoLetters.set(start, twoLetters.get(start)-1);
        } else {
            if(currentWord !== "") {
                if(foundWords.has(currentWord)) appendAlert(`${currentWord} already found`, "warning");
                else appendAlert(`Invalid answer: ${currentWord}`, "danger");
            }
        }
    }
    if ((score >= geniusScore) && (prevScore < geniusScore)) {
        appendAlert("Reached Genius Level!!", "success");
    }
    else if((score >= amazingScore) && (prevScore < amazingScore)) {
        appendAlert("Reached Amazing Level!", "success");
    }
    scoreField.innerHTML = `Score: ${score} / ${totalScore}`;
    foundCountPlaceholder.innerHTML = `Found: ${foundWords.size} Remaining: ${answers.size}`;
    localStorage.setItem("sbee.date", new Date().toLocaleDateString());
    localStorage.setItem("sbee.wordList", [...foundWords].join(" "));
    updateHintsAndAnswers();
}

function updateHintsAndAnswers() {
    const ansArray = [...answers];
    const lengths = ansArray.map(x => x.length);
    const maxLen = Math.max(...lengths);
    const starts = Array.from(hints.keys()).sort();

    let s = '<table class="table"><thead><tr><th scope="col"></th>';
    for(let i = 3; i < maxLen; i++) {
        s += `<th scope="col">${i+1}</th>`;
    }
    s += '</tr></thead>';
    for(c of starts) {
        s += `<tr><th scope="row">${c}</th>`;
        arr = hints.get(c);
        for(let i = 3; i < maxLen; i++) {
            s += `<td>${arr[i]}</td>`;
        }
        s += '</td>';
    }
    s+= '</table>';
    if(pangrams.size > 0) {
        s += "<p> <b>Pangrams:</b> " + pangrams.size + "</p>";
    }
    const letters = Array.from(twoLetters.keys()).sort();
    s += "<p>";
    for(c of letters) {
        let count = twoLetters.get(c);
        if (count > 0) s += `${c.toUpperCase()} - ${count} `;
    }
    s += "</p>";
    hintsPlaceholder.innerHTML = s;

    s = ansArray.join(" ");
    if(pangrams.size > 0) {
        s += "<p> <b>Pangrams:</b> " + [...pangrams].join(" ") + "</p>";
    }
    answerPlaceholder.innerHTML = s;
}

function reveal(id) {
    document.getElementById(id).classList.remove('d-none');
}
