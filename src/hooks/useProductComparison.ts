import { useState, useEffect } from "react";
import { Product } from "@/types/product";
import { toast } from "sonner";

const COMPARISON_KEY = "medbeauty_comparison";
const MAX_ITEMS = 4;

export function useProductComparison() {
  const [items, setItems] = useState<Product[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(COMPARISON_KEY);
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(COMPARISON_KEY, JSON.stringify(items));
  }, [items]);

  const addProduct = (product: Product) => {
    if (items.length >= MAX_ITEMS) {
      toast.error(`Máximo de ${MAX_ITEMS} produtos para comparar`);
      return;
    }
    if (items.some((p) => p.id === product.id)) {
      toast.info("Produto já está na comparação");
      return;
    }
    setItems((prev) => [...prev, product]);
    toast.success(`${product.name} adicionado à comparação`);
  };

  const removeProduct = (productId: string) => {
    setItems((prev) => prev.filter((p) => p.id !== productId));
  };

  const isInComparison = (productId: string) => {
    return items.some((p) => p.id === productId);
  };

  const clearComparison = () => {
    setItems([]);
  };

  return { items, addProduct, removeProduct, isInComparison, clearComparison };
}
