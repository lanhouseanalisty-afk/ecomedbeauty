import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Minus, Plus, ShoppingCart, Truck, Shield, RotateCcw, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { getProductById, getRelatedProducts } from "@/data/products";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/products/ProductCard";
import { Badge } from "@/components/ui/badge";
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";
import { ProductBadge } from "@/components/ui/product-badge";
import { RatingStars } from "@/components/ui/rating-stars";
import { StockIndicator } from "@/components/ui/stock-indicator";
import { ProductReviews } from "@/components/products/ProductReviews";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const product = getProductById(id || "");
  const { addItem } = useCart();
  const { addItem: addToWishlist, isInWishlist, removeItem: removeFromWishlist } = useWishlist();
  const { addProduct } = useRecentlyViewed();
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (product) {
      addProduct(product);
    }
  }, [product?.id]);

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center lg:px-8">
        <h1 className="font-serif text-2xl font-bold text-foreground">
          Produto não encontrado
        </h1>
        <Button asChild className="mt-4">
          <Link to="/produtos">Voltar aos produtos</Link>
        </Button>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const relatedProducts = getRelatedProducts(product.id, 4);

  const handleWishlistClick = () => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <>
      <Helmet>
        <title>{`${product.name} | MedBeauty`}</title>
        <meta name="description" content={product.description} />
      </Helmet>

      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <BreadcrumbNav
          items={[
            { label: "Produtos", href: "/produtos" },
            { label: product.name },
          ]}
          className="mb-8"
        />

        <div className="grid gap-12 lg:grid-cols-2">
          {/* Image */}
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted img-zoom animate-fade-in-up">
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover"
            />
            {product.badge && (
              <div className="absolute left-4 top-4">
                <ProductBadge badge={product.badge} />
              </div>
            )}
            {product.originalPrice && (
              <Badge className="absolute right-4 top-4 bg-destructive">
                -{Math.round((1 - product.price / product.originalPrice) * 100)}%
              </Badge>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col animate-fade-in-up stagger-1">
            <Badge variant="outline" className="w-fit">
              {product.category}
            </Badge>

            <h1 className="mt-4 font-serif text-3xl font-bold text-foreground lg:text-4xl">
              {product.name}
            </h1>

            {product.rating && (
              <div className="mt-3">
                <RatingStars rating={product.rating} showValue reviewCount={product.reviewCount} />
              </div>
            )}

            <p className="mt-4 text-lg text-muted-foreground">{product.description}</p>

            <div className="mt-4">
              <StockIndicator stock={product.stock} inStock={product.inStock} showCount />
            </div>

            {/* Price */}
            <div className="mt-6 flex items-baseline gap-3">
              <span className="text-3xl font-bold text-primary">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <span className="text-xl text-muted-foreground line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            {/* Quantity */}
            <div className="mt-8 flex items-center gap-4">
              <span className="text-sm font-medium text-foreground">Quantidade:</span>
              <div className="flex items-center rounded-lg border border-border">
                <Button variant="ghost" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}>
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button variant="ghost" size="icon" onClick={() => setQuantity(quantity + 1)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex gap-3">
              <Button size="lg" className="flex-1 gap-2" onClick={() => addItem(product, quantity)} disabled={!product.inStock}>
                <ShoppingCart className="h-5 w-5" />
                {product.inStock ? "Adicionar ao Carrinho" : "Indisponível"}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleWishlistClick}
                className={cn(isInWishlist(product.id) && "text-destructive border-destructive")}
              >
                <Heart className={cn("h-5 w-5", isInWishlist(product.id) && "fill-current")} />
              </Button>
            </div>

            {/* Features */}
            <div className="mt-8 grid gap-4 border-t border-border pt-8">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Truck className="h-5 w-5 text-primary" />
                Frete grátis para compras acima de R$ 500
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Shield className="h-5 w-5 text-primary" />
                Produto aprovado pela ANVISA
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <RotateCcw className="h-5 w-5 text-primary" />
                Garantia de 30 dias
              </div>
            </div>

            {/* Tags */}
            {product.tags && (
              <div className="mt-6 flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Product Details Tabs */}
        <section className="mt-16">
          <Tabs defaultValue="reviews" className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="description">Descrição</TabsTrigger>
              <TabsTrigger value="reviews">Avaliações</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="mt-6">
              <div className="prose prose-neutral max-w-none dark:prose-invert">
                <p className="text-muted-foreground text-lg leading-relaxed">
                  {product.longDescription || product.description}
                </p>
              </div>
            </TabsContent>
            <TabsContent value="reviews" className="mt-6">
              <ProductReviews productId={product.id} />
            </TabsContent>
          </Tabs>
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-24">
            <h2 className="mb-8 font-serif text-2xl font-bold text-foreground">Produtos Relacionados</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((p, index) => (
                <ProductCard key={p.id} product={p} index={index} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
