// Initialize variables for the stopwatch worker
let startTimestamp = null; // Timestamp when the stopwatch started
let initialElapsedMilliseconds = 0; // Elapsed milliseconds from the initial recorded time
let recordedTime = '00:00:00:0'; // The recorded time in the format HH:MM:SS:H
let isRunning = false; // Flag to track if the stopwatch is currently running or stopped

// Function to format time values with leading zeros
const formatTime = (timeValue) => {
    return timeValue.toString().padStart(2, '0');
};

// Function to update the recorded time and send it to the main thread
const updateStopwatch = (timestamp) => {
    if (isRunning) {
        const elapsedMilliseconds = timestamp - startTimestamp + initialElapsedMilliseconds;
        const tenths = Math.floor((elapsedMilliseconds / 100) % 10); // Extract tenths of a second
        const seconds = Math.floor((elapsedMilliseconds / 1000) % 60);
        const minutes = Math.floor((elapsedMilliseconds / (1000 * 60)) % 60);
        const hours = Math.floor((elapsedMilliseconds / (1000 * 60 * 60)) % 24);
        recordedTime = `${formatTime(hours)}:${formatTime(minutes)}:${formatTime(seconds)}:${tenths}`;

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
            initialElapsedMilliseconds = 0; // Reset initial elapsed time to 0
            if (event.data.initialTime) {
                // Calculate the elapsed time from the initial recorded time, including tenths of a second
                const initialTimeParts = event.data.initialTime.split(':').map((val) => parseInt(val, 10));
                const initialHours = initialTimeParts[0] || 0;
                const initialMinutes = initialTimeParts[1] || 0;
                const initialSeconds = initialTimeParts[2] || 0;
                const initialTenths = initialTimeParts[3] || 0;
                initialElapsedMilliseconds =
                    initialTenths * 100 +
                    initialSeconds * 1000 +
                    initialMinutes * 60 * 1000 +
                    initialHours * 60 * 60 * 1000;
            }
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
