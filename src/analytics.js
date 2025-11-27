import posthog from 'posthog-js';

// Initialize PostHog
export const initAnalytics = () => {
    // Check if env vars are present
    const apiKey = import.meta.env.VITE_POSTHOG_KEY;
    const apiHost = import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com';

    if (apiKey) {
        posthog.init(apiKey, {
            api_host: apiHost,
            person_profiles: 'identified_only',
            capture_pageview: false,
            debug: true // Enable debug mode to see events in console
        });
    } else {
        console.warn('PostHog API Key not found. Analytics will not be tracked.');
    }
};

// Track specific events
export const trackEvent = (eventName, properties = {}) => {
    if (import.meta.env.VITE_POSTHOG_KEY) {
        console.log(`[Analytics] Capturing: ${eventName}`, properties);
        posthog.capture(eventName, properties);
    } else {
        console.log(`[Analytics Dev] ${eventName}`, properties);
    }
};

// Identify user
export const identifyUser = (userId, userProperties = {}) => {
    if (import.meta.env.VITE_POSTHOG_KEY) {
        posthog.identify(userId, userProperties);
    }
};

// Reset user (logout)
export const resetAnalytics = () => {
    if (import.meta.env.VITE_POSTHOG_KEY) {
        posthog.reset();
    }
};
