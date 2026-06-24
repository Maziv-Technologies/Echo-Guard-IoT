import { useState, useCallback } from "react";

export const DEFAULT_SETTINGS = {
  confidenceThreshold: 90,    // % — CNN confidence needed to confirm vandalism
  tickInterval:        3500,  // ms — how often the sim engine fires
  threatProbability:   18,    // % — chance of a threat event per tick
  ambientProbability:  14,    // % — chance of ambient noise per tick
  meshHopDelay:        400,   // ms — LoRa propagation delay per hop
  resetDelay:          5000,  // ms — how long before nodes reset after alert
  smsEnabled:          true,  // simulate SMS dispatch
  telegramEnabled:     true,  // simulate Telegram dispatch
  persistEnabled:      true,  // write events to SQLite backend
  autoSimulate:        true,  // auto-inject random events
};

export function useSettings() {
  const [settings, setSettings] = useState(() => {
    // Restore from localStorage if available
    try {
      const saved = localStorage.getItem("echoguard_settings");
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const updateSetting = useCallback((key, value) => {
    if (key === "__RESET__") {
      setSettings(DEFAULT_SETTINGS);
      localStorage.removeItem("echoguard_settings");
      return;
    }
    setSettings(prev => {
      const next = { ...prev, [key]: value };
      localStorage.setItem("echoguard_settings", JSON.stringify(next));
      return next;
    });
  }, []);

  return { settings, updateSetting };
}