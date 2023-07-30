const stopwatch = document.querySelector('.stopwatch');
const recordedTimes = document.getElementById('recorded-times');
let isRunning = false;
let interval;
let recordedTime = '00:00:00:00';
let worker;

// Function to format time values (prepend with zero if less than 10)
const formatTime = (timeValue) => {
    return timeValue.toString().padStart(2, '0');
};

// Function to start the Web Worker
const startWorker = () => {
    if (typeof Worker !== 'undefined') {
        if (!worker) {
            worker = new Worker('stopwatchWorker.js');
            worker.onmessage = (event) => {
                stopwatch.innerHTML = event.data;
                saveTimerValue(event.data);
            };
        }
        worker.postMessage({ command: 'start', initialTime: recordedTime });
    } else {
        console.log('Web Worker is not supported in this browser.');
    }
};

// Function to stop the Web Worker
const stopWorker = () => {
    if (worker) {
        worker.postMessage({ command: 'stop' });
    }
};

// Function to get the recorded time from the Web Worker
const getRecordedTimeFromWorker = () => {
    if (worker) {
        worker.postMessage({ command: 'getRecordedTime' });
    }
};

// Function to set the recorded time in the Web Worker
const setRecordedTimeInWorker = (time) => {
    if (worker) {
        worker.postMessage({ command: 'setRecordedTime', time });
    }
};

const start = () => {
    if (!isRunning) {
        recordedTime = stopwatch.innerHTML; // Update the recordedTime variable with the current content of the stopwatch
        startWorker(); // Start the Web Worker
        isRunning = true;
        stopwatch.contentEditable = false; // Disable contenteditable while the stopwatch is running
        document.getElementById('start').classList.remove('btn-start');
        document.getElementById('start').classList.add('btn-danger');
        document.getElementById('start').innerText = 'Stop';
    } else {
        stopWorker(); // Stop the Web Worker
        isRunning = false;
        stopwatch.contentEditable = true; // Enable contenteditable again when the stopwatch is stopped
        document.getElementById('start').classList.remove('btn-danger');
        document.getElementById('start').classList.add('btn-start');
        document.getElementById('start').innerText = 'Start';
    }
};

// Load the recorded time from the Web Worker when the page loads
getRecordedTimeFromWorker();

// Show info about the application
const showInfo = () => {
    window.alert(`This simple application is an alternative to Shodor's stopwatch but uses localStorage to store timestamps and the timer value.
    
More info can be found on Github at:

https://github.com/lagerqvr/improved-stopwatch`);
};

// Record the time
const record = () => {
    recordedTime = stopwatch.innerHTML;
    recordedTimes.value += `${recordedTime}\r\n`;
    saveTimes();
};

// Reset the stopwatch and clear localStorage
const reset = () => {
    clearInterval(interval);
    stopwatch.innerHTML = '00:00:00:00';
    recordedTime = 0;
    isRunning = false;
    saveTimes();
    clearLocalStorage();
};

// Function to clear relevant items from localStorage
const clearLocalStorage = () => {
    localStorage.removeItem('timerValue');
    localStorage.removeItem('fontSize');
};

// Increment the stopwatch
const increment = () => {
    // Split the stopwatch time into an array of [hours, minutes, seconds, hundredths of a second]
    const time = stopwatch.innerHTML.split(':');
    let hours = parseInt(time[0]);
    let minutes = parseInt(time[1]);
    let seconds = parseInt(time[2]);
    let hundredths = parseInt(time[3]);

    hundredths++;
    if (hundredths === 100) {
        hundredths = 0;
        seconds++;
        if (seconds === 60) {
            seconds = 0;
            minutes++;
            if (minutes === 60) {
                minutes = 0;
                hours++;
            }
        }
    }

    stopwatch.innerHTML = `${formatTime(hours)}:${formatTime(minutes)}:${formatTime(seconds)}:${formatTime(hundredths)}`;
    saveTimerValue(stopwatch.innerHTML);
};

// Change font size on radio button change and save to local storage
const changeFontSize = () => {
    const fontSize = document.querySelector('input[name="flexRadioDefault"]:checked').value;
    stopwatch.style.fontSize = fontSize + 'px';
    saveFontSize(fontSize);
};

// Save recorded times to local storage
const saveTimes = () => {
    localStorage.setItem('recordedTimes', recordedTimes.value);
};

// Save the timer value to local storage
const saveTimerValue = (timeValue) => {
    localStorage.setItem('timerValue', timeValue);
};

// Save the selected font size to local storage
const saveFontSize = (fontSize) => {
    localStorage.setItem('fontSize', fontSize);
};

// Function to clear recorded times and remove them from local storage
const clear = () => {
    recordedTimes.value = '';
    saveTimes(); // Save the cleared recorded times in local storage
};

// Load recorded times, timer value, and font size from local storage
const loadFromLocalStorage = () => {
    const savedRecordedTimes = localStorage.getItem('recordedTimes');
    const savedTimerValue = localStorage.getItem('timerValue');
    const savedFontSize = localStorage.getItem('fontSize');

    if (savedRecordedTimes) {
        recordedTimes.value = savedRecordedTimes;
    }

    if (savedTimerValue) {
        stopwatch.innerHTML = savedTimerValue;
    }

    if (savedFontSize) {
        stopwatch.style.fontSize = savedFontSize + 'px';
        // Check the corresponding radio button for the selected font size
        const fontSizeRadio = document.querySelector(`input[value="${savedFontSize}"]`);
        if (fontSizeRadio) {
            fontSizeRadio.checked = true;
        }
    }
};

// Export recorded times to a text file
function exportToTextFile() {
    // Get the data from the textarea
    const data = document.getElementById('recorded-times').value;

    // Add timestamp heading and empty row to the data
    const timestamp = new Date().toLocaleString();
    const newData = `Timestamps ${timestamp}\n \n${data}\n`;

    // Convert the data to a Blob
    const blob = new Blob([newData], { type: 'text/plain' });

    // Create a downloadable link
    const url = URL.createObjectURL(blob);

    // Create a link element
    const link = document.createElement('a');
    link.href = url;

    // Set the filename for the exported file
    link.download = 'timestamps.txt';

    // Programmatically trigger a click on the link to initiate the download
    link.click();

    // Release the object URL to free up resources
    URL.revokeObjectURL(url);
}

// Attach event listeners to the buttons
document.querySelector('#start').addEventListener('click', start);
document.getElementById('record').addEventListener('click', record);
document.getElementById('reset').addEventListener('click', reset);
document.getElementById('clear').addEventListener('click', clear);

// Attach event listener to the radio buttons for font size change
const fontSizeRadios = document.querySelectorAll('input[name="flexRadioDefault"]');
fontSizeRadios.forEach(radio => {
    radio.addEventListener('change', changeFontSize);
});

// Load recorded times, timer value, and font size from local storage when the page loads
loadFromLocalStorage();

// Save recorded times and font size in local storage whenever the textarea content changes or font size changes
recordedTimes.addEventListener('input', () => {
    saveTimes();
});

