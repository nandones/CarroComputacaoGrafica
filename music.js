// music.js

// Create an audio context
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Load and play a music file
function playMusic(url) {
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.arrayBuffer();
        })
        .then(data => audioContext.decodeAudioData(data))
        .then(buffer => {
            const source = audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContext.destination);
            source.start(0);
        })
        .catch(error => console.error('Error playing music:', error));
}

// Example usage:
// Call this function with the URL of the music file you want to play
playMusic('public/sounds/Shooting_Stars.mp3');
