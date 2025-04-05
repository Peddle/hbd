import { store } from '@/store';

// Import sound effects
import buttonClickSound from '@/assets/click1.wav';
import buttonHoverSound from '@/assets/button_mouse_over.wav';

// Preload audio for better performance
const clickAudio = new Audio(buttonClickSound);
const hoverAudio = new Audio(buttonHoverSound);

// Configure the audio objects
clickAudio.volume = 0.7;
hoverAudio.volume = 0.4;

/**
 * Plays a sound effect if sound effects are enabled in the store
 * @param audio The Audio object to play
 */
export const playSoundEffect = (audio: HTMLAudioElement) => {
  const state = store.getState();
  const { soundEffectsEnabled, soundEffectsVolume } = state.audio;
  
  if (soundEffectsEnabled) {
    // Create a clone to allow overlapping sounds
    const clonedAudio = audio.cloneNode(true) as HTMLAudioElement;
    clonedAudio.volume = audio.volume * soundEffectsVolume;
    
    // Play the sound
    clonedAudio.play().catch(error => {
      console.error('Error playing sound effect:', error);
    });
  }
};

/**
 * Plays the button click sound effect
 */
export const playButtonClickSound = () => {
  playSoundEffect(clickAudio);
};

/**
 * Plays the button hover sound effect
 */
export const playButtonHoverSound = () => {
  playSoundEffect(hoverAudio);
};
