console.log(
  `%c⚡ BUGANIZER TOOL ENGINE v1.0.0\n%cPowered by React 19 & TypeScript\nBuild: Standalone Encrypted Module\nStatus: Secure & Offline`,
  "color: #818cf8; font-size: 20px; font-weight: bold; font-family: monospace;",
  "color: #10b981; font-size: 14px; font-family: monospace;"
);
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./App.scss";


ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);