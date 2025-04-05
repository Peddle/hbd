import { useEffect, useRef } from 'react';
import backgroundMusic from '../assets/background.wav';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { toggleMusic, setMusicVolume } from '../store/slices/audioSlice';

const BackgroundMusic = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const dispatch = useAppDispatch();
  const { musicEnabled, musicVolume } = useAppSelector((state) => state.audio);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = musicVolume;
      audioRef.current.loop = true;

      // Try to play if music is enabled
      if (musicEnabled) {
        const playPromise = audioRef.current.play();
        
        // Handle autoplay restrictions
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            // Autoplay was prevented
            console.log('Autoplay was prevented:', error);
          });
        }
      } else {
        audioRef.current.pause();
      }
    }
  }, [musicEnabled, musicVolume]);

  // Update audio element volume when Redux state changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = musicVolume;
    }
  }, [musicVolume]);

  // Play/pause when musicEnabled changes
  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    if (musicEnabled) {
      const playPromise = audioElement.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => console.log("Playback error:", e));
      }
    } else {
      audioElement.pause();
    }
  }, [musicEnabled]);

  const handleToggleMusic = () => {
    dispatch(toggleMusic());
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    dispatch(setMusicVolume(newVolume));
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center space-x-2 bg-black/40 backdrop-blur-sm p-2 rounded-full">
      <audio ref={audioRef} src={backgroundMusic} />
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
    </div>
  );
};

export default BackgroundMusic;
