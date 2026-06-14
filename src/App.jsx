import { useState } from "react";
import EchoGuardDiagram    from "./components/EchoGuardDiagram";
import EchoGuardSimulation from "./components/EchoGuardSimulation";
import EchoGuardMap        from "./components/EchoGuardMap";
import "./App.css";

const tabs = [
  { id: "diagram",    label: "Architecture Diagram" },
  { id: "simulation", label: "Live Simulation"      },
  { id: "map",        label: "GIS Map View"         },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("diagram");

  return (
    <div className="app-wrapper">
      <header className="app-header">
        <h1>Echo-Guard IoT</h1>
        <p>Pipeline Vandalism Detection System — Maziv Technologies</p>
      </header>

      <nav className="tab-bar">
        {tabs.map(tab => (
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
        {activeTab === "simulation" && <EchoGuardSimulation />}
        {activeTab === "map"        && <EchoGuardMap />}
      </main>
    </div>
  );
}