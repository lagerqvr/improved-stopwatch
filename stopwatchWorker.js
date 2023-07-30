let interval;
let recordedTime = '00:00:00:00';
let isRunning = false;

const formatTime = (timeValue) => {
    return timeValue.toString().padStart(2, '0');
};

const increment = () => {
    const time = recordedTime.split(':').map(val => parseInt(val, 10));
    let [hours, minutes, seconds, hundredths] = time;

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
    if (event.data.command === 'start') {
        if (!isRunning) {
            recordedTime = event.data.initialTime; // Set the initial time received from the main thread
            interval = setInterval(increment, 10);
            isRunning = true;
        }
    } else if (event.data.command === 'stop') {
        clearInterval(interval);
        isRunning = false;
    } else if (event.data.command === 'getRecordedTime') {
        self.postMessage(recordedTime); // Send the recorded time back to the main thread
    } else if (event.data.command === 'setRecordedTime') {
        recordedTime = event.data.time;
        self.postMessage('Recorded time has been set.'); // Send a response back to the main thread
    }
});
