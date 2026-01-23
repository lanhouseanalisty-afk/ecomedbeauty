import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { useProducts } from "@/hooks/useProducts";
import { sortProducts, filterProductsByPrice } from "@/utils/product-utils";
import { ProductGrid } from "@/components/products/ProductGrid";
import { ProductFilters } from "@/components/products/ProductFilters";
import { ProductSearch } from "@/components/products/ProductSearch";
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";
import { Skeleton } from "@/components/ui/skeleton";

export default function Products() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [sortBy, setSortBy] = useState("newest");
  const [inStockOnly, setInStockOnly] = useState(false);

  // Fetch products from SAP B1 (with local fallback)
  const { data: productsData, isLoading, error } = useProducts({
    category: activeCategory !== "all" ? activeCategory : undefined,
  });

  const products = productsData?.items || [];

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by price
    result = filterProductsByPrice(result, priceRange[0], priceRange[1]);

    // Filter by stock
    if (inStockOnly) {
      result = result.filter((p) => p.inStock);
    }

    // Sort
    result = sortProducts(result, sortBy as "price-asc" | "price-desc" | "name" | "newest" | "rating");

    return result;
  }, [products, priceRange, sortBy, inStockOnly]);

  return (
    <>
      <Helmet>
        <title>Produtos | MedBeauty - Estética Profissional</title>
        <meta
          name="description"
          content="Explore nossa linha completa de produtos para estética profissional: fios de PDO, preenchedores de ácido hialurônico, skincare e instrumentais."
        />
      </Helmet>

      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        {/* Breadcrumb */}
        <BreadcrumbNav
          items={[{ label: "Produtos" }]}
          className="mb-6"
        />

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground lg:text-4xl">
              Nossos Produtos
            </h1>
            <p className="mt-1 text-muted-foreground">
              Soluções premium para profissionais de estética
            </p>
          </div>

          {/* Search */}
          <div className="w-full sm:w-72">
            <ProductSearch />
          </div>
        </div>

        {/* Main content */}
        <div className="flex gap-8">
          {/* Filters */}
          <ProductFilters
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            priceRange={priceRange}
            onPriceRangeChange={setPriceRange}
            sortBy={sortBy}
            onSortChange={setSortBy}
            inStockOnly={inStockOnly}
            onInStockChange={setInStockOnly}
          />

          {/* Products */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-48 w-full rounded-lg" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="flex h-48 items-center justify-center text-muted-foreground">
                Erro ao carregar produtos. Tente novamente.
              </div>
            ) : (
              <ProductGrid products={filteredProducts} />
            )}

            {/* Results count */}
            <p className="mt-8 text-center text-sm text-muted-foreground">
              Mostrando {filteredProducts.length} de {productsData?.total || products.length} produtos
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
