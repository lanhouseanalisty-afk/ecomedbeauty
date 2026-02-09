import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Minus, Plus, ShoppingCart, Truck, Shield, RotateCcw, Heart, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useProduct, useProducts } from "@/hooks/useProducts";
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
  const { data: product, isLoading: isProductLoading } = useProduct(id || "");
  const { data: relatedData, isLoading: isRelatedLoading } = useProducts({
    category: product?.category,
    top: 5, // Fetch 5 to filter out current product
    enabled: !!product
  });

  const { addItem } = useCart();
  const { addItem: addToWishlist, isInWishlist, removeItem: removeFromWishlist } = useWishlist();
  const { addProduct } = useRecentlyViewed();
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (product) {
      addProduct(product);
    }
  }, [product?.id]);

  const relatedProducts = relatedData?.items.filter(p => p.id !== product?.id).slice(0, 4) || [];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const handleWishlistClick = () => {
    if (product && isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else if (product) {
      addToWishlist(product);
    }
  };

  if (isProductLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Carregando detalhes do produto...</p>
      </div>
    );
  }

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

        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          {/* Image */}
          <div className="relative group aspect-square overflow-hidden rounded-[3rem] border border-[#2B0F54]/5 bg-white shadow-soft animate-fade-in-up">
            <div className="absolute inset-0 bg-gradient-to-br from-[#2B0F54]/5 to-transparent z-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-contain p-12 transition-transform duration-700 group-hover:scale-105"
            />
            {product.badge && (
              <div className="absolute left-8 top-8">
                <ProductBadge badge={product.badge} className="bg-white/80 backdrop-blur-md border-[#2B0F54]/10 text-[#2B0F54] font-bold" />
              </div>
            )}

            {/* Scientific Watermark */}
            <div className="absolute bottom-10 right-10 opacity-5 group-hover:opacity-10 transition-opacity">
              <Microscope className="h-32 w-32 text-[#2B0F54]" />
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col animate-fade-in-up stagger-1 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#cfa79d]">
                  {product.category}
                </span>
                <div className="h-[1px] w-12 bg-[#cfa79d]/30" />
              </div>

              <h1 className="font-serif text-4xl font-bold text-[#2B0F54] lg:text-5xl leading-tight">
                {product.name}
              </h1>

              {product.rating && (
                <div className="flex items-center gap-4">
                  <RatingStars rating={product.rating} showValue reviewCount={product.reviewCount} />
                  <div className="h-4 w-[1px] bg-slate-200" />
                  <span className="text-[10px] font-bold text-[#2B0F54]/40 uppercase tracking-widest">Padrão Ouro MedBeauty</span>
                </div>
              )}
            </div>

            <p className="text-lg text-slate-500 leading-relaxed font-normal italic">
              "{product.description}"
            </p>

            <div className="flex items-center gap-4 py-4 border-y border-[#2B0F54]/5">
              <StockIndicator stock={product.stock} inStock={product.inStock} showCount />
              <div className="h-4 w-[1px] bg-slate-200" />
              <div className="flex items-center gap-2 text-xs font-bold text-[#2B0F54]/60 uppercase tracking-tighter">
                <Shield className="h-4 w-4 text-[#ECB546]" />
                Autenticidade Garantida
              </div>
            </div>

            {/* Price */}
            <div className="flex flex-col">
              {product.originalPrice && (
                <span className="text-sm text-slate-400 line-through font-medium">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
              <div className="flex items-center gap-4">
                <span className="text-4xl font-bold text-[#2B0F54]">{formatPrice(product.price)}</span>
                <Badge className="bg-[#ECB546]/10 text-[#ECB546] border-[#ECB546]/20 rounded-full py-1">
                  Profissional
                </Badge>
              </div>
            </div>

            {/* Quantity & Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <div className="flex items-center rounded-2xl border border-[#2B0F54]/10 bg-white p-1 h-14">
                <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl text-[#2B0F54]/40" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}>
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-bold text-[#2B0F54]">{quantity}</span>
                <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl text-[#2B0F54]" onClick={() => setQuantity(quantity + 1)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <Button
                size="lg"
                className="flex-1 h-14 rounded-2xl bg-[#2B0F54] text-white hover:bg-[#1a0933] shadow-lg shadow-[#2B0F54]/10 gap-3 text-sm font-bold uppercase tracking-widest transition-all hover:scale-[1.02]"
                onClick={() => addItem(product, quantity)}
                disabled={!product.inStock}
              >
                <ShoppingCart className="h-5 w-5" />
                {product.inStock ? "Adicionar ao Orçamento" : "Indisponível"}
              </Button>

              <Button
                size="icon"
                variant="outline"
                onClick={handleWishlistClick}
                className={cn("h-14 w-14 rounded-2xl border-[#2B0F54]/10 transition-colors", isInWishlist(product.id) && "text-destructive border-destructive bg-destructive/5")}
              >
                <Heart className={cn("h-5 w-5", isInWishlist(product.id) && "fill-current")} />
              </Button>
            </div>

            {/* Scientific Features */}
            <div className="grid grid-cols-2 gap-4 pt-8">
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <Beaker className="h-5 w-5 text-[#cfa79d] mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#2B0F54] uppercase tracking-tighter">Bio-Tecnologia</span>
                  <span className="text-[10px] text-slate-400">Ativos de Liberação Prolongada</span>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <Microscope className="h-5 w-5 text-[#cfa79d] mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#2B0F54] uppercase tracking-tighter">Grau Médico</span>
                  <span className="text-[10px] text-slate-400">Pureza Superior a 99%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <section className="mt-24">
          <Tabs defaultValue="science" className="w-full">
            <div className="flex justify-center mb-10">
              <TabsList className="bg-slate-100 p-1 rounded-full h-14 border border-slate-200">
                <TabsTrigger value="science" className="rounded-full px-8 h-12 data-[state=active]:bg-white data-[state=active]:text-[#2B0F54] data-[state=active]:shadow-sm text-xs font-bold uppercase tracking-widest text-slate-400">Ciência & Ativos</TabsTrigger>
                <TabsTrigger value="protocol" className="rounded-full px-8 h-12 data-[state=active]:bg-white data-[state=active]:text-[#2B0F54] data-[state=active]:shadow-sm text-xs font-bold uppercase tracking-widest text-slate-400">Protocolo Profissional</TabsTrigger>
                <TabsTrigger value="reviews" className="rounded-full px-8 h-12 data-[state=active]:bg-white data-[state=active]:text-[#2B0F54] data-[state=active]:shadow-sm text-xs font-bold uppercase tracking-widest text-slate-400">Avaliações</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="science" className="animate-fade-in-up">
              <div className="grid lg:grid-cols-2 gap-12 bg-white rounded-[3rem] p-12 shadow-soft border border-[#2B0F54]/5">
                <div className="prose prose-neutral max-w-none">
                  <h3 className="font-serif text-3xl font-bold text-[#2B0F54] mb-6">Mecanismo de Ação</h3>
                  <p className="text-slate-500 text-lg leading-relaxed mb-6">
                    {product.longDescription || product.description}
                  </p>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="h-6 w-6 rounded-full bg-[#ECB546]/10 flex-shrink-0 flex items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-[#ECB546]" />
                      </div>
                      <p className="text-sm font-medium text-slate-600">Alta bioconformidade com tecidos dérmicos profundos.</p>
                    </div>
                    <div className="flex gap-4">
                      <div className="h-6 w-6 rounded-full bg-[#ECB546]/10 flex-shrink-0 flex items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-[#ECB546]" />
                      </div>
                      <p className="text-sm font-medium text-slate-600">Otimizado para resultados naturais e duradouros.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-[#2B0F54]/5 rounded-[2rem] p-8 flex flex-col justify-center space-y-6">
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#2B0F54]/5">
                    <span className="text-[10px] font-bold text-[#cfa79d] uppercase tracking-widest">Ativo Principal</span>
                    <h4 className="text-xl font-bold text-[#2B0F54] mt-1">Ácido Hialurônico Ultra-Puro</h4>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">Cross-linking de quinta geração para estabilidade máxima.</p>
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#2B0F54]/5">
                    <span className="text-[10px] font-bold text-[#cfa79d] uppercase tracking-widest">Co-Fatores</span>
                    <h4 className="text-xl font-bold text-[#2B0F54] mt-1">Lidocaína 0.3%</h4>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">Garante conforto total ao paciente durante o procedimento.</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="protocol" className="animate-fade-in-up">
              <div className="bg-white rounded-[3rem] p-12 shadow-soft border border-[#2B0F54]/5">
                <div className="max-w-2xl mx-auto space-y-10">
                  <div className="text-center">
                    <h3 className="font-serif text-3xl font-bold text-[#2B0F54]">Guia de Aplicação</h3>
                    <p className="text-slate-400 mt-2 italic">* Uso exclusivo por profissionais habilitados</p>
                  </div>
                  <div className="space-y-8">
                    <div className="flex gap-6">
                      <span className="text-4xl font-serif font-bold text-[#2B0F54]/10">01</span>
                      <div className="pt-2">
                        <h4 className="font-bold text-[#2B0F54]">Preparação</h4>
                        <p className="text-sm text-slate-500 mt-1">Assepsia rigorosa da área e marcação técnica dos pontos de aplicação.</p>
                      </div>
                    </div>
                    <div className="flex gap-6">
                      <span className="text-4xl font-serif font-bold text-[#2B0F54]/10">02</span>
                      <div className="pt-2">
                        <h4 className="font-bold text-[#2B0F54]">Técnica</h4>
                        <p className="text-sm text-slate-500 mt-1">Utilizar cânula ou agulha de calibre específico (conforme manual SAP).</p>
                      </div>
                    </div>
                    <div className="flex gap-6">
                      <span className="text-4xl font-serif font-bold text-[#2B0F54]/10">03</span>
                      <div className="pt-2">
                        <h4 className="font-bold text-[#2B0F54]">Pós-Procedimento</h4>
                        <p className="text-sm text-slate-500 mt-1">Massagem suave se necessário e orientações de home-care.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="animate-fade-in-up">
              <div className="bg-white rounded-[3rem] p-12 shadow-soft border border-[#2B0F54]/5">
                <ProductReviews productId={product.id} />
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* Related Products */}
        {!isRelatedLoading && relatedProducts.length > 0 && (
          <section className="mt-32">
            <div className="flex items-center justify-between mb-12">
              <h2 className="font-serif text-4xl font-bold text-[#2B0F54]">Outras Soluções de Performance</h2>
              <Button variant="ghost" className="text-[#cfa79d] font-bold uppercase tracking-widest text-xs">Ver Todos <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </div>
            <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
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
