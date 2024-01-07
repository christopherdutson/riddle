// Counts down from five minutes, change to count up
function startTimer() {
    const endTime = 5 * 60 * 1000 + new Date().getTime();
    var timerRunning = setInterval(function() {
        var now = new Date().getTime();
        var timeLeft = endTime - now;
    
        var minutes = Math.floor(timeLeft / (60 * 1000));
        var seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        document.getElementById("timer").innerHTML = "Timer: " + minutes + ":" + ("0" + seconds).slice(-2);
        if (timeLeft < 0) {
            clearInterval(timerRunning);
            document.getElementById("timer").innerHTML = "Time's up!";
        }
    }, 1000);
}

// Gets the google sheet (needs to be public) and returns the row data
async function getSpreadsheet() {
    // me trying to call the app script to get the daily riddle
    // const googleApp = await fetch("https://script.googleapis.com/v1/scripts/AKfycbzizOk-EgTb6-h5BK95cbBYRsCWhDO_U01ytBlAiX2CfqZLW5eHGZaoqyKE6u2pjSBa:run")
    // let data1 = await response.json();

    const spreadsheetId = "13mRfFj6yvU6BV_kA4n7hS8m5R5SVR5bJehzcoMtE7Bs";
    // currently my key, change this to Joe's
    const apiKey = "AIzaSyDo-obYI2AzC9f_cFk9F22pbjGetDLSCQI";
    const riddleUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?key=${apiKey}&includeGridData=true`;
    const spreadsheetResponse = await fetch(riddleUrl);
    const spreadsheetData = await spreadsheetResponse.json();
    const allRows = spreadsheetData.sheets[0].data[0].rowData;
    return allRows;
}

// Return the index corresponding to the current day
function dailyRiddleIndex() {
    return 1;
}

function addInputs(parentDiv, answer) {
    var button = document.createElement("input");
    button.setAttribute("type", "submit");
    button.setAttribute("value", "Check");
    var userInput = document.createElement("input");
    userInput.setAttribute("type", "text")
    button.addEventListener('click', function() {
        var inputText = userInput.value;
        if(inputText == answer) { // TODO: sanitize
            var icon = document.createElement("i");
            icon.classList.add("fa", "fa-check");
            button.replaceWith(icon);
        }
    }); 
    parentDiv.appendChild(button);
    parentDiv.appendChild(userInput);
}

window.onload = async function() {
    const spreadsheetRows = await getSpreadsheet();
    const dailyRow = spreadsheetRows[dailyRiddleIndex()].values.map((cell) => cell.formattedValue);
    const titleRow = spreadsheetRows[0].values.map((cell) => cell.formattedValue);
    var mainDiv = document.getElementById("main");

    for(let i = 0; i < 4; ++i) {
        const colIndex = 3 * i;
        var rowDiv = document.createElement("div");
        rowDiv.classList.add("row");
        
        var leftDiv = document.createElement("div");
        leftDiv.classList.add("column");
        const clueText = dailyRow[colIndex+1];
        var clueDiv = document.createElement("div");
        clueDiv.innerText = titleRow[colIndex+1] + ": " + clueText;
        leftDiv.appendChild(clueDiv);
        
        var rightDiv = document.createElement("div");
        rightDiv.classList.add("column");
        addInputs(rightDiv, dailyRow[colIndex+2]);
        addInputs(rightDiv, dailyRow[colIndex+3]);
        
        rowDiv.appendChild(leftDiv);
        rowDiv.appendChild(rightDiv);
        mainDiv.appendChild(rowDiv);
    }
    
    startTimer();
}

// https://script.googleapis.com/v1/scripts/AKfycbzizOk-EgTb6-h5BK95cbBYRsCWhDO_U01ytBlAiX2CfqZLW5eHGZaoqyKE6u2pjSBa:run
// Google Script Deployment ID: AKfycbzizOk-EgTb6-h5BK95cbBYRsCWhDO_U01ytBlAiX2CfqZLW5eHGZaoqyKE6u2pjSBa