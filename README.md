# Echo-Guard IoT 🛡️

**Real-Time Pipeline Vandalism Detection System**

A cutting-edge IoT solution for detecting and preventing pipeline infrastructure vandalism through distributed edge-AI sensing nodes, advanced signal processing, and cloud-based threat analysis.

**Developed by:** Maziv Technologies  
**Funded by:** NCDMB Innovation Initiative

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Key Components](#key-components)
- [Threat Detection](#threat-detection)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## 🎯 Overview

Echo-Guard IoT is an intelligent infrastructure protection system designed to detect unauthorized attempts to damage or tamper with pipeline infrastructure in real-time. The system uses distributed sensor nodes deployed along pipelines to detect vandalism through acoustic and vibration analysis, enabling rapid response and damage prevention.

### Problem Statement

Pipeline infrastructure is vulnerable to vandalism, theft, and sabotage, which can lead to:

- Environmental disasters
- Economic losses
- Safety hazards
- Operational disruptions

### Solution

Echo-Guard provides:

- **Real-time detection** of vandalism attempts
- **Low-latency edge processing** using TinyML models
- **Cost-effective** distributed sensor network
- **Autonomous operation** with minimal infrastructure dependency
- **Rapid alert mechanisms** for emergency response

---

## ✨ Features

### Core Detection Capabilities

- 🔨 **Hammer Strike Detection** - Identifies rhythmic impact patterns (90%+ confidence)
- 🔪 **Hacksaw Friction Detection** - Detects high-frequency cutting patterns (92%+ confidence)
- 🔩 **Motorized Drill Detection** - Recognizes steady vibration patterns (88%+ confidence)
- 🚛 **Heavy Vehicle Detection** - Identifies low-frequency rumbling (72%+ confidence)
- 🌧️ **Ambient Noise Filtering** - Distinguishes threats from rainfall, wind, thunder, and animal movement

### System Features

- **Multi-Tier Architecture** - Edge processing + cloud backup
- **Signal Processing** - Fast Fourier Transform (FFT) for frequency analysis
- **Edge-AI ML Models** - TinyML CNN models running on MCU
- **LoRa Connectivity** - Long-range, low-power communication
- **GPS Tracking** - Location-based threat identification
- **Anti-Tamper Detection** - Self-protection against sensor interference
- **Real-Time Visualization** - Interactive dashboards and simulations
- **Export Capabilities** - Download architecture diagrams as PNG

---

## 🏗️ System Architecture

Echo-Guard IoT operates across five integrated tiers:

### **TIER 1: Edge-AI Sensing Nodes**

Distributed along pipeline infrastructure

**Sensors:**

- Tri-axial Accelerometer (vibration detection)
- Piezo-electric Microphone (acoustic detection)
- GPS Tracker (location coordinates)
- Anti-tamper Detection (sensor protection)

**Edge Processing:**

- ESP32/STM32 Microcontroller
- Fast Fourier Transform (FFT) analysis
- TinyML CNN inference models
- Solar power management
- Battery optimization

**Detection Output:**

- Hammer strikes, hacksaw friction, drill detection
- Threat classification & confidence scores
- GPS timestamp & coordinates

---

### **TIER 2: LoRa Communication Gateway**

Bridges edge nodes to cloud infrastructure

**Capabilities:**

- Long-range (10+ km) low-power radio
- Mesh networking support
- Signal aggregation
- Gateway redundancy
- Time synchronization

---

### **TIER 3: Cloud Processing Backend**

Central analysis and data management

**Functions:**

- Threat data aggregation
- ML model refinement
- Pattern learning
- False positive filtering
- Data archival

---

### **TIER 4: Alert & Response System**

Notification and incident management

**Components:**

- SMS/Push notifications
- Email alerts
- Web dashboard
- Incident logging
- Response tracking

---

### **TIER 5: Analytics & Visualization**

Business intelligence and monitoring

**Features:**

- Interactive architecture diagrams
- Live threat simulation
- Historical analysis
- Performance metrics
- System health monitoring

---

## 🛠️ Tech Stack

### Frontend

- **React 19.2.0** - UI framework
- **Vite 7.2.4** - Build tool with HMR
- **Tailwind CSS 3.4.19** - Utility-first styling
- **Lucide React 0.562.0** - Icon library
- **html2canvas 1.4.1** - Diagram export to PNG
- **PostCSS 8.5.6** - CSS processing
- **Autoprefixer 10.4.23** - CSS vendor prefixing

### Development & Quality

- **ESLint 9.39.1** - Code linting
- **@vitejs/plugin-react 5.1.1** - React Fast Refresh
- **TypeScript Types** - Type definitions included

### Hardware (IoT Layer)

- **ESP32/STM32 MCU** - Edge processing units
- **Sensors:** Accelerometer, Microphone, GPS
- **Communication:** LoRa modules
- **Power:** Solar panels + Li-ion batteries

---

## 📦 Installation

### Prerequisites

- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher) or **yarn**
- **Git**

### Step 1: Clone the Repository

```bash
git clone https://github.com/Maziv-Technologies/Echo-Guard-IoT.git
cd Echo-Guard-IoT
```

### Step 2: Install Dependencies

```bash
npm install
```

Or with yarn:

```bash
yarn install
```

### Step 3: Verify Installation

```bash
npm run lint
```

---

## 🚀 Getting Started

### Development Server

Start the local development server with hot module replacement (HMR):

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the next available port).

### Production Build

Create an optimized production build:

```bash
npm run build
```

Output files are generated in the `dist/` directory.

### Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

### Linting

Check code quality and fix issues:

```bash
npm run lint
```

---

## 💻 Usage

### Main Application Features

#### 1. **Architecture Diagram Tab**

- Interactive visualization of the complete Echo-Guard IoT system
- Shows all five tiers of infrastructure
- Includes sensor specifications, edge processing details, and communication protocols
- **Download Capability:** Export the diagram as a high-resolution PNG file
  - Click "Download as PNG" button
  - Use for presentations, documentation, or reports

#### 2. **Live Simulation Tab**

- Real-time threat detection simulation
- Simulates vandalism attempts along a 5-node pipeline
- **Threat Types:**
  - Hacksaw (high-frequency friction patterns)
  - Motorized drill (steady vibration)
  - Hammer strikes (rhythmic impulses)
  - Heavy vehicles (low-frequency rumble)
- **Ambient Conditions:** Rainfall, wind gusts, animal movement, thunder
- **Confidence Scoring:** Shows ML model confidence for each detection
- **Frequency Analysis:** Visual FFT bars showing signal characteristics

### Navigating the Interface

1. **Tab Navigation:** Switch between Architecture Diagram and Live Simulation
2. **Diagram Export:** Download architecture visualization for documentation
3. **Simulation Controls:** Trigger various threat scenarios to see detection in action
4. **Threat Display:** Monitor active threats and their confidence scores

---

## 📁 Project Structure

```
Echo-Guard-IoT/
├── src/
│   ├── components/
│   │   ├── EchoGuardDiagram.jsx      # Architecture visualization component
│   │   └── EchoGuardSimulation.jsx   # Live threat simulation component
│   ├── App.jsx                        # Main application component
│   ├── App.css                        # Application styling
│   ├── main.jsx                       # React entry point
│   ├── index.css                      # Global styles
│   └── assets/                        # Static assets
├── public/                            # Public static files
├── package.json                       # Project dependencies & scripts
├── vite.config.js                     # Vite configuration
├── tailwind.config.js                 # Tailwind CSS configuration
├── postcss.config.js                  # PostCSS configuration
├── eslint.config.js                   # ESLint configuration
├── index.html                         # HTML entry point
└── README.md                          # This file
```

### Key Directories

- **`src/components/`** - Reusable React components for UI visualization
- **`src/`** - Source code and styling
- **`public/`** - Static assets served directly
- **Root Config Files** - Build tool and code quality configurations

---

## 🎛️ Key Components

### EchoGuardDiagram Component

Renders the complete system architecture visualization including:

- **TIER 1:** Edge-AI Sensing Nodes with sensor specifications
- **TIER 2:** LoRa Communication Infrastructure
- **TIER 3:** Cloud Processing Backend
- **TIER 4:** Alert & Response System
- **TIER 5:** Analytics & Visualization

**Features:**

- Download diagram as PNG with `html2canvas`
- Responsive design for desktop and mobile
- Icon-rich information display using Lucide React
- Dark theme optimized for presentations

### EchoGuardSimulation Component

Simulates real-world pipeline monitoring scenarios:

- **Pipeline Network Visualization** - 5 nodes + LoRa gateway
- **Threat Injection** - Simulate different vandalism types
- **FFT Analysis Display** - Visual frequency spectrum
- **Confidence Scoring** - Real-time ML model confidence
- **Ambient Noise** - Environmental condition simulation
- **Real-time Updates** - Live status updates and alerts

---

## 🔍 Threat Detection

### Detection Algorithm Overview

1. **Signal Acquisition**
   - Accelerometer captures vibration (Hz-kHz range)
   - Microphone captures acoustic signals (kHz range)
   - Synchronous sampling at 8-16 kHz

2. **Signal Processing**
   - Bandpass filtering (remove DC and very high frequencies)
   - Fast Fourier Transform (FFT) for frequency domain analysis
   - Feature extraction (peak frequency, spectral entropy, etc.)

3. **ML Classification**
   - TinyML CNN model (trained on threat signatures)
   - Threat class prediction
   - Confidence score calculation

4. **Decision Logic**
   - Threshold-based alerting (typically >85% confidence)
   - Temporal analysis (confirm sustained threat)
   - False positive filtering

### Threat Signatures

| Threat Type | Frequency Range | Pattern | Confidence |
|------------|-----------------|---------|-----------|
| **Hacksaw** | 200-2000 Hz | High-frequency friction | 92% avg |
| **Motorized Drill** | 500-3000 Hz | Steady vibration | 88% avg |
| **Hammer Strike** | 100-1000 Hz | Rhythmic impulse | 90% avg |
| **Heavy Vehicle** | 10-100 Hz | Low-frequency rumble | 72% avg |

### Ambient Noise Filtering

- Rainfall (low-frequency dripping)
- Wind gust (random noise)
- Animal movement (irregular patterns)
- Thunder (sharp impulse, rare)

---

## 🌐 Deployment

### Development Deployment

```bash
npm run dev
```

### Production Deployment

#### Build the Application

```bash
npm run build
```

#### Static Hosting Options

The built application can be deployed to:

- **Vercel** - Optimized for React/Vite
- **Netlify** - Git-integrated deployment
- **AWS S3 + CloudFront** - CDN distribution
- **Azure Static Web Apps** - Microsoft Azure hosting
- **GitHub Pages** - Free hosting option
- **Docker** - Containerized deployment

#### Example: Deployment to Vercel

```bash
npm install -g vercel
vercel
```

#### Example: Docker Deployment

```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
```

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Getting Started with Contributing

1. **Fork the repository**
2. **Create a feature branch:** `git checkout -b feature/your-feature`
3. **Commit changes:** `git commit -am 'Add new feature'`
4. **Push to branch:** `git push origin feature/your-feature`
5. **Submit a Pull Request**

### Code Standards

- Follow ESLint rules: `npm run lint`
- Use descriptive commit messages
- Include comments for complex logic
- Test your changes thoroughly

### Areas for Contribution

- 🎨 UI/UX improvements
- 🔧 Performance optimization
- 📚 Documentation enhancement
- 🐛 Bug fixes and issue resolution
- ✨ New features and components
- 🧪 Testing and QA

---

## 📄 License

This project is proprietary software developed by Maziv Technologies under the NCDMB Innovation Initiative. All rights reserved.

For licensing inquiries, please contact: [contact information]

---

## 📞 Contact & Support

**Organization:** Maziv Technologies  
**Project:** Echo-Guard IoT  
**Initiative:** NCDMB Innovation  

### Get Support

- 📧 **Email:** [Support email]
- 🐛 **Issue Tracker:** Create an issue in the repository
- 💬 **Discussions:** Join community discussions

### Quick Links

- 📖 [Full Documentation](#)
- 🎓 [User Guide](#)
- 🔧 [Technical Specifications](#)
- 📊 [API Reference](#)

---

## 🔐 Security

### Security Considerations

- Edge nodes operate with encrypted communication
- Cloud backend uses TLS/SSL encryption
- Authentication required for dashboard access
- Regular security audits recommended
- Sensor tampering detection enabled

### Reporting Security Issues

If you discover a security vulnerability, please email [security contact] instead of using the public issue tracker.

---

## 📈 Roadmap

### Upcoming Features

- [ ] Mobile application (iOS/Android)
- [ ] Advanced ML model improvements
- [ ] Multi-language support
- [ ] Enhanced analytics dashboard
- [ ] API for third-party integrations
- [ ] Edge model update over-the-air (OTA)
- [ ] Extended battery life optimizations
- [ ] Support for additional sensor types

---

## 🙏 Acknowledgments

- **NCDMB** - Initiative funding and support
- **Maziv Technologies** - Project development
- **Open Source Community** - Libraries and frameworks
- **Contributors** - Community support and improvements

---

**Last Updated:** 2026-06-08  
**Status:** Active Development  
**Version:** 0.0.0
