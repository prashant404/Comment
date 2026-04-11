import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./App.scss";

// 1. Import the vanilla JS injector, NOT the React component
import { inject } from '@vercel/analytics';

// 2. Fire the injector before the React app even renders
inject();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);