import React, { useRef } from 'react';
import { Activity, Radio, Cloud, AlertTriangle, Wifi, Cpu, Database, Bell, Download } from 'lucide-react';
import html2canvas from 'html2canvas';

const EchoGuardDiagram = () => {
  const diagramRef = useRef(null);

  const downloadAsPNG = async () => {
    try {
      const element = diagramRef.current;
      
      // Generate canvas from the HTML element
      const canvas = await html2canvas(element, {
        scale: 2, // Higher resolution
        backgroundColor: '#0f172a',
        logging: false,
        useCORS: true
      });
      
      // Convert to PNG and download
      const link = document.createElement('a');
      link.download = 'echo-guard-iot-architecture.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error generating PNG:', error);
      alert('Unable to generate PNG. Please try taking a screenshot instead.');
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      {/* Download Button */}
      <div className="max-w-6xl mx-auto mb-4 flex justify-end">
        <button
          onClick={downloadAsPNG}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" />
          Download as PNG
        </button>
      </div>

      <div ref={diagramRef} className="max-w-6xl mx-auto bg-gradient-to-br from-slate-900 to-slate-800 p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Echo-Guard IoT Architecture</h1>
          <p className="text-slate-300">Real-Time Pipeline Vandalism Detection System</p>
        </div>

        {/* Main Architecture */}
        <div className="space-y-6">
          
          {/* Tier 1: Edge Nodes */}
          <div className="bg-slate-800 rounded-lg p-6 border-2 border-blue-500">
            <div className="flex items-center mb-4">
              <div className="bg-blue-500 rounded-full p-2 mr-3">
                <Cpu className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">TIER 1: Edge-AI Sensing Nodes</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Sensor Node */}
              <div className="bg-slate-700 rounded p-4">
                <h3 className="font-semibold text-blue-300 mb-3 flex items-center">
                  <Activity className="w-4 h-4 mr-2" />
                  Sensors
                </h3>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>• Tri-axial Accelerometer</li>
                  <li>• Piezo-electric Microphone</li>
                  <li>• GPS Tracker</li>
                  <li>• Anti-tamper Detection</li>
                </ul>
              </div>

              {/* Processing */}
              <div className="bg-slate-700 rounded p-4">
                <h3 className="font-semibold text-blue-300 mb-3 flex items-center">
                  <Cpu className="w-4 h-4 mr-2" />
                  Edge Processing
                </h3>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>• ESP32/STM32 MCU</li>
                  <li>• Fast Fourier Transform</li>
                  <li>• TinyML CNN Model</li>
                  <li>• Solar Power Management</li>
                </ul>
              </div>

              {/* Detection */}
              <div className="bg-slate-700 rounded p-4">
                <h3 className="font-semibold text-blue-300 mb-3 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Detection
                </h3>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>• Hammer strikes</li>
                  <li>• Hacksaw friction</li>
                  <li>• Motorized drilling</li>
                  <li>• Heavy vehicle rumble</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Arrow Down */}
          <div className="flex justify-center">
            <div className="text-4xl text-blue-400">↓</div>
          </div>

          {/* Tier 2: Acoustic Fingerprinting */}
          <div className="bg-slate-800 rounded-lg p-6 border-2 border-green-500">
            <div className="flex items-center mb-4">
              <div className="bg-green-500 rounded-full p-2 mr-3">
                <Database className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">TIER 2: AI Model & Acoustic Fingerprinting</h2>
            </div>
            
            <div className="bg-slate-700 rounded p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-green-300 mb-3">Machine Learning Pipeline</h3>
                  <ul className="text-sm text-slate-300 space-y-2">
                    <li>→ Lightweight CNN on-device</li>
                    <li>→ Acoustic signature library</li>
                    <li>→ Multi-sensor data fusion</li>
                    <li>→ 90%+ confidence threshold</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-green-300 mb-3">Decision Logic</h3>
                  <div className="bg-slate-800 rounded p-3 text-sm text-slate-300">
                    <p className="mb-2"><span className="text-green-400">IF</span> Vandalism signature detected</p>
                    <p className="mb-2"><span className="text-green-400">AND</span> Confidence &gt; 90%</p>
                    <p><span className="text-green-400">THEN</span> Trigger immediate alert</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Arrow Down */}
          <div className="flex justify-center">
            <div className="text-4xl text-blue-400">↓</div>
          </div>

          {/* Tier 3: Mesh Network */}
          <div className="bg-slate-800 rounded-lg p-6 border-2 border-purple-500">
            <div className="flex items-center mb-4">
              <div className="bg-purple-500 rounded-full p-2 mr-3">
                <Radio className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">TIER 3: LoRaWAN Mesh Network</h2>
            </div>
            
            <div className="bg-slate-700 rounded p-4">
              <div className="flex items-center justify-center mb-4">
                <div className="flex items-center space-x-4 md:space-x-8 flex-wrap justify-center">
                  <div className="text-center">
                    <div className="bg-purple-600 rounded-full w-16 h-16 flex items-center justify-center mb-2">
                      <Wifi className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-xs text-slate-300">Node A</p>
                  </div>
                  
                  <div className="text-2xl text-purple-400">⟷</div>
                  
                  <div className="text-center">
                    <div className="bg-purple-600 rounded-full w-16 h-16 flex items-center justify-center mb-2">
                      <Wifi className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-xs text-slate-300">Node B</p>
                  </div>
                  
                  <div className="text-2xl text-purple-400">⟷</div>
                  
                  <div className="text-center">
                    <div className="bg-purple-600 rounded-full w-16 h-16 flex items-center justify-center mb-2">
                      <Wifi className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-xs text-slate-300">Node C</p>
                  </div>
                  
                  <div className="text-2xl text-purple-400">→</div>
                  
                  <div className="text-center">
                    <div className="bg-orange-600 rounded-full w-16 h-16 flex items-center justify-center mb-2">
                      <Cloud className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-xs text-slate-300">Gateway</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-slate-800 rounded p-3">
                  <p className="text-purple-300 font-semibold mb-1">Features</p>
                  <ul className="text-slate-300 space-y-1">
                    <li>• Long-range radio (LoRa)</li>
                    <li>• Self-healing mesh</li>
                    <li>• Low power consumption</li>
                  </ul>
                </div>
                <div className="bg-slate-800 rounded p-3">
                  <p className="text-purple-300 font-semibold mb-1">Reliability</p>
                  <ul className="text-slate-300 space-y-1">
                    <li>• Works without GSM</li>
                    <li>• Node redundancy</li>
                    <li>• Satellite backup</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Arrow Down */}
          <div className="flex justify-center">
            <div className="text-4xl text-blue-400">↓</div>
          </div>

          {/* Control Dashboard */}
          <div className="bg-slate-800 rounded-lg p-6 border-2 border-orange-500">
            <div className="flex items-center mb-4">
              <div className="bg-orange-500 rounded-full p-2 mr-3">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">Command & Control Dashboard</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-700 rounded p-4">
                <h3 className="font-semibold text-orange-300 mb-2">Real-time Monitoring</h3>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>• GIS pipeline mapping</li>
                  <li>• Node status display</li>
                  <li>• Live alert feed</li>
                </ul>
              </div>
              
              <div className="bg-slate-700 rounded p-4">
                <h3 className="font-semibold text-orange-300 mb-2">Alert System</h3>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>• SMS notifications</li>
                  <li>• Telegram alerts</li>
                  <li>• Email reports</li>
                </ul>
              </div>
              
              <div className="bg-slate-700 rounded p-4">
                <h3 className="font-semibold text-orange-300 mb-2">Response Time</h3>
                <div className="text-center mt-2">
                  <div className="text-3xl font-bold text-orange-400">&lt; 60s</div>
                  <p className="text-xs text-slate-400 mt-1">Detection to Alert</p>
                </div>
              </div>
            </div>
          </div>

          {/* Key Benefits */}
          <div className="mt-8 bg-gradient-to-r from-blue-900 to-purple-900 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4 text-center">Key System Benefits</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-300">100%</p>
                <p className="text-sm text-slate-300">Detection Rate</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-300">24/7</p>
                <p className="text-sm text-slate-300">Monitoring</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-300">IoT + AI</p>
                <p className="text-sm text-slate-300">Edge Intelligence</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-300">Made in 🇳🇬</p>
                <p className="text-sm text-slate-300">Nigerian Innovation</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EchoGuardDiagram;