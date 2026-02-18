/**
 * Sentry Configuration (Placeholder)
 * Handles error monitoring configuration
 */

import * as Sentry from '@sentry/react';

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;
const ENVIRONMENT = import.meta.env.MODE;
const IS_PRODUCTION = import.meta.env.PROD;

export function initSentry(): void {
    if (!SENTRY_DSN) return;

    try {
        Sentry.init({
            dsn: SENTRY_DSN,
            environment: ENVIRONMENT,
            enabled: IS_PRODUCTION,
            tracesSampleRate: 0.1,
        });
    } catch (e) {
        console.warn('Failed to initialize Sentry', e);
    }
}

export function captureException(error: Error, context?: any): void {
    try {
        Sentry.captureException(error, context);
    } catch (e) {
        console.error('Failed to capture exception in Sentry', e);
    }
}

export { Sentry };
