let interval;
let recordedTime = '00:00:00:00';
let isRunning = false;

const formatTime = (timeValue) => {
    return timeValue.toString().padStart(2, '0');
};

const increment = () => {
    const time = recordedTime.split(':');
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

    recordedTime = `${formatTime(hours)}:${formatTime(minutes)}:${formatTime(seconds)}:${formatTime(hundredths)}`;
    self.postMessage(recordedTime); // Send the updated time back to the main thread
};

self.addEventListener('message', (event) => {
    if (event.data === 'start') {
        if (!isRunning) {
            interval = setInterval(increment, 10);
            isRunning = true;
        }
    } else if (event.data === 'stop') {
        clearInterval(interval);
        isRunning = false;
    } else if (event.data === 'getRecordedTime') {
        self.postMessage(recordedTime); // Send the recorded time back to the main thread
    } else if (event.data.startsWith('setRecordedTime:')) {
        recordedTime = event.data.split(':')[1];
        self.postMessage('Recorded time has been set.'); // Send a response back to the main thread
    }
});
