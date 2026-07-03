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
var score = 0, totalScore = 0, amazingScore, geniusScore, hintTaken=false;
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

    let local_puzzle_id = localStorage.getItem("puzzle_id");
    if(local_puzzle_id == puzzle_id) {
        wordList = localStorage.getItem("wordList");
        hintTaken = localStorage.getItem("hint_taken") === "true";
    } else {
        if(local_puzzle_id != null) {
            updateStats();
        } else {
            localStorage.removeItem("hint_taken");
            localStorage.removeItem("score_at_hint");
        }
        hintTaken = false;
    }
    update(wordList);
}

function updateStats() {
    let games_played = parseInt(localStorage.getItem("games_played") || 0);
    let amazing_without_hints = parseInt(localStorage.getItem("amazing_without_hints") || 0);
    let amazing_with_hints = parseInt(localStorage.getItem("amazing_with_hints") || 0);
    let genius_without_hints = parseInt(localStorage.getItem("genius_without_hints") || 0);
    let genius_with_hints = parseInt(localStorage.getItem("genius_with_hints") || 0);
    let queen_with_hints = parseInt(localStorage.getItem("queen_with_hints") || 0);
    let queen_without_hints = parseInt(localStorage.getItem("queen_without_hints") || 0);

    let last_score = parseInt(localStorage.getItem("last_score") || 0);
    let total_score = parseInt(localStorage.getItem("total_score") || 0);
    let amazing_score = Math.ceil(0.5 * total_score);
    let genius_score = Math.ceil(0.7 * total_score);
    
    let score_at_hint = localStorage.getItem("score_at_hint");
    let has_hint = localStorage.getItem("hint_taken") === "true";
    if (score_at_hint !== null) {
        score_at_hint = parseInt(score_at_hint);
    }
    
    games_played += 1;

    if (last_score == total_score) {
        if (has_hint && score_at_hint < total_score) {
            queen_with_hints += 1;
        } else {
            queen_without_hints += 1;
        }
    }
    if (last_score >= genius_score) {
        if (has_hint && score_at_hint < genius_score) {
            genius_with_hints += 1;
        } else {
            genius_without_hints += 1;
        }
    }
    if (last_score >= amazing_score) {
        if (has_hint && score_at_hint < amazing_score) {
            amazing_with_hints += 1;
        } else {
            amazing_without_hints += 1;
        }
    }

    localStorage.setItem("games_played", games_played);
    localStorage.setItem("amazing_without_hints", amazing_without_hints);
    localStorage.setItem("amazing_with_hints", amazing_with_hints);
    localStorage.setItem("genius_without_hints", genius_without_hints);
    localStorage.setItem("genius_with_hints", genius_with_hints);
    localStorage.setItem("queen_without_hints", queen_without_hints);
    localStorage.setItem("queen_with_hints", queen_with_hints);

    localStorage.removeItem("hint_taken");
    localStorage.removeItem("score_at_hint");
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
    localStorage.setItem("puzzle_id", puzzle_id);
    localStorage.setItem("wordList", [...foundWords].join(" "));
    localStorage.setItem("last_score", score);
    localStorage.setItem("total_score", totalScore);
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
        if ((id === 'hints' || id === 'answers') && !hintTaken) {
            hintTaken = true;
            localStorage.setItem("hint_taken", "true");
            localStorage.setItem("score_at_hint", score);
        }
    } else {
        element.classList.add('d-none');
    }
}

function showStats() {
    let games_played = parseInt(localStorage.getItem("games_played") || 0);
    let amazing_without_hints = parseInt(localStorage.getItem("amazing_without_hints") || 0);
    let amazing_with_hints = parseInt(localStorage.getItem("amazing_with_hints") || 0);
    let genius_without_hints = parseInt(localStorage.getItem("genius_without_hints") || 0);
    let genius_with_hints = parseInt(localStorage.getItem("genius_with_hints") || 0);
    let queen_with_hints = parseInt(localStorage.getItem("queen_with_hints") || 0);
    let queen_without_hints = parseInt(localStorage.getItem("queen_without_hints") || 0);

    let amazing_total = amazing_with_hints + amazing_without_hints;
    let genius_total = genius_with_hints + genius_without_hints;
    let queen_total = queen_with_hints + queen_without_hints;

    // Set text elements
    document.getElementById("statGamesPlayed").textContent = games_played;
    
    // Win Rate (games where user reached at least Amazing)
    let winRate = games_played > 0 ? Math.round((amazing_total / games_played) * 100) : 0;
    document.getElementById("statWinRate").textContent = winRate + "%";
    
    // Genius Rate (games where user reached Genius)
    let geniusRate = games_played > 0 ? Math.round((genius_total / games_played) * 100) : 0;
    document.getElementById("statGeniusRate").textContent = geniusRate + "%";

    // Set detail text
    document.getElementById("amazingDetails").textContent = `${amazing_total} (${amazing_without_hints} / ${amazing_with_hints})`;
    document.getElementById("geniusDetails").textContent = `${genius_total} (${genius_without_hints} / ${genius_with_hints})`;
    document.getElementById("queenDetails").textContent = `${queen_total} (${queen_without_hints} / ${queen_with_hints})`;

    // Calculate percentage bars (scaled to total games played, or to max possible to look like a distribution)
    let scale = games_played > 0 ? games_played : 1;
    
    document.getElementById("barAmazingNoHints").style.width = `${(amazing_without_hints / scale) * 100}%`;
    document.getElementById("barAmazingWithHints").style.width = `${(amazing_with_hints / scale) * 100}%`;
    
    document.getElementById("barGeniusNoHints").style.width = `${(genius_without_hints / scale) * 100}%`;
    document.getElementById("barGeniusWithHints").style.width = `${(genius_with_hints / scale) * 100}%`;
    
    document.getElementById("barQueenNoHints").style.width = `${(queen_without_hints / scale) * 100}%`;
    document.getElementById("barQueenWithHints").style.width = `${(queen_with_hints / scale) * 100}%`;
}

function resetStats() {
    if (confirm("Are you sure you want to reset all your statistics?")) {
        localStorage.removeItem("games_played");
        localStorage.removeItem("amazing_without_hints");
        localStorage.removeItem("amazing_with_hints");
        localStorage.removeItem("genius_without_hints");
        localStorage.removeItem("genius_with_hints");
        localStorage.removeItem("queen_without_hints");
        localStorage.removeItem("queen_with_hints");
        showStats();
    }
}