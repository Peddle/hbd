import ShipCombat from "./pages/ShipCombat"

function App() {
  return (
    <div className="min-h-svh bg-background text-foreground dark">
      <header className="py-4 px-6 bg-card border-b border-border">
        <h1 className="text-2xl font-bold">
          Galactic Conquest
        </h1>
      </header>
      <main>
        <ShipCombat />
      </main>
    </div>
  )
}

export default App
