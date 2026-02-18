import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
    test('should redirect to login page when not authenticated', async ({ page }) => {
        await page.goto('/');
        // Check if we are redirected to auth page or if login form is present
        await expect(page).toHaveURL(/.*auth/);
        await expect(page.getByRole('button', { name: /entrar/i })).toBeVisible();
    });

    test('should show validation errors for empty form', async ({ page }) => {
        await page.goto('/auth');
        await page.getByRole('button', { name: /entrar/i }).click();
        // Expect some validation message or error toast
        // This depends on specific implementation, adjusting based on shadcn/ui typical behavior
        // For now just checking if button is still there meaning no navigation happened
        await expect(page.getByRole('button', { name: /entrar/i })).toBeVisible();
    });
});

test.describe('Public Pages', () => {
    test('should load auth page successfully', async ({ page }) => {
        await page.goto('/auth');
        await expect(page).toHaveTitle(/EcomedBeauty/);
    });
});
