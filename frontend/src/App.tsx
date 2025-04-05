import { useAppSelector } from "./store/hooks";
import StartMenu from "./pages/StartMenu";
import ShipCombat from "./pages/ShipCombat";
import ShipBuilding from "./pages/ShipBuilding";
import GameBackground from "./components/GameBackground";
import BackgroundMusic from "./components/BackgroundMusic";

function App() {
  const activeMenu = useAppSelector((state) => state.menu.activeMenu);
  
  return (
    <GameBackground>
      <main className="h-screen box-border">
        {activeMenu === 'start' && <StartMenu />}
        {activeMenu === 'battle' && (
          <>
            <ShipCombat />
          </>
        )}
        {activeMenu === 'shipbuilding' && <ShipBuilding />}
      </main>
      <BackgroundMusic />
    </GameBackground>
  )
}

export default App
