class Riddle {
    constructor(label, clue, firstWord, secondWord) {
        this.label = label;
        this.clue = clue;
        this.firstWord = firstWord;
        this.secondWord = secondWord;
        this.guessedFirst = false;
        this.guessedSecond = false;
    }
}

class Game {
    constructor(titleRow, dailyRow) {
        // time used in milliseconds
        this.timer = 0;
        this.timerRunning = undefined;
        this.titleRow = titleRow;
        this.dailyRow = dailyRow;
        const startingColumns = [1, 4, 7, 10];
        this.riddles = startingColumns.map((index) => {
            const label = titleRow[index];
            const clue = this.dailyRow[index];
            const firstWord = this.dailyRow[index+1];
            const secondWord = this.dailyRow[index+2];
            return new Riddle(label, clue, firstWord, secondWord);
        });
    }

    checkWin() {
        for(const riddle of this.riddles) {
            if(!riddle.guessedFirst || !riddle.guessedSecond) {
                return false;
            }
        }
        clearInterval(this.timerRunning);
        return true;
    }
}

function formatTime(time) {
    const totalSeconds = Math.floor(time / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const hours = Math.floor(totalMinutes / 60);
    
    const secondsStr = ("0" + totalSeconds % 60).slice(-2);
    const minutesStr = ("0" + totalMinutes % 60).slice(-2);
    return `${hours}:${minutesStr}:${secondsStr}`;
}

function updateTime(time) {
    document.getElementById("timer").innerText = "Timer: " + formatTime(time);
}

function gameWon(time) {
    document.getElementById("timer").innerText = "You did it! Game won in: " + formatTime(time);
}

function startTimer(game) {
    const startTime = Date.now();
    game.timerRunning = setInterval(function() {
        game.timer = Date.now() - startTime;
        updateTime(game.timer);
    }, 1000);
}

// Gets the google sheet (needs to be public) and returns the row data
async function getGoogleSpreadsheet() {
    // me trying to call the app script to get the daily riddle
    // const googleApp = await fetch("https://script.googleapis.com/v1/scripts/AKfycbzizOk-EgTb6-h5BK95cbBYRsCWhDO_U01ytBlAiX2CfqZLW5eHGZaoqyKE6u2pjSBa:run")
    // let data1 = await response.json();

    const spreadsheetId = "13mRfFj6yvU6BV_kA4n7hS8m5R5SVR5bJehzcoMtE7Bs";
    // currently my key, change this to Joe's
    const apiKey = "AIzaSyC80r5vgJNtUHT2xxnkX6OylnmmQEVVJ6M";
    const riddleUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?key=${apiKey}&includeGridData=true`;
    const spreadsheetResponse = await fetch(riddleUrl);
    const spreadsheetData = await spreadsheetResponse.json();
    const allRows = spreadsheetData.sheets[0].data[0].rowData;
    return allRows;
}

// sanitize string by making lowercase and removing whitespace
function sanitize(str) {
    return str.trim().toLowerCase();
}

function makeButton() {
    var button = document.createElement("input");
    button.setAttribute("type", "submit");
    button.setAttribute("value", "Guess");
    return button;
}

function addInputs(parentDiv, riddle, isFirst, game) {
    var button = makeButton();
    var userInput = document.createElement("input");
    userInput.setAttribute("type", "text")
    button.addEventListener('click', function() {
        var inputText = userInput.value;
        const answer = isFirst ? riddle.firstWord : riddle.secondWord;
        if(sanitize(inputText) == sanitize(answer)) { 
            var icon = document.createElement("i");
            icon.classList.add("fa", "fa-check");
            button.replaceWith(icon);
            isFirst ? riddle.guessedFirst = true : riddle.guessedSecond = true;
            if (game.checkWin()) {
                gameWon(game.timer);
            }
        }
    }); 
    parentDiv.appendChild(button);
    parentDiv.appendChild(userInput);
}

function makeRiddleDiv(riddle, game) {
    var rowDiv = document.createElement("div");
    rowDiv.classList.add("row");
    
    var leftDiv = document.createElement("div");
    leftDiv.classList.add("column");
    var clueDiv = document.createElement("div");
    clueDiv.innerText = riddle.label + ": " + riddle.clue;
    leftDiv.appendChild(clueDiv);

    var rightDiv = document.createElement("div");
    rightDiv.classList.add("column");
    addInputs(rightDiv, riddle, true, game);
    addInputs(rightDiv, riddle, false, game);

    rowDiv.appendChild(leftDiv);
    rowDiv.appendChild(rightDiv);
    return rowDiv;
}

// TODO polish: add favicon, formatting, enter should submit, figure out api key, phone usable, font
window.onload = async function() {
    const millisToDays = 1000 * 60 * 60 * 24;
    // Starting day is Jan 13 2024
    const puzzleStartDate = new Date(2024, 0, 13, 0);
    const today = Date.now();
    const rowOffset = 1;
    const dailyRiddleIndex = Math.floor((today - puzzleStartDate) / millisToDays) + rowOffset;

    const spreadsheetRows = await getGoogleSpreadsheet();
    const titleRow = spreadsheetRows[0].values.map((cell) => cell.formattedValue);
    const dailyRow = spreadsheetRows[dailyRiddleIndex].values.map((cell) => cell.formattedValue);
    const game = new Game(titleRow, dailyRow);
    var mainDiv = document.getElementById("main");

    // Add riddle rows
    game.riddles.forEach((riddle) => {
        mainDiv.appendChild(makeRiddleDiv(riddle, game));
    });
    
    startTimer(game);
}