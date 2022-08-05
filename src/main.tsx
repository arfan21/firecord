import { createEmotionCache, MantineProvider } from "@mantine/core";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

const mantineCache = createEmotionCache({ key: "mantine", prepend: false });

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <MantineProvider emotionCache={mantineCache} withNormalizeCSS>
      <App />
    </MantineProvider>
  </React.StrictMode>
);
