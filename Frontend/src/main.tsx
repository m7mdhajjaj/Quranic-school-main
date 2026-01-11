import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import App from "./App.tsx";

// ✅ تحسين الأداء - Passive Event Listeners
const addPassiveEventListeners = () => {
  let supportsPassive = false;
  try {
    const opts = Object.defineProperty({}, 'passive', {
      get: function() {
        supportsPassive = true;
        return true;
      }
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    window.addEventListener("testPassive", null as any, opts);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    window.removeEventListener("testPassive", null as any, opts);
  } catch {
    // Passive events not supported
  }
  
  if (supportsPassive) {
    // تطبيق passive على scroll events
    ['scroll', 'wheel', 'touchstart', 'touchmove'].forEach(event => {
      document.addEventListener(event, () => {}, { passive: true });
    });
  }
};

addPassiveEventListeners();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
