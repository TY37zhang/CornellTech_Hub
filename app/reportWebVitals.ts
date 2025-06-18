export function reportWebVitals(
    metric: import("next/app").NextWebVitalsMetric
) {
    // In development just log the metrics so we can inspect them in the console.
    if (process.env.NODE_ENV !== "production") {
        console.log("[WebVitals]", metric);
        return;
    }

    try {
        const body = JSON.stringify(metric);

        // Prefer `sendBeacon` when available because it runs even if the page unloads
        if (navigator.sendBeacon) {
            navigator.sendBeacon("/api/web-vitals", body);
        } else {
            fetch("/api/web-vitals", {
                body,
                method: "POST",
                keepalive: true,
                headers: {
                    "Content-Type": "application/json",
                },
            });
        }
    } catch (error) {
        // Swallow errors – we never want to crash the user experience because of telemetry
        console.error("[WebVitals] Failed to report metric", error);
    }
}
