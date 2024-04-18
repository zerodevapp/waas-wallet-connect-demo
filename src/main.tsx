import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import Providers from "./Providers/Providers.tsx";
import "./index.css";
import "./polyfills";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Providers>
      <App />
    </Providers>
  </React.StrictMode>
);
