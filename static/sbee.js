const inputWords = document.getElementById("inputWords");
const scoreField = document.getElementById("score");
const foundWordsField = document.getElementById("foundWords");
const alertPlaceholder = document.getElementById('liveAlertPlaceholder');
const levelsPlaceholder = document.getElementById('levelsPlaceholder');
const foundCountPlaceholder = document.getElementById('foundCountPlaceholder');
const answerPlaceholder = document.getElementById("answers");
const hintsPlaceholder = document.getElementById("hints");
const progressBar = document.getElementById("scoreProgressBar");
const progressBarLabel = document.getElementById("scoreProgressBarLabel");
const amazingMark = document.getElementById("amazingMark");
const geniusMark = document.getElementById("geniusMark");
const queenBeeBanner = document.getElementById("queenBeeBanner");
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

     // Position the level marks
    amazingMark.style.left = `calc(${(amazingScore / totalScore) * 100}% - 1px)`;
    geniusMark.style.left = `calc(${(geniusScore / totalScore) * 100}% - 1px)`;

    if(localStorage.getItem("sbee.puzzle_id") == puzzle_id) {
        wordList = localStorage.getItem("sbee.wordList");
    }
    update(wordList);
}

function updateProgressBar() {
    const percentage = Math.round((score / totalScore) * 100);
    progressBar.style.width = `${percentage}%`;
    progressBar.setAttribute('aria-valuenow', percentage);
    progressBarLabel.textContent = `${percentage}%`;

    // Update progress bar color based on score levels
    if (score >= geniusScore) {
        progressBar.classList.remove('bg-warning', 'bg-info', 'bg-primary');
        progressBar.classList.add('bg-success');
    } else if (score >= amazingScore) {
        progressBar.classList.remove('bg-warning', 'bg-info', 'bg-success');
        progressBar.classList.add('bg-primary');
    } else {
        progressBar.classList.remove('bg-warning', 'bg-success', 'bg-primary');
        progressBar.classList.add('bg-info');
    }

	// Show Queen Bee banner if max score is reached
    if (score === totalScore) {
        queenBeeBanner.style.display = 'block';
		progressBar.classList.remove('bg-warning', 'bg-info', 'bg-primary');
		progressBar.classList.add('bg-warning');
    }
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
    localStorage.setItem("sbee.puzzle_id", puzzle_id);
    localStorage.setItem("sbee.wordList", [...foundWords].join(" "));
    updateHintsAndAnswers();
	updateProgressBar();
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

function toggleVisibility(id) {
    const element = document.getElementById(id);
    if (element.classList.contains('d-none')) {
        element.classList.remove('d-none');
    } else {
        element.classList.add('d-none');
    }
}