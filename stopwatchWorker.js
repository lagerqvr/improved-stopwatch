// Initialize variables for the stopwatch worker
let interval; // The interval used for updating the stopwatch time
let recordedTime = '00:00:00:00'; // The recorded time in the format HH:MM:SS:HH
let isRunning = false; // Flag to track if the stopwatch is currently running or stopped

// Function to format time values with leading zeros
const formatTime = (timeValue) => {
    return timeValue.toString().padStart(2, '0');
};

// Function to increment the recorded time and update the stopwatch display
const increment = () => {
    // Split the recorded time into individual components and convert them to integers
    const time = recordedTime.split(':').map(val => parseInt(val, 10));
    let [hours, minutes, seconds, hundredths] = time;

    // Increment hundredths of a second
    hundredths++;
    if (hundredths === 100) {
        hundredths = 0;
        seconds++;

        // Increment seconds and handle minute and hour rollovers
        if (seconds === 60) {
            seconds = 0;
            minutes++;
            if (minutes === 60) {
                minutes = 0;
                hours++;
            }
        }
    }

    // Update the recorded time with the newly calculated values
    recordedTime = `${formatTime(hours)}:${formatTime(minutes)}:${formatTime(seconds)}:${formatTime(hundredths)}`;

    // Send the updated time back to the main thread for display
    self.postMessage(recordedTime);
};

// Event listener for messages received from the main thread
self.addEventListener('message', (event) => {
    // Handle different commands sent from the main thread
    if (event.data.command === 'start') {
        // Start the stopwatch if it's not already running
        if (!isRunning) {
            recordedTime = event.data.initialTime; // Set the initial time received from the main thread
            interval = setInterval(increment, 10); // Start the interval to update the time every 10ms
            isRunning = true;
        }
    } else if (event.data.command === 'stop') {
        // Stop the stopwatch and clear the interval
        clearInterval(interval);
        isRunning = false;
    } else if (event.data.command === 'getRecordedTime') {
        // Send the recorded time back to the main thread
        self.postMessage(recordedTime);
    } else if (event.data.command === 'setRecordedTime') {
        // Set the recorded time to the new value received from the main thread
        recordedTime = event.data.time;
        // Send a response back to the main thread to acknowledge the time update
        self.postMessage('Recorded time has been set.');
    }
});
