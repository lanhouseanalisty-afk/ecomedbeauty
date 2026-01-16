import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Filter, SlidersHorizontal, Loader2 } from "lucide-react";
import { useCategories } from "@/hooks/useProducts";
import { categories as localCategories } from "@/data/products";

interface ProductFiltersProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  inStockOnly: boolean;
  onInStockChange: (inStock: boolean) => void;
}

export function ProductFilters({
  activeCategory,
  onCategoryChange,
  priceRange,
  onPriceRangeChange,
  sortBy,
  onSortChange,
  inStockOnly,
  onInStockChange,
}: ProductFiltersProps) {
  const [localPriceRange, setLocalPriceRange] = useState(priceRange);
  
  // Fetch categories from SAP B1 (with local fallback)
  const { data: sapCategories, isLoading: isLoadingCategories } = useCategories();
  
  // Merge SAP categories with local categories, prioritizing SAP
  const categories = sapCategories && sapCategories.length > 0
    ? [{ id: "all", name: "Todos", count: undefined }, ...sapCategories]
    : localCategories;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const FiltersContent = () => (
    <div className="space-y-6">
      {/* Sort */}
      <div>
        <Label className="text-sm font-medium">Ordenar por</Label>
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Mais recentes</SelectItem>
            <SelectItem value="price-asc">Menor preço</SelectItem>
            <SelectItem value="price-desc">Maior preço</SelectItem>
            <SelectItem value="name">Nome A-Z</SelectItem>
            <SelectItem value="rating">Melhor avaliação</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Price Range */}
      <div>
        <Label className="text-sm font-medium">Faixa de preço</Label>
        <div className="mt-4 px-1">
          <Slider
            value={localPriceRange}
            onValueChange={(value) => setLocalPriceRange(value as [number, number])}
            onValueCommit={(value) => onPriceRangeChange(value as [number, number])}
            min={0}
            max={2000}
            step={50}
            className="w-full"
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
          <span>{formatPrice(localPriceRange[0])}</span>
          <span>{formatPrice(localPriceRange[1])}</span>
        </div>
      </div>

      {/* In Stock */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="in-stock"
          checked={inStockOnly}
          onCheckedChange={(checked) => onInStockChange(checked as boolean)}
        />
        <Label htmlFor="in-stock" className="text-sm cursor-pointer">
          Apenas em estoque
        </Label>
      </div>

      {/* Categories */}
      <div>
        <Label className="text-sm font-medium">Categoria</Label>
        <div className="mt-3 space-y-2">
          {isLoadingCategories ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            categories.map((category) => (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                  activeCategory === category.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                <span>{category.name}</span>
                {category.count !== undefined && (
                  <span className="text-xs opacity-70">{category.count}</span>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile filters */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5" />
                Filtros
              </SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FiltersContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop filters */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-24 rounded-xl border border-border bg-card p-6">
          <h3 className="flex items-center gap-2 font-semibold text-foreground">
            <SlidersHorizontal className="h-5 w-5" />
            Filtros
          </h3>
          <div className="mt-6">
            <FiltersContent />
          </div>
        </div>
      </aside>
    </>
  );
}
