import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

function bootstrap() {
  const el = document.getElementById("root");
  if (!el) {
    console.error("Root #root não encontrado");
    return;
  }
  const root = createRoot(el);
  root.render(<App />);
}

bootstrap();

// log helpful
window.addEventListener("error", (e) => {
  console.error("JS Error:", e.error || e.message);
});
window.addEventListener("unhandledrejection", (e) => {
  console.error("Promise Rejection:", e.reason);
});
