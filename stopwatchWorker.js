// Initialize variables for the stopwatch worker
let startTimestamp = null; // Timestamp when the stopwatch started
let recordedTime = '00:00:00:00'; // The recorded time in the format HH:MM:SS:HH
let isRunning = false; // Flag to track if the stopwatch is currently running or stopped

// Function to format time values with leading zeros
const formatTime = (timeValue) => {
    return timeValue.toString().padStart(2, '0');
};

// Function to update the recorded time and send it to the main thread
const updateStopwatch = (timestamp) => {
    if (isRunning) {
        const elapsedMilliseconds = timestamp - startTimestamp;
        const hundredths = Math.floor((elapsedMilliseconds / 10) % 100);
        const seconds = Math.floor((elapsedMilliseconds / 1000) % 60);
        const minutes = Math.floor((elapsedMilliseconds / (1000 * 60)) % 60);
        const hours = Math.floor((elapsedMilliseconds / (1000 * 60 * 60)) % 24);
        recordedTime = `${formatTime(hours)}:${formatTime(minutes)}:${formatTime(seconds)}:${formatTime(hundredths)}`;

        // Send the updated time back to the main thread for display
        self.postMessage(recordedTime);
        requestAnimationFrame(updateStopwatch);
    }
};

// Event listener for messages received from the main thread
self.addEventListener('message', (event) => {
    // Handle different commands sent from the main thread
    if (event.data.command === 'start') {
        // Start the stopwatch if it's not already running
        if (!isRunning) {
            startTimestamp = performance.now(); // Record the start timestamp
            isRunning = true;
            requestAnimationFrame(updateStopwatch);
        }
    } else if (event.data.command === 'stop') {
        // Stop the stopwatch
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