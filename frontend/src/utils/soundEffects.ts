import { store } from '../store';
import click1 from '../assets/click1.wav';
import click2 from '../assets/click2.wav';
import click3 from '../assets/click3.wav';
import click4 from '../assets/click4.wav';

// Array of click sound assets
const clickSounds = [click1, click2, click3, click4];

/**
 * Plays a random click sound effect
 */
export const playClickSound = (): void => {
  const { soundEffectsEnabled, soundEffectsVolume } = store.getState().audio;
  
  // Only play if sound effects are enabled
  if (!soundEffectsEnabled) return;
  
  // Get a random click sound
  const randomIndex = Math.floor(Math.random() * clickSounds.length);
  const soundToPlay = clickSounds[randomIndex];
  
  // Create and play the audio
  const audio = new Audio(soundToPlay);
  audio.volume = soundEffectsVolume;
  
  // Play the sound
  audio.play().catch(error => {
    console.error('Error playing sound:', error);
  });
};

/**
 * A higher-order function that adds click sound to any function
 * @param callback The function to wrap with sound
 * @returns A new function that plays sound and then calls the callback
 */
export const withClickSound = <T extends any[]>(callback: (...args: T) => void): (...args: T) => void => {
  return (...args: T) => {
    playClickSound();
    callback(...args);
  };
};
