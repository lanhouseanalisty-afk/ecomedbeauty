import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";
import { products as localProducts, categories as localCategories } from "@/data/products";

interface ProductsResponse {
  items: Product[];
  total: number;
}

interface CategoryResponse {
  id: string;
  name: string;
  count?: number;
}

interface UseProductsParams {
  query?: string;
  category?: string;
  skip?: number;
  top?: number;
  enabled?: boolean;
  includeImages?: boolean;
}

const USE_SAP_INTEGRATION = true; // Toggle to switch between SAP and local data

// Fetch products from SAP B1
async function fetchSapProducts(params: UseProductsParams): Promise<ProductsResponse> {
  const searchParams = new URLSearchParams();
  searchParams.set("action", "search");
  
  if (params.query) searchParams.set("query", params.query);
  if (params.category && params.category !== "all") searchParams.set("category", params.category);
  if (params.skip) searchParams.set("skip", String(params.skip));
  if (params.top) searchParams.set("top", String(params.top));
  if (params.includeImages) searchParams.set("includeImages", "true");

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

// Fetch product image from SAP B1 attachments
async function fetchSapProductImage(itemCode: string): Promise<string | null> {
  const searchParams = new URLSearchParams();
  searchParams.set("action", "image");
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
    return null;
  }

  const data = await response.json();
  return data.imageUrl || null;
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
async function fetchSapCategories(): Promise<CategoryResponse[]> {
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

// Local data fallback functions
function getLocalProducts(params: UseProductsParams): ProductsResponse {
  let result = [...localProducts];

  if (params.query) {
    const query = params.query.toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
    );
  }

  if (params.category && params.category !== "all") {
    result = result.filter((p) => p.category === params.category);
  }

  const skip = params.skip || 0;
  const top = params.top || 50;
  const paginated = result.slice(skip, skip + top);

  return {
    items: paginated,
    total: result.length,
  };
}

function getLocalProduct(id: string): Product | undefined {
  return localProducts.find((p) => p.id === id);
}

function getLocalCategories(): CategoryResponse[] {
  return localCategories.map((c) => ({
    id: c.name.toLowerCase(),
    name: c.name,
    count: c.count,
  }));
}

// Main hook to fetch products (with SAP fallback to local)
export function useProducts(params: UseProductsParams = {}) {
  return useQuery({
    queryKey: ["products", params, USE_SAP_INTEGRATION],
    queryFn: async () => {
      if (!USE_SAP_INTEGRATION) {
        return getLocalProducts(params);
      }

      try {
        return await fetchSapProducts(params);
      } catch (error) {
        console.warn("SAP B1 unavailable, using local data:", error);
        return getLocalProducts(params);
      }
    },
    enabled: params.enabled !== false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
}

// Hook to fetch single product
export function useProduct(id: string, enabled = true) {
  return useQuery({
    queryKey: ["product", id, USE_SAP_INTEGRATION],
    queryFn: async () => {
      if (!USE_SAP_INTEGRATION) {
        const product = getLocalProduct(id);
        if (!product) throw new Error("Product not found");
        return product;
      }

      try {
        return await fetchSapProduct(id);
      } catch (error) {
        console.warn("SAP B1 unavailable, using local data:", error);
        const product = getLocalProduct(id);
        if (!product) throw new Error("Product not found");
        return product;
      }
    },
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

// Hook to fetch categories
export function useCategories(enabled = true) {
  return useQuery({
    queryKey: ["categories", USE_SAP_INTEGRATION],
    queryFn: async () => {
      if (!USE_SAP_INTEGRATION) {
        return getLocalCategories();
      }

      try {
        return await fetchSapCategories();
      } catch (error) {
        console.warn("SAP B1 unavailable, using local categories:", error);
        return getLocalCategories();
      }
    },
    enabled,
    staleTime: 1000 * 60 * 30, // 30 minutes
    retry: 1,
  });
}
