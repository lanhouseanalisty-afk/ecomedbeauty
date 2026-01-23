import { Product } from "@/types/product";

export function sortProducts(
    productList: Product[],
    sortBy: "price-asc" | "price-desc" | "name" | "newest" | "rating"
): Product[] {
    return [...productList].sort((a, b) => {
        switch (sortBy) {
            case "price-asc":
                return a.price - b.price;
            case "price-desc":
                return b.price - a.price;
            case "name":
                return a.name.localeCompare(b.name);
            case "rating":
                return (b.rating || 0) - (a.rating || 0);
            case "newest":
                // Fallback to ID comparison for stability if created_at is not present
                return (b.id || "").localeCompare(a.id || "");
            default:
                return 0;
        }
    });
}

export function filterProductsByPrice(
    productList: Product[],
    minPrice: number,
    maxPrice: number
): Product[] {
    return productList.filter((p) => p.price >= minPrice && p.price <= maxPrice);
}
