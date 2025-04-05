import backgroundImage from '../assets/background.png';

// Background styling component
export const GameBackground = ({ children }: { children: React.ReactNode }) => {
  return (
    <div 
      className="min-h-svh bg-background text-foreground dark"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(13, 6, 32, 0.85), rgba(27, 13, 65, 0.75)), url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {children}
    </div>
  );
};

export default GameBackground;
