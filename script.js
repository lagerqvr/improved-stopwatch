// DOM elements
const stopwatch = document.querySelector('.stopwatch');
const recordedTimes = document.getElementById('recorded-times');

// State variables
let isRunning = false; // Indicates if the stopwatch is currently running
let interval; // Interval ID for the stopwatch update
let recordedTime = '00:00:00:0'; // The current recorded time in the format 'HH:mm:ss:hh'
let worker; // Web Worker instance

// Function to format time values with leading zeros if less than 10
const formatTime = (timeValue) => {
    return timeValue.toString().padStart(2, '0');
};

// Function to start the Web Worker responsible for updating the stopwatch
const startWorker = () => {
    // Check if Web Worker is supported by the browser
    if (typeof Worker !== 'undefined') {
        if (!worker) {
            worker = new Worker('stopwatchWorker.js'); // Create a new Web Worker instance if it doesn't exist
            // Event listener to receive messages from the Web Worker
            worker.onmessage = (event) => {
                stopwatch.innerHTML = event.data; // Update the stopwatch display with the received data
                saveTimerValue(event.data); // Save the timer value in local storage
            };
        }
        worker.postMessage({ command: 'start', initialTime: recordedTime }); // Start the Web Worker with the initial recorded time
    } else {
        console.log('Web Worker is not supported in this browser.');
    }
};

// Function to stop the Web Worker responsible for updating the stopwatch
const stopWorker = () => {
    if (worker) {
        worker.postMessage({ command: 'stop' }); // Send 'stop' command to the Web Worker
    }
};

// Function to request the recorded time from the Web Worker
const getRecordedTimeFromWorker = () => {
    if (worker) {
        worker.postMessage({ command: 'getRecordedTime' }); // Send 'getRecordedTime' command to the Web Worker
    }
};

// Function to set the recorded time in the Web Worker
const setRecordedTimeInWorker = (time) => {
    if (worker) {
        worker.postMessage({ command: 'setRecordedTime', time }); // Send 'setRecordedTime' command to the Web Worker with the specified time
    }
};

// Function to start or stop the stopwatch
const start = () => {
    if (!isRunning) { // Start the stopwatch
        recordedTime = stopwatch.innerHTML; // Update the recordedTime variable with the current stopwatch content
        startWorker(); // Start the Web Worker to update the stopwatch
        isRunning = true;
        stopwatch.contentEditable = false; // Disable contenteditable while the stopwatch is running
        document.getElementById('start').classList.remove('btn-start'); // Change the button style
        document.getElementById('start').classList.add('btn-danger');
        document.getElementById('start').innerText = 'Stop'; // Change the button text
    } else { // Stop the stopwatch
        stopWorker(); // Stop the Web Worker
        isRunning = false;
        stopwatch.contentEditable = true; // Enable contenteditable again when the stopwatch is stopped
        document.getElementById('start').classList.remove('btn-danger'); // Change the button style back to its initial state
        document.getElementById('start').classList.add('btn-start');
        document.getElementById('start').innerText = 'Start'; // Change the button text back to its initial state
    }
};

// Load the recorded time from the Web Worker when the page loads
getRecordedTimeFromWorker();

// Show information about the application
const showInfo = () => {
    window.alert(`This simple application is an alternative to Shodor's stopwatch but uses localStorage to store timestamps and the timer value.\n\nMore info can be found on Github at:\n\nhttps://github.com/lagerqvr/improved-stopwatch`);
};

// Record the current time to the recorded times list
const record = () => {
    recordedTime = stopwatch.innerHTML;
    recordedTimes.value += `${recordedTime}\r\n`;
    saveTimes(); // Save the recorded times in local storage
};

// Reset the stopwatch and clear local storage
const reset = () => {
    clearInterval(interval);
    stopwatch.innerHTML = '00:00:00:0';
    recordedTime = '00:00:00:0'; // Reset the recordedTime variable to its initial value
    isRunning = false;
    saveTimes(); // Save the recorded times in local storage
    clearLocalStorage(); // Clear relevant items from local storage
};

// Function to clear relevant items from local storage
const clearLocalStorage = () => {
    localStorage.removeItem('timerValue');
    localStorage.removeItem('fontSize');
};

// Increment the stopwatch time
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
    saveTimerValue(stopwatch.innerHTML); // Save the updated stopwatch value in local storage
};

// Change font size on radio button change and save to local storage
const changeFontSize = () => {
    const fontSize = document.querySelector('input[name="flexRadioDefault"]:checked').value;
    stopwatch.style.fontSize = fontSize + 'px';
    saveFontSize(fontSize); // Save the selected font size in local storage
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
document.querySelector('#start').addEventListener('click', start); // Start/Stop button
document.getElementById('record').addEventListener('click', record); // Record button
document.getElementById('reset').addEventListener('click', reset); // Reset button
document.getElementById('clear').addEventListener('click', clear); // Clear button

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
