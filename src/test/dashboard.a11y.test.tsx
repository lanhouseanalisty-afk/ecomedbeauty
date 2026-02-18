import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import AnalyticsDashboard from '../pages/admin/AnalyticsDashboard';

expect.extend(toHaveNoViolations);

// Mock the analytics library
vi.mock('@/lib/analytics', () => ({
    getStoredEvents: () => [
        {
            type: 'page',
            name: '/dashboard',
            timestamp: new Date().toISOString(),
            properties: {}
        },
        {
            type: 'track',
            name: 'login_success',
            timestamp: new Date().toISOString(),
            properties: { method: 'email' }
        }
    ],
    AnalyticsEvent: {
        LOGIN_SUCCESS: 'login_success',
        PAGE_VIEW: 'page_view'
    }
}));

// Mock Recharts to avoid extensive SVG rendering issues in JSDOM and focus on structure
vi.mock('recharts', () => {
    const OriginalModule = vi.importActual('recharts');
    return {
        ...OriginalModule,
        ResponsiveContainer: ({ children }: any) => <div style={{ width: 500, height: 300 }}>{children}</div>,
        LineChart: ({ children }: any) => <div>LineChart Mock {children}</div>,
        BarChart: ({ children }: any) => <div>BarChart Mock {children}</div>,
        PieChart: ({ children }: any) => <div>PieChart Mock {children}</div>,
        // Mock other components as simple functional components
        Line: () => null,
        XAxis: () => null,
        YAxis: () => null,
        CartesianGrid: () => null,
        Tooltip: () => null,
        Bar: () => null,
        Pie: () => null,
        Cell: () => null,
        Legend: () => null,
    };
});


describe('AnalyticsDashboard Accessibility', () => {
    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('should have no accessibility violations', async () => {
        const { container } = render(<AnalyticsDashboard />);

        // Run axe
        const results = await axe(container);

        expect(results).toHaveNoViolations();
    });
});
