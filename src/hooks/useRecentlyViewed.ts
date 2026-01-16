import { useState, useEffect } from "react";
import { Product } from "@/types/product";

const RECENTLY_VIEWED_KEY = "medbeauty_recently_viewed";
const MAX_ITEMS = 8;

export function useRecentlyViewed() {
  const [items, setItems] = useState<Product[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(items));
  }, [items]);

  const addProduct = (product: Product) => {
    setItems((prev) => {
      const filtered = prev.filter((p) => p.id !== product.id);
      return [product, ...filtered].slice(0, MAX_ITEMS);
    });
  };

  const clearHistory = () => {
    setItems([]);
    localStorage.removeItem(RECENTLY_VIEWED_KEY);
  };

  return { items, addProduct, clearHistory };
}
