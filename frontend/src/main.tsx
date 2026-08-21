import { createRoot } from "react-dom/client";

import App from "./App";

import "./styles/global.css";
import "./styles/landing.css";
import "./styles/loading.css";
import "./styles/results.css";

createRoot(
  document.getElementById("root")!
).render(<App />);