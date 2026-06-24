import { useState } from "react";
import EchoGuardDiagram    from "./components/EchoGuardDiagram";
import EchoGuardSimulation from "./components/EchoGuardSimulation";
import EchoGuardMap        from "./components/EchoGuardMap";
import EchoGuardHistory    from "./components/EchoGuardHistory";
import { useSettings }     from "./hooks/useSettings";
import "./App.css";

const TABS = [
  { id: "diagram",    label: "Architecture Diagram" },
  { id: "simulation", label: "Live Simulation"      },
  { id: "map",        label: "GIS Map View"         },
  { id: "history",    label: "History & Settings"   },
];

export default function App() {
  const [activeTab, setActiveTab]   = useState("diagram");
  const { settings, updateSetting } = useSettings();

  return (
    <div className="app-wrapper">
      <header className="app-header">
        <h1>Echo-Guard IoT</h1>
        <p>Pipeline Vandalism Detection System — Maziv Technologies</p>
      </header>

      <nav className="tab-bar">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="tab-content">
        {activeTab === "diagram"    && <EchoGuardDiagram />}
        {activeTab === "simulation" && <EchoGuardSimulation settings={settings} />}
        {activeTab === "map"        && <EchoGuardMap settings={settings} />}
        {activeTab === "history"    && (
          <EchoGuardHistory
            settings={settings}
            onSettingsChange={updateSetting}
          />
        )}
      </main>
    </div>
  );
}