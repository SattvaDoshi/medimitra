// Audio Testing Utilities
// Use this in browser console to test audio functionality

// Test base64 audio decoding
function testBase64Audio(base64String) {
  try {
    console.log('Testing base64 audio with length:', base64String.length);
    
    // Convert base64 to audio blob
    const binaryString = atob(base64String);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const audioBlob = new Blob([bytes], { type: 'audio/wav' });
    const audioUrl = URL.createObjectURL(audioBlob);
    
    console.log('Created audio URL:', audioUrl);
    console.log('Audio blob size:', audioBlob.size, 'bytes');
    
    // Create and play audio element
    const audio = new Audio(audioUrl);
    audio.volume = 0.8;
    
    audio.onloadedmetadata = () => {
      console.log('Audio duration:', audio.duration, 'seconds');
    };
    
    audio.onended = () => {
      console.log('Audio playback ended');
      URL.revokeObjectURL(audioUrl);
    };
    
    audio.onerror = (error) => {
      console.error('Audio playback error:', error);
      URL.revokeObjectURL(audioUrl);
    };
    
    audio.play().then(() => {
      console.log('Audio playback started successfully');
    }).catch(error => {
      console.error('Failed to play audio:', error);
    });
    
    return audio;
    
  } catch (error) {
    console.error('Failed to process base64 audio:', error);
    return null;
  }
}

// Test browser audio capabilities
function testAudioCapabilities() {
  console.log('=== Audio Capabilities Test ===');
  
  // Check Audio support
  console.log('Audio constructor available:', typeof Audio !== 'undefined');
  
  // Check Web Audio API
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  console.log('Web Audio API available:', typeof AudioContext !== 'undefined');
  
  // Check common audio formats
  const audio = new Audio();
  console.log('WAV support:', audio.canPlayType('audio/wav'));
  console.log('MP3 support:', audio.canPlayType('audio/mpeg'));
  console.log('OGG support:', audio.canPlayType('audio/ogg'));
  
  // Check autoplay policy
  audio.play().then(() => {
    console.log('Autoplay allowed');
    audio.pause();
  }).catch(error => {
    console.log('Autoplay blocked:', error.name);
  });
  
  return {
    audioAvailable: typeof Audio !== 'undefined',
    webAudioAvailable: typeof AudioContext !== 'undefined',
    formats: {
      wav: audio.canPlayType('audio/wav'),
      mp3: audio.canPlayType('audio/mpeg'),
      ogg: audio.canPlayType('audio/ogg')
    }
  };
}

// Instructions for testing
console.log(`
=== Audio Testing Instructions ===

1. Test audio capabilities:
   testAudioCapabilities()

2. Test with real base64 audio from backend:
   testBase64Audio('your_base64_string_here')

3. Enable audio in browser:
   - Allow autoplay for localhost
   - Check volume is not muted
   - Grant microphone permissions

4. Common issues:
   - Autoplay policy blocks audio
   - CORS issues with audio files
   - Invalid base64 encoding
   - Wrong audio format
`);

// Export functions for global use
window.testBase64Audio = testBase64Audio;
window.testAudioCapabilities = testAudioCapabilities;