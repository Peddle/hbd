import { LogEntry } from "../pages/ShipCombat";
import { ScrollArea } from "./ui/scroll-area";

interface CombatLogProps {
  entries: LogEntry[];
}

const CombatLog = ({ entries }: CombatLogProps) => {
  // Function to format timestamp
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  // Get color class based on log type
  const getLogTypeClass = (type: LogEntry["type"]) => {
    switch (type) {
      case "attack":
        return "text-red-400";
      case "defense":
        return "text-blue-400";
      case "movement":
        return "text-green-400";
      case "info":
        return "text-amber-400";
      case "system":
        return "text-purple-400";
      default:
        return "text-foreground";
    }
  };

  return (
    <ScrollArea className="h-64 w-full pr-4">
      <div className="space-y-2">
        {entries.map((entry) => (
          <div key={entry.id} className="text-sm border-l-2 pl-2 py-1" style={{ borderColor: getLogTypeClass(entry.type).replace('text', 'border') }}>
            <div className="flex items-start">
              <span className="text-xs text-muted-foreground mr-2">
                {formatTime(entry.timestamp)}
              </span>
              <span className={`${getLogTypeClass(entry.type)}`}>{entry.message}</span>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default CombatLog;
