import { forwardRef } from 'react';
import { Button as BaseButton, ButtonProps } from './button';
import { playClickSound } from '../../utils/soundEffects';
import { useAppSelector } from '../../store/hooks';

const SoundButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ onClick, ...props }, ref) => {
    const { soundEffectsEnabled } = useAppSelector(state => state.audio);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      // Play sound if enabled
      if (soundEffectsEnabled) {
        playClickSound();
      }
      
      // Call the original onClick handler if provided
      if (onClick) {
        onClick(e);
      }
    };

    return <BaseButton ref={ref} onClick={handleClick} {...props} />;
  }
);

SoundButton.displayName = 'SoundButton';

export { SoundButton };
