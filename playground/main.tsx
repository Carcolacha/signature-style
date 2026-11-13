/**
 * playground entry — mounts the Bento Dashboard.
 *
 * The first import goes through the REAL package exports map
 * ("@edwyn/signature-style/css" → css/signature-style.css), proving the
 * distribution contract serves consumers — not just this repo's internals.
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@edwyn/signature-style/css";
import "./styles.css";
import App from "./App";

const container = document.getElementById("root");
if (container === null) {
  throw new Error("playground: #root mount element missing from index.html");
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
