import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAnalytics } from '@/hooks/useAnalytics';

export function AnalyticsTracker() {
    const location = useLocation();
    const { page } = useAnalytics();

    useEffect(() => {
        page(location.pathname + location.search);
    }, [location, page]);

    return null;
}
