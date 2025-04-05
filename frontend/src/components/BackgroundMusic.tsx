import { useEffect, useRef, useState } from 'react';
import backgroundMusic from '../assets/background.wav';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { toggleMusic, setMusicVolume, toggleSoundEffects } from '../store/slices/audioSlice';

const BackgroundMusic = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const dispatch = useAppDispatch();
  const { musicEnabled, musicVolume, soundEffectsEnabled } = useAppSelector((state) => state.audio);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Track user interaction with the page
  useEffect(() => {
    const handleInteraction = () => {
      console.log("User interaction detected");
      setHasInteracted(true);
      
      // Clean up event listeners once interaction is detected
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      
      // Try to play audio after user interaction
      if (audioRef.current && musicEnabled) {
        console.log("Attempting to play audio after interaction");
        audioRef.current.play()
          .then(() => {
            console.log("Audio playing successfully after interaction");
          })
          .catch(error => {
            console.error('Error playing audio after interaction:', error);
          });
      }
    };

    // Add event listeners to detect user interaction
    window.addEventListener('click', handleInteraction);
    window.addEventListener('keydown', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);

    console.log("Audio component mounted, music enabled:", musicEnabled);

    return () => {
      // Clean up
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, [musicEnabled]);

  // Initialize audio when component mounts
  useEffect(() => {
    if (audioRef.current) {
      console.log("Audio element referenced, setting properties");
      audioRef.current.volume = musicVolume;
      audioRef.current.loop = true;
      audioRef.current.muted = false; // Ensure it's not muted

      // Set up event listeners for the audio element
      const handleCanPlay = () => {
        console.log("Audio can play event fired");
        if (hasInteracted && musicEnabled) {
          console.log("Attempting to play after canplay event");
          audioRef.current?.play()
            .then(() => {
              console.log("Started playing after canplay");
            })
            .catch(e => {
              console.error("Playback error after canplay:", e);
            });
        }
      };
      
      const handlePlay = () => {
        console.log("Audio play event fired");
      };
      
      const handlePause = () => {
        console.log("Audio paused");
      };
      
      const handleError = (e: Event) => {
        console.error("Audio error:", e);
      };

      audioRef.current.addEventListener('canplay', handleCanPlay);
      audioRef.current.addEventListener('play', handlePlay);
      audioRef.current.addEventListener('pause', handlePause);
      audioRef.current.addEventListener('error', handleError);

      // Force the loading of the audio file
      audioRef.current.load();

      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('canplay', handleCanPlay);
          audioRef.current.removeEventListener('play', handlePlay);
          audioRef.current.removeEventListener('pause', handlePause);
          audioRef.current.removeEventListener('error', handleError);
          audioRef.current.pause();
        }
      };
    }
  }, [hasInteracted, musicEnabled, musicVolume]);

  // Update audio playback status when musicEnabled changes
  useEffect(() => {
    if (audioRef.current) {
      if (musicEnabled && hasInteracted) {
        console.log("Attempting to play due to musicEnabled becoming true");
        audioRef.current.play()
          .then(() => {
            console.log("Playing after musicEnabled changed to true");
          })
          .catch(e => {
            console.error("Error playing after musicEnabled changed:", e);
          });
      } else if (!musicEnabled && !audioRef.current.paused) {
        console.log("Pausing due to musicEnabled becoming false");
        audioRef.current.pause();
      }
    }
  }, [musicEnabled, hasInteracted]);

  // Handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      console.log("Setting volume to", musicVolume);
      audioRef.current.volume = musicVolume;
    }
  }, [musicVolume]);

  // Handle manual play/pause when toggle button is clicked
  const handleToggleMusic = () => {
    console.log("Toggle music button clicked");
    setHasInteracted(true); // Mark that user has interacted
    dispatch(toggleMusic());
  };

  const handleToggleSoundEffects = () => {
    dispatch(toggleSoundEffects());
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasInteracted(true); // Mark that user has interacted
    const newVolume = parseFloat(e.target.value);
    dispatch(setMusicVolume(newVolume));
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center space-x-2 bg-black/40 backdrop-blur-sm p-2 rounded-full">
      <audio ref={audioRef} src={backgroundMusic} preload="auto" />
      
      {/* Music toggle button */}
      <button 
        onClick={handleToggleMusic}
        className="w-8 h-8 flex items-center justify-center bg-primary/80 hover:bg-primary text-white rounded-full"
        title={musicEnabled ? "Pause Music" : "Play Music"}
      >
        {musicEnabled ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="6" y="4" width="4" height="16"></rect>
            <rect x="14" y="4" width="4" height="16"></rect>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        )}
      </button>
      
      {/* Volume slider */}
      <div className="px-2 flex items-center space-x-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
        </svg>
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.01" 
          value={musicVolume}
          onChange={handleVolumeChange}
          className="w-16 h-2 accent-primary"
        />
      </div>
      
      {/* Sound effects toggle button */}
      <button
        onClick={handleToggleSoundEffects}
        className={`w-8 h-8 flex items-center justify-center ${
          soundEffectsEnabled ? 'bg-primary/80 hover:bg-primary' : 'bg-gray-600/50 hover:bg-gray-600'
        } text-white rounded-full ml-2`}
        title={soundEffectsEnabled ? "Disable Sound Effects" : "Enable Sound Effects"}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 10L2 14C2 16 3 17 5 17H7C7.5 17 8 17.5 8 18V22L13 17H19C21 17 22 16 22 14V10" />
          <path d="M22 6V7C22 9 21 10 19 10H16" />
          <path d="M2 6V7C2 9 3 10 5 10H9" />
          <path d="M11 10H13" />
        </svg>
      </button>
      
      <div className="text-xs text-white ml-2">
        <span className="text-primary font-bold">SFX:</span> {soundEffectsEnabled ? 'ON' : 'OFF'}
      </div>
    </div>
  );
};

export default BackgroundMusic;
