import { StrictMode, Component, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

class RuntimeErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error("ROSA Admin render failed:", error);
  }

  render() {
    if (this.state.error) {
      return (
        <main style={{ padding: 24, fontFamily: "system-ui", color: "#991b1b" }}>
          <h1>ROSA Admin failed to render</h1>
          <pre style={{ whiteSpace: "pre-wrap" }}>{this.state.error.stack || this.state.error.message}</pre>
        </main>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error('ROSA Admin could not find the "#root" element.');
}

const root = createRoot(rootElement);
root.render(<p style={{ padding: 24, fontFamily: "system-ui" }}>Loading ROSA Admin…</p>);

void import("./i18n")
  .then(() => import("./App.tsx"))
  .then(({ default: App }) => {
    root.render(
      <StrictMode>
        <RuntimeErrorBoundary>
          <App />
        </RuntimeErrorBoundary>
      </StrictMode>,
    );
  })
  .catch((error: unknown) => {
    console.error("ROSA Admin startup failed:", error);
    const message =
      error instanceof Error ? error.stack || error.message : String(error);
    root.render(
      <main style={{ padding: 24, fontFamily: "system-ui", color: "#991b1b" }}>
        <h1>ROSA Admin startup failed</h1>
        <pre style={{ whiteSpace: "pre-wrap" }}>{message}</pre>
      </main>,
    );
  });
