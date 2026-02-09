import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import App from "./App.tsx";
import "./index.css";

// Error Trap - Catch all errors before React even tries to render
window.addEventListener('error', (event) => {
    document.body.innerHTML = `
        <div style="padding: 24px; font-family: system-ui, sans-serif; color: #1f2937; background: #fee2e2; border-left: 4px solid #ef4444; max-width: 800px; margin: 40px auto; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 16px; color: #991b1b;">Global Application Error</h1>
            <p style="margin-bottom: 12px; font-weight: 500;">An error occurred while loading the application:</p>
            <pre style="background: #ffffff; padding: 16px; border-radius: 6px; overflow: auto; font-family: monospace; font-size: 14px; border: 1px solid #e5e7eb; color: #dc2626;">${event.message}</pre>
            <p style="margin-top: 16px; font-size: 14px; color: #4b5563;">Check the browser console (F12) for the full stack trace.</p>
        </div>
    `;
    console.error("Global Error Caught:", event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    document.body.innerHTML = `
        <div style="padding: 24px; font-family: system-ui, sans-serif; color: #1f2937; background: #fee2e2; border-left: 4px solid #ef4444; max-width: 800px; margin: 40px auto; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 16px; color: #991b1b;">Unhandled Promise Rejection</h1>
            <p style="margin-bottom: 12px; font-weight: 500;">A promise failed without being handled:</p>
            <pre style="background: #ffffff; padding: 16px; border-radius: 6px; overflow: auto; font-family: monospace; font-size: 14px; border: 1px solid #e5e7eb; color: #dc2626;">${event.reason}</pre>
             <p style="margin-top: 16px; font-size: 14px; color: #4b5563;">This often happens with failed dynamic imports or async operations.</p>
        </div>
    `;
    console.error("Unhandled Rejection:", event.reason);
});

try {
    const rootElement = document.getElementById("root");
    if (!rootElement) throw new Error("DOM element with ID 'root' not found");

    createRoot(rootElement).render(
        <StrictMode>
            <App />
        </StrictMode>
    );
} catch (error) {
    console.error("Fatal initialization error:", error);
    document.body.innerHTML = `
        <div style="padding: 24px; font-family: system-ui, sans-serif; color: #1f2937; background: #fee2e2; border-left: 4px solid #ef4444; max-width: 800px; margin: 40px auto; border-radius: 8px;">
            <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 16px; color: #991b1b;">Fatal Initialization Error</h1>
            <pre style="background: #ffffff; padding: 16px; border-radius: 6px; overflow: auto; font-family: monospace; font-size: 14px; border: 1px solid #e5e7eb; color: #dc2626;">${error instanceof Error ? error.message : String(error)}</pre>
            <pre style="margin-top: 16px; font-size: 12px; color: #4b5563; white-space: pre-wrap;">${error instanceof Error ? error.stack : ''}</pre>
        </div>
    `;
}
