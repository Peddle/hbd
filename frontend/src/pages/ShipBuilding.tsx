import { useState } from "react";
import { useAppDispatch } from "../store/hooks";
import { navigateTo } from "../store/slices/menuSlice";
import { SoundButton } from "../components/ui/sound-button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Checkbox } from "../components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Input } from "../components/ui/input";

interface ComponentItem {
  id: string;
  name: string;
  cost: number;
  selected: boolean;
}

interface ComponentCategory {
  name: string;
  items: ComponentItem[];
}

const ShipBuilding = () => {
  const dispatch = useAppDispatch();
  const [shipName, setShipName] = useState("Guardian Mk II");
  const [shipClass, setShipClass] = useState("Medium Cruiser");
  const [availableBC, setAvailableBC] = useState(1500);
  
  // Components with prices and selection state
  const [components, setComponents] = useState<ComponentCategory[]>([
    {
      name: "WEAPONS",
      items: [
        { id: "beam-laser", name: "Beam Laser", cost: 75, selected: true },
        { id: "fusion-missile", name: "Fusion Missile", cost: 125, selected: true },
        { id: "quantum-torpedo", name: "Quantum Torpedo", cost: 200, selected: false },
      ]
    },
    {
      name: "SHIELDS",
      items: [
        { id: "standard-shield", name: "Standard Shield", cost: 100, selected: true },
        { id: "advanced-shield", name: "Advanced Shield", cost: 200, selected: false },
      ]
    },
    {
      name: "ENGINES",
      items: [
        { id: "ion-drive", name: "Ion Drive", cost: 150, selected: true },
        { id: "hyper-drive", name: "Hyper Drive", cost: 250, selected: false },
      ]
    },
    {
      name: "SPECIAL",
      items: [
        { id: "targeting-computer", name: "Targeting Computer", cost: 50, selected: true },
        { id: "cloaking-device", name: "Cloaking Device", cost: 150, selected: false },
      ]
    }
  ]);
  
  // Calculate total cost based on selected components
  const totalCost = components.reduce(
    (sum, category) => 
      sum + category.items
        .filter(item => item.selected)
        .reduce((catSum, item) => catSum + item.cost, 0), 
    0
  );
  
  // Toggle component selection
  const toggleComponent = (categoryIndex: number, itemIndex: number) => {
    const newComponents = [...components];
    const item = newComponents[categoryIndex].items[itemIndex];
    
    // Check if deselecting would make the cost exceed available BC
    if (item.selected) {
      newComponents[categoryIndex].items[itemIndex].selected = !item.selected;
      setComponents(newComponents);
    } else {
      // Check if we can afford this component
      if (totalCost + item.cost <= availableBC) {
        newComponents[categoryIndex].items[itemIndex].selected = !item.selected;
        setComponents(newComponents);
      } else {
        alert("Not enough BC available!");
      }
    }
  };
  
  // Calculate ship statistics based on components
  const shipStats = {
    hull: 150,
    maxHull: 150,
    shields: components[1].items.find(i => i.selected)?.id === "advanced-shield" ? 200 : 100,
    attackPower: components[0].items.filter(i => i.selected).reduce((sum, i) => {
      if (i.id === "beam-laser") return sum + 15;
      if (i.id === "fusion-missile") return sum + 30;
      if (i.id === "quantum-torpedo") return sum + 45;
      return sum;
    }, 0),
    defenseRating: 35,
    speed: components[2].items.find(i => i.selected)?.id === "hyper-drive" ? 3 : 2,
    range: components[0].items.find(i => i.id === "quantum-torpedo" && i.selected) ? 7 : 5
  };
  
  return (
    <div className="container mx-auto py-8">
      <Card className="mb-6 bg-card/80 backdrop-blur-sm border-primary/30">
        <CardHeader className="bg-primary/20 rounded-t-lg border-b border-primary/20">
          <CardTitle className="text-center text-2xl text-white">SHIP DESIGN LABORATORY</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center">
              <span className="mr-2 text-white">SHIP NAME:</span>
              <Input 
                value={shipName} 
                onChange={(e) => setShipName(e.target.value)} 
                className="w-48 bg-black/30 border-primary/30"
              />
            </div>
            <div className="flex items-center justify-end">
              <span className="mr-2 text-white">CLASS:</span>
              <Select value={shipClass} onValueChange={setShipClass}>
                <SelectTrigger className="w-48 bg-black/30 border-primary/30">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Small Frigate">Small Frigate</SelectItem>
                  <SelectItem value="Medium Cruiser">Medium Cruiser</SelectItem>
                  <SelectItem value="Large Battleship">Large Battleship</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-white">BC AVAILABLE: {availableBC}</div>
            <div className="text-right text-white">COST: {totalCost} BC</div>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            {/* Ship Preview */}
            <div className="border border-primary/30 rounded-md p-4 h-60 flex items-center justify-center bg-black/20 backdrop-blur-sm">
              <div className="text-center">
                <div className="text-2xl mb-2 text-white">{shipName}</div>
                <div className="text-gray-300 mb-4">{shipClass}</div>
                <div className="w-32 h-32 bg-primary/10 mx-auto rounded-full flex items-center justify-center border border-primary/20 text-white">
                  SHIP PREVIEW
                </div>
              </div>
            </div>
            
            {/* Components */}
            <div className="border border-primary/30 rounded-md p-4 overflow-y-auto h-80 bg-black/20 backdrop-blur-sm">
              <h3 className="font-bold mb-2 text-white">COMPONENTS</h3>
              
              {components.map((category, catIndex) => (
                <div key={category.name} className="mb-4">
                  <h4 className="font-semibold text-primary">{category.name}</h4>
                  <div className="pl-2">
                    {category.items.map((item, itemIndex) => (
                      <div key={item.id} className="flex justify-between items-center my-1">
                        <div className="flex items-center">
                          <Checkbox 
                            id={item.id} 
                            checked={item.selected}
                            onCheckedChange={() => toggleComponent(catIndex, itemIndex)}
                          />
                          <label htmlFor={item.id} className="ml-2 text-white">{item.name}</label>
                        </div>
                        <span className="text-white">{item.cost} BC</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Ship Statistics */}
          <div className="border border-primary/30 rounded-md p-4 mt-4 bg-black/20 backdrop-blur-sm">
            <h3 className="font-bold mb-2 text-white">SHIP STATISTICS</h3>
            <div className="grid grid-cols-2 gap-2 text-white">
              <div>Hull Strength: {shipStats.hull}/{shipStats.maxHull}</div>
              <div>Shield Rating: {shipStats.shields}</div>
              <div>Attack Power: {shipStats.attackPower}</div>
              <div>Defense Rating: {shipStats.defenseRating}</div>
              <div>Speed: {shipStats.speed}</div>
              <div>Range: {shipStats.range}</div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-center space-x-4 mt-6">
            <SoundButton 
              className="bg-primary/80 hover:bg-primary"
              onClick={() => alert("Ship design saved!")}
            >
              DESIGN
            </SoundButton>
            <SoundButton 
              variant="outline"
              className="border-primary/50 text-white hover:bg-primary/20"
              onClick={() => {
                const defaultComponents = components.map(cat => ({
                  ...cat,
                  items: cat.items.map(item => ({ ...item, selected: false }))
                }));
                setComponents(defaultComponents);
              }}
            >
              CLEAR
            </SoundButton>
            <SoundButton 
              variant="default"
              className="bg-primary/80 hover:bg-primary"
              onClick={() => {
                alert("Ship saved to fleet!");
                dispatch(navigateTo('battle'));
              }}
            >
              SAVE
            </SoundButton>
            <SoundButton 
              variant="destructive" 
              onClick={() => dispatch(navigateTo('start'))}
            >
              CANCEL
            </SoundButton>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShipBuilding;
