// Global WebsimSocket instance
export const room = new WebsimSocket();

// Initialize function
export const initStore = async () => {
    await room.initialize();
    
    // Ensure we are subscribed to the files collection
    // This allows realtime updates when new files are added
    room.collection('files').subscribe((files) => {
        // We can use this hook for debugging or side effects
        // but React's useSyncExternalStore is better for UI
    });
};

export const formatBytes = (bytes, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

// Sound Manager
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

const loadSound = async (url) => {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return await audioContext.decodeAudioData(arrayBuffer);
};

// Preload buffers
let buffers = {};

export const initAudio = async () => {
    if(audioContext.state === 'suspended') audioContext.resume();
    try {
        buffers['boost'] = await loadSound('sfx_boost.mp3');
        buffers['complete'] = await loadSound('sfx_complete.mp3');
    } catch (e) {
        console.warn("Audio loading failed", e);
    }
};

export const playSound = (name) => {
    if (!buffers[name]) return;
    const source = audioContext.createBufferSource();
    source.buffer = buffers[name];
    source.connect(audioContext.destination);
    source.start(0);
};