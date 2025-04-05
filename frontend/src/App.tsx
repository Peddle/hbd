import { useAppSelector } from "./store/hooks";
import StartMenu from "./pages/StartMenu";
import ShipCombat from "./pages/ShipCombat";
import ShipBuilding from "./pages/ShipBuilding";
import ReduxTest from "./components/ReduxTest";
import GameBackground from "./components/GameBackground";
import BackgroundMusic from "./components/BackgroundMusic";

function App() {
  const activeMenu = useAppSelector((state) => state.menu.activeMenu);
  
  return (
    <GameBackground>
      <header className="py-4 px-6 bg-card/70 backdrop-blur-sm border-b border-border">
        <h1 className="text-2xl font-bold">
          Galactic Conquest
        </h1>
      </header>
      <main>
        {activeMenu === 'start' && <StartMenu />}
        {activeMenu === 'battle' && (
          <>
            <div className="container mx-auto py-4">
              <ReduxTest />
            </div>
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
