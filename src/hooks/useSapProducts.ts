import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";

interface SapProductsResponse {
  items: Product[];
  total: number;
}

interface SapCategoriesResponse {
  id: string;
  name: string;
}

interface UseSapProductsParams {
  query?: string;
  category?: string;
  skip?: number;
  top?: number;
  enabled?: boolean;
}

// Fetch products from SAP B1
async function fetchSapProducts(params: UseSapProductsParams): Promise<SapProductsResponse> {
  const searchParams = new URLSearchParams();
  searchParams.set("action", "search");
  
  if (params.query) searchParams.set("query", params.query);
  if (params.category && params.category !== "all") searchParams.set("category", params.category);
  if (params.skip) searchParams.set("skip", String(params.skip));
  if (params.top) searchParams.set("top", String(params.top));

  const { data, error } = await supabase.functions.invoke("sap-b1-items", {
    body: null,
    method: "GET",
  });

  // Use fetch directly since supabase.functions.invoke doesn't support GET with query params well
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sap-b1-items?${searchParams.toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to fetch products from SAP");
  }

  return response.json();
}

// Fetch single product from SAP B1
async function fetchSapProduct(itemCode: string): Promise<Product> {
  const searchParams = new URLSearchParams();
  searchParams.set("action", "get");
  searchParams.set("itemCode", itemCode);

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sap-b1-items?${searchParams.toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to fetch product from SAP");
  }

  return response.json();
}

// Fetch categories from SAP B1
async function fetchSapCategories(): Promise<SapCategoriesResponse[]> {
  const searchParams = new URLSearchParams();
  searchParams.set("action", "categories");

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sap-b1-items?${searchParams.toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to fetch categories from SAP");
  }

  return response.json();
}

// Hook to fetch products
export function useSapProducts(params: UseSapProductsParams = {}) {
  return useQuery({
    queryKey: ["sap-products", params],
    queryFn: () => fetchSapProducts(params),
    enabled: params.enabled !== false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
}

// Hook to fetch single product
export function useSapProduct(itemCode: string, enabled = true) {
  return useQuery({
    queryKey: ["sap-product", itemCode],
    queryFn: () => fetchSapProduct(itemCode),
    enabled: enabled && !!itemCode,
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
}

// Hook to fetch categories
export function useSapCategories(enabled = true) {
  return useQuery({
    queryKey: ["sap-categories"],
    queryFn: fetchSapCategories,
    enabled,
    staleTime: 1000 * 60 * 30, // 30 minutes
    retry: 2,
  });
}
