import { useCallback } from 'react';
import { analytics, AnalyticsEvent } from '@/lib/analytics';

export function useAnalytics() {
    const track = useCallback((event: AnalyticsEvent | string, properties?: Record<string, any>) => {
        analytics.track(event, properties);
    }, []);

    const identify = useCallback((userId: string, traits?: Record<string, any>) => {
        analytics.identify(userId, traits);
    }, []);

    const page = useCallback((path: string, properties?: Record<string, any>) => {
        analytics.page(path, properties);
    }, []);

    return {
        track,
        identify,
        page,
        events: AnalyticsEvent
    };
}
