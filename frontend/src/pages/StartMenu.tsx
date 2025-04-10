import { SoundButton } from "../components/ui/sound-button";
import { useAppDispatch } from "../store/hooks";
import { navigateTo } from "../store/slices/menuSlice";

const StartMenu = () => {
  const dispatch = useAppDispatch();
  
  return (
    <div className="flex flex-col items-center justify-center h-[80vh]">
      <div className="p-8 rounded-xl bg-black/40 backdrop-blur-sm flex flex-col items-center">
        <h1 className="text-6xl font-bold mb-12 text-white">GALACTIC CONQUEST</h1>
        
        <div className="flex flex-col space-y-4 w-64">
          <SoundButton 
            className="py-6 text-xl" 
            onClick={() => dispatch(navigateTo('battle'))}
          >
            START GAME
          </SoundButton>
          
          <SoundButton 
            className="py-6 text-xl"
            variant="outline"
            onClick={() => alert('Options not implemented yet')}
          >
            OPTIONS
          </SoundButton>
          
          <SoundButton 
            className="py-6 text-xl"
            variant="outline"
            onClick={() => alert('Load game not implemented yet')}
          >
            LOAD GAME
          </SoundButton>
        </div>
        
        <SoundButton 
          className="mt-6 text-lg"
          variant="link" 
          onClick={() => dispatch(navigateTo('shipbuilding'))}
        >
          SHIP BUILDING
        </SoundButton>
        
        <p className="mt-10 text-gray-400">Game Version 0.1.0 Alpha</p>
      </div>
    </div>
  );
};

export default StartMenu;
