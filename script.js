const stopwatch = document.querySelector('.stopwatch');
const recordedTimes = document.getElementById('recorded-times');
let isRunning = false;
let interval;
let recordedTime = 0;

// Start the stopwatch
const start = () => {
    if (!isRunning) {
        interval = setInterval(increment, 10);
        isRunning = true;
    }
};

// Record the time
const record = () => {
    recordedTime = stopwatch.innerHTML;
    recordedTimes.value += `${recordedTime}\r\n`;
};

// Reset the stopwatch
const reset = () => {
    clearInterval(interval);
    stopwatch.innerHTML = '00:00:00:00';
    recordedTimes.value = '';
    recordedTime = 0;
    isRunning = false;
};

// Increment the stopwatch
const increment = () => {
    // Split the stopwatch time into an array of [minutes, seconds, hundredths of a second]
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

    stopwatch.innerHTML = `${hours}:${minutes}:${seconds}:${hundredths}`;
};

// Change font size on radio button change
const changeFontSize = () => {
    const fontSize = document.querySelector('input[name="flexRadioDefault"]:checked').value;
    stopwatch.style.fontSize = fontSize + 'px';
};

// Attach event listeners to the buttons
document.getElementById('start').addEventListener('click', start);
document.getElementById('record').addEventListener('click', record);
document.getElementById('reset').addEventListener('click', reset);