import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { loadGtagIfConsented } from "./lib/gtag";

// Load Google Analytics if user already consented to analytics cookies
loadGtagIfConsented();

createRoot(document.getElementById("root")!).render(<App />);
