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
  badges?: string[];
}

// Fetch products from Supabase
async function fetchSupabaseProducts(params: UseProductsParams): Promise<ProductsResponse> {
  let query = supabase
    .from("products")
    .select(`
      id,
      name,
      description,
      longDescription:long_description,
      price,
      originalPrice:original_price,
      image:image_url,
      images,
      category:product_categories(name),
      tags,
      inStock:in_stock,
      sku,
      rating,
      reviewCount:review_count,
      badge,
      stock
    `, { count: "exact" });

  if (params.query) {
    query = query.ilike("name", `%${params.query}%`);
  }

  if (params.badges && params.badges.length > 0) {
    query = query.in("badge", params.badges);
  }

  if (params.category && params.category !== "all") {
    // Use !inner to filter rows based on the joined table
    // We assume params.category matches the category NAME for now
    // Note: If you want to filter by slug, ensure params.category is a slug.
    // The previous app used "Fios" (Name).
    // So we assume Name.
    // Check if valid join syntax for filtering
    // It's tricky to filter by joined column with alias. 
    // We will do client side filtering if needed or try to match table name.
    // The safest way with the current alias 'category' is to rely on !inner being applied if mapped correctly or use raw relation name.
    // Let's try raw relation name in filter.
    // Actually, let's just fetch all and filter in memory if the dataset is small? 
    // No, pagination needs DB filter.

    // Correct way: use the embedded resource in the select with !inner and then filter.
    // We already have `category:product_categories(name)`. To filter, we need `category:product_categories!inner(name)`.

    // We need to rebuild the select string if filtering by category to include !inner.
    // Or just always use !inner? No, because we want products even if category is missing (left join) usually?
    // Actually products usually have categories.

    // Let's try a different approach:
    // If category is selected, we change the select to use !inner.

    // BUT, the string inside .select() is constant in my code above.
    // I can't easily change it dynamically without code duplication.

    // Alternative: Filter by `category_id` if I had looking up the ID first.
    // This is robust.

    // 1. Get Category ID
    const { data: catData } = await supabase.from('product_categories').select('id').eq('name', params.category).single();
    if (catData) {
      query = query.eq('category_id', catData.id);
    } else {
      // Category not found, return empty?
      return { items: [], total: 0 };
    }
  }

  if (params.skip !== undefined && params.top !== undefined) {
    query = query.range(params.skip, params.skip + params.top - 1);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching products from Supabase:", error);
    throw error;
  }

  const items = data.map((item: any) => ({
    ...item,
    category: item.category?.name || "Uncategorized",
    image: item.image || "/placeholder.svg",
  }));

  return {
    items,
    total: count || 0,
  };
}

// Fetch single product from Supabase
async function fetchSupabaseProduct(id: string): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .select(`
      id,
      name,
      description,
      longDescription:long_description,
      price,
      originalPrice:original_price,
      image:image_url,
      images,
      category:product_categories(name),
      tags,
      inStock:in_stock,
      sku,
      rating,
      reviewCount:review_count,
      badge,
      stock
    `)
    .eq("id", id)
    .single();

  if (error) throw error;

  return {
    ...data,
    category: data.category?.name || "Uncategorized",
    image: data.image || "/placeholder.svg",
  } as unknown as Product;
}

// Fetch categories from Supabase
async function fetchSupabaseCategories(): Promise<CategoryResponse[]> {
  const { data, error } = await supabase
    .from("product_categories")
    .select("id, name")
    .eq("is_active", true);

  if (error) throw error;

  // We should also get the count of products per category if needed.
  // For now, simpler implementation.
  // To get count: .select('id, name, products(count)')?

  return data.map((c: any) => ({
    id: c.name, // The app expects 'id' to be the identifier for filtering, which seems to be the Name or Slug. useProducts callers use 'activeCategory' which is e.g. "Fios".
    // If I map 'id' to 'name', it matches existing logic.
    name: c.name,
    count: 0, // Placeholder
  }));
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
    id: c.name, // Use name as ID to match behavior
    name: c.name,
    count: c.count,
  }));
}

// Main hook to fetch products
export function useProducts(params: UseProductsParams = {}) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: async () => {
      try {
        return await fetchSupabaseProducts(params);
      } catch (error) {
        console.warn("Supabase fetch failed, using local data:", error);
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
    queryKey: ["product", id],
    queryFn: async () => {
      try {
        return await fetchSupabaseProduct(id);
      } catch (error) {
        console.warn("Supabase fetch failed, using local data:", error);
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
    queryKey: ["categories"],
    queryFn: async () => {
      try {
        return await fetchSupabaseCategories();
      } catch (error) {
        console.warn("Supabase fetch failed, using local categories:", error);
        return getLocalCategories();
      }
    },
    enabled,
    staleTime: 1000 * 60 * 30, // 30 minutes
    retry: 1,
  });
}
