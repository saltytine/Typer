(function() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    const masterGain = audioContext.createGain();
    masterGain.gain.value = 0.15; // Set volume to 15%
    masterGain.connect(audioContext.destination);
    
    const envelopes = {
        standard: {
            attack: 0.005,
            decay: 0.1,
            sustain: 0.1,
            release: 0.1
        },
        space: {
            attack: 0.01,
            decay: 0.15,
            sustain: 0.1,
            release: 0.15
        },
        backspace: {
            attack: 0.008,
            decay: 0.12,
            sustain: 0.1,
            release: 0.12
        }
    };
    
    function createSound(frequency, envelope) {
        const oscillator = audioContext.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;
        
        const gainNode = audioContext.createGain();
        gainNode.gain.value = 0;
        
        oscillator.connect(gainNode);
        gainNode.connect(masterGain);
        
        return {
            oscillator,
            gainNode,
            envelope
        };
    }
    
    window.KeySoundModule = {
        audioContext,
        oscillator: createSound,
        envelopes
    };
})();
