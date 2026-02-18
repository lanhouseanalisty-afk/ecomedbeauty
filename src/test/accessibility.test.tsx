import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

expect.extend(toHaveNoViolations);

describe('Accessibility', () => {
    afterEach(() => {
        cleanup();
    });

    it('Button component should have no violations', async () => {
        const { container } = render(<Button>Click me</Button>);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });

    it('Input component with label should have no violations', async () => {
        const { container } = render(
            <div>
                <label htmlFor="email">Email</label>
                <Input id="email" type="email" />
            </div>
        );
        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });
});
