import "./globals.css";
import ConvexClientProvider from "./convex-client-provider";

const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || "dev";

const FALLBACK_CRITICAL_CSS = `
:root {
  --bg: #edf3ee;
  --bg-deep: #d4e3d5;
  --paper: rgba(255, 255, 252, 0.88);
  --ink: #122019;
  --muted: #5a665e;
  --line: rgba(18, 32, 25, 0.1);
  --primary: #1d6b47;
  --primary-strong: #12412c;
  --shadow: 0 20px 56px rgba(17, 39, 26, 0.12);
}
* { box-sizing: border-box; }
html, body { margin: 0; min-height: 100%; }
body {
  min-height: 100vh;
  overflow-x: hidden;
  font-family: "Avenir Next", "Segoe UI", "Trebuchet MS", sans-serif;
  color: var(--ink);
  background:
    radial-gradient(circle at 12% 12%, rgba(215, 139, 47, 0.18), transparent 22%),
    radial-gradient(circle at 92% 10%, rgba(29, 107, 71, 0.2), transparent 26%),
    linear-gradient(135deg, #f8faf4, var(--bg) 36%, var(--bg-deep));
}
button, input, textarea, select { font: inherit; }
button { cursor: pointer; }
.page-shell, .auth-shell {
  width: min(1240px, calc(100% - 2rem));
  margin: 0 auto;
  padding: 2rem 0 3rem;
}
.auth-shell {
  min-height: 100vh;
  display: grid;
  align-items: center;
}
.auth-stage, .panel, .auth-card, .auth-copy {
  border: 1px solid var(--line);
  border-radius: 30px;
  box-shadow: var(--shadow);
}
.auth-stage {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(320px, 0.9fr);
  gap: 1.25rem;
}
.auth-card, .auth-copy, .panel {
  padding: 1.4rem;
  background: var(--paper);
  backdrop-filter: blur(14px);
}
.eyebrow {
  margin: 0 0 0.7rem;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--primary);
}
h1, h2, h3 {
  margin: 0;
  font-family: "Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif;
  line-height: 1.05;
}
.auth-copy h1, .brand-block h1 {
  font-size: clamp(2.2rem, 5vw, 4.2rem);
  max-width: 10ch;
}
.auth-text, .status-message, .login-state { color: var(--muted); }
.auth-text {
  margin: 1rem 0 0;
  max-width: 46ch;
  line-height: 1.6;
}
.auth-pill-row {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 1.25rem;
}
.pill-button, .nav-button, .micro-button, .category-button, .secondary-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(18, 32, 25, 0.1);
  background: rgba(255, 255, 255, 0.7);
  color: var(--ink);
  border-radius: 999px;
  padding: 0.8rem 1rem;
  font-weight: 700;
  text-align: center;
}
.pill-button.active, .nav-button.active, .micro-button.active, .category-button.active {
  color: #f7f4ed;
  background: linear-gradient(135deg, var(--primary), var(--primary-strong));
  border-color: transparent;
}
.stack { display: grid; gap: 0.9rem; }
label {
  display: grid;
  gap: 0.45rem;
  font-size: 0.94rem;
  font-weight: 600;
}
input, textarea, select {
  width: 100%;
  padding: 0.9rem 1rem;
  border-radius: 14px;
  border: 1px solid rgba(18, 32, 25, 0.13);
  background: rgba(255, 255, 255, 0.85);
  color: var(--ink);
}
.checkbox-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--muted);
}
.auth-status { margin: 1rem 0 0; }
.app-footer {
  display: flex;
  justify-content: center;
  margin-top: 1.2rem;
}
.footer-link {
  border: 0;
  background: transparent;
  color: var(--muted);
  font-size: 0.9rem;
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 0.2rem;
}
@media (max-width: 880px) {
  .auth-stage { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .page-shell, .auth-shell {
    width: min(100%, calc(100% - 1rem));
    padding-top: 1rem;
  }
  .auth-card, .auth-copy, .panel {
    padding: 1rem;
    border-radius: 22px;
  }
  .auth-copy h1, .brand-block h1 {
    max-width: none;
    font-size: clamp(2rem, 10vw, 3rem);
  }
  .auth-pill-row {
    display: grid;
    grid-template-columns: 1fr;
    width: 100%;
  }
  .auth-pill-row .pill-button {
    width: 100%;
  }
}
`;

const CACHE_BUSTER_SCRIPT = `
(function () {
  try {
    var version = ${JSON.stringify(APP_VERSION)};
    var key = "ecotrack-app-version";
    var appStorageKeys = [
      "ecoboard-data-v7",
      "ecoboard-language-v1",
      "ecoboard-session-account-v1"
    ];
    var url = new URL(window.location.href);
    var currentVersion = url.searchParams.get("v");
    var storedVersion = window.localStorage.getItem(key);

    function clearClientState() {
      appStorageKeys.forEach(function (storageKey) {
        try {
          window.localStorage.removeItem(storageKey);
          window.sessionStorage.removeItem(storageKey);
        } catch (error) {
          console.warn("EcoTrack storage reset skipped for", storageKey, error);
        }
      });

      if ("caches" in window) {
        window.caches.keys().then(function (names) {
          names.forEach(function (name) {
            window.caches.delete(name);
          });
        }).catch(function (error) {
          console.warn("EcoTrack cache cleanup skipped", error);
        });
      }

      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.getRegistrations().then(function (registrations) {
          registrations.forEach(function (registration) {
            registration.unregister();
          });
        }).catch(function (error) {
          console.warn("EcoTrack service worker cleanup skipped", error);
        });
      }
    }

    if (storedVersion && storedVersion !== version) {
      clearClientState();
    }

    if (currentVersion !== version) {
      url.searchParams.set("v", version);
      url.searchParams.set("refresh", "1");
      window.localStorage.setItem(key, version);
      window.location.replace(url.toString());
      return;
    }

    if (storedVersion !== version) {
      window.localStorage.setItem(key, version);
    }
  } catch (error) {
    console.warn("EcoTrack cache sync skipped", error);
  }
})();
`;

export const metadata = {
  title: "EcoTrack",
  description: "Nachhaltiges Verhalten vergleichen und sichtbar machen.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <head>
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
        <style dangerouslySetInnerHTML={{ __html: FALLBACK_CRITICAL_CSS }} />
        <script dangerouslySetInnerHTML={{ __html: CACHE_BUSTER_SCRIPT }} />
      </head>
      <body>
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
