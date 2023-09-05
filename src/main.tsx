import { createEmotionCache, MantineProvider } from "@mantine/core";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";

import { IntlProvider, ThemeProvider } from "@ory/elements";

// Ory Elements
// optional fontawesome icons
import "@ory/elements/assets/fa-brands.min.css";
import "@ory/elements/assets/fa-solid.min.css";
import "@ory/elements/assets/fontawesome.min.css";

// optional fonts
import "@ory/elements/assets/inter-font.css";
import "@ory/elements/assets/jetbrains-mono-font.css";

// required styles for Ory Elements
import "@ory/elements/style.css";

import "./index.css";

const mantineCache = createEmotionCache({ key: "mantine", prepend: false });

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider
      themeOverrides={{
        background: {
          surface: "#1a1b1e",
          canvas: "#1a1b1e",
          subtle: "#1a1b1e",
        },
        text: {
          def: "#f3f4f6",
          disabled: "#9ca3af",
        },
      }}
      theme="dark"
    >
      <MantineProvider
        theme={{ colorScheme: "dark", primaryColor: "orange" }}
        emotionCache={mantineCache}
        withNormalizeCSS
      >
        <AuthProvider>
          <IntlProvider>
            <App />
          </IntlProvider>
        </AuthProvider>
      </MantineProvider>
    </ThemeProvider>
  </React.StrictMode>
);
