import { describe, it, expect } from 'vitest';
import { sortProducts, filterProductsByPrice } from '../product-utils';
import { Product } from '@/types/product';

describe('product-utils', () => {
    const mockProducts: Product[] = [
        {
            id: '1',
            name: 'Product A',
            price: 100,
            rating: 4.5,
            description: 'Test product A',
            image: '/test-a.jpg',
            category: 'test',
            stock: 10,
            created_at: '2024-01-01',
        },
        {
            id: '2',
            name: 'Product B',
            price: 50,
            rating: 3.5,
            description: 'Test product B',
            image: '/test-b.jpg',
            category: 'test',
            stock: 5,
            created_at: '2024-01-02',
        },
        {
            id: '3',
            name: 'Product C',
            price: 150,
            rating: 5.0,
            description: 'Test product C',
            image: '/test-c.jpg',
            category: 'test',
            stock: 20,
            created_at: '2024-01-03',
        },
    ];

    describe('sortProducts', () => {
        it('should sort products by price ascending', () => {
            const sorted = sortProducts(mockProducts, 'price-asc');
            expect(sorted[0].price).toBe(50);
            expect(sorted[1].price).toBe(100);
            expect(sorted[2].price).toBe(150);
        });

        it('should sort products by price descending', () => {
            const sorted = sortProducts(mockProducts, 'price-desc');
            expect(sorted[0].price).toBe(150);
            expect(sorted[1].price).toBe(100);
            expect(sorted[2].price).toBe(50);
        });

        it('should sort products by name alphabetically', () => {
            const sorted = sortProducts(mockProducts, 'name');
            expect(sorted[0].name).toBe('Product A');
            expect(sorted[1].name).toBe('Product B');
            expect(sorted[2].name).toBe('Product C');
        });

        it('should sort products by rating descending', () => {
            const sorted = sortProducts(mockProducts, 'rating');
            expect(sorted[0].rating).toBe(5.0);
            expect(sorted[1].rating).toBe(4.5);
            expect(sorted[2].rating).toBe(3.5);
        });

        it('should not mutate original array', () => {
            const original = [...mockProducts];
            sortProducts(mockProducts, 'price-asc');
            expect(mockProducts).toEqual(original);
        });
    });

    describe('filterProductsByPrice', () => {
        it('should filter products within price range', () => {
            const filtered = filterProductsByPrice(mockProducts, 50, 100);
            expect(filtered).toHaveLength(2);
            expect(filtered.every((p) => p.price >= 50 && p.price <= 100)).toBe(true);
        });

        it('should return empty array when no products match', () => {
            const filtered = filterProductsByPrice(mockProducts, 200, 300);
            expect(filtered).toHaveLength(0);
        });

        it('should include products at exact min and max prices', () => {
            const filtered = filterProductsByPrice(mockProducts, 50, 150);
            expect(filtered).toHaveLength(3);
        });

        it('should return all products when range is very wide', () => {
            const filtered = filterProductsByPrice(mockProducts, 0, 1000);
            expect(filtered).toHaveLength(3);
        });
    });
});
