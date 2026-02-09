import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom"; // Added useLocation
import { cn } from "@/lib/utils";
import { Search, ShoppingBag, Heart, User, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAuth } from "@/contexts/AuthContext";
import { useCMS } from "@/contexts/CMSContext";
import { CMSText } from "@/components/cms/CMSText";
import { ProductSearch } from "@/components/products/ProductSearch";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { totalItems, setIsCartOpen } = useCart();
  const { totalItems: wishlistItems } = useWishlist();
  const { user, signOut, isEmployee } = useAuth();
  const { content, isEditing } = useCMS();
  const location = useLocation(); // Hook for active route

  // If editing, links should be disabled or prevented to allow text selection
  const LinkComponent = isEditing ? "div" : Link;
  const linkProps = (to: string) => isEditing ? {} : { to };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-500",
        isScrolled ? "bg-[#2b0f54]/90 backdrop-blur-xl border-b border-white/5 shadow-elegant" : "bg-[#2b0f54]"
      )}
    >
      <nav className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-4 py-4 lg:px-8">

        {/* Left Section: Logo & Divider */}
        <div className="flex items-center gap-8">
          <LinkComponent {...linkProps("/")} className="group cursor-pointer flex items-center">
            <span className="font-sans text-2xl font-bold tracking-[0.2em] text-white uppercase flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#ECB546] animate-pulse" />
              MEDBEAUTY
            </span>
          </LinkComponent>

          {/* Vertical Gold Divider */}
          <div className="hidden lg:block h-6 w-[1px] bg-white/10"></div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-x-10">
            {[
              { label: "COLEÇÃO", path: "/produtos" },
              { label: "CIÊNCIA", path: "/sobre" },
            ].map(item => (
              <LinkComponent
                key={item.label}
                {...linkProps(item.path)}
                className={`text-[11px] font-bold transition-all cursor-pointer text-center tracking-[0.2em] uppercase
                            ${isActive(item.path) ? 'text-[#ECB546]' : 'text-white/70 hover:text-white'}
                        `}
              >
                {item.label}
              </LinkComponent>
            ))}
          </div>
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-white">
            {/* Search */}
            <Sheet open={searchOpen} onOpenChange={setSearchOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/5 rounded-full transition-colors">
                  <Search className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="top" className="h-[400px] bg-[#2b0f54] border-white/5 text-white">
                <SheetHeader>
                  <SheetTitle className="sr-only">Buscar Laboratório MedBeauty</SheetTitle>
                </SheetHeader>
                <div className="mx-auto max-w-3xl py-12">
                  <div className="text-center mb-10 space-y-2">
                    <h2 className="font-serif text-4xl font-bold">O que procura hoje?</h2>
                    <p className="text-white/40 text-sm uppercase tracking-widest">Acesse nossa base científica de produtos</p>
                  </div>
                  <ProductSearch onClose={() => setSearchOpen(false)} />
                </div>
              </SheetContent>
            </Sheet>

            {!user ? (
              <>
                <LinkComponent {...linkProps("/conta")}>
                  <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/5 rounded-full transition-colors">
                    <User className="h-5 w-5" />
                  </Button>
                </LinkComponent>

                <LinkComponent {...linkProps("/conta")}>
                  <Button variant="ghost" size="sm" className="hidden lg:flex text-[#ECB546] hover:bg-[#ECB546]/10 hover:text-[#ECB546] transition-colors font-medium">
                    Cadastre-se
                  </Button>
                </LinkComponent>
              </>
            ) : (
              <LinkComponent {...linkProps("/perfil")}>
                <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/5 rounded-full transition-colors">
                  <User className="h-5 w-5" />
                </Button>
              </LinkComponent>
            )}

            <div className="h-4 w-[1px] bg-white/10 mx-2" />

            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="text-white/70 hover:text-white hover:bg-white/5 rounded-full transition-colors"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingBag className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#ECB546] text-[10px] font-bold text-[#2b0f54]">
                    {totalItems}
                  </span>
                )}
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-white/70 ml-2"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>

      </nav>

      {/* Mobile Menu Sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="right" className="bg-[#2b0f54] border-none text-white w-[300px]">
          <div className="flex flex-col gap-6 mt-8">
            {[
              { label: "Home", path: "/" },
              { label: "Sobre Nós", path: "/sobre" },
              { label: "Produtos", path: "/produtos" },
              { label: "Área do Aluno", path: "/area-do-aluno" },
            ].map(item => (
              <LinkComponent
                key={item.label}
                {...linkProps(item.path)}
                className={`text-lg font-medium transition-colors ${isActive(item.path) ? 'text-[#ECB546]' : 'text-white'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </LinkComponent>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
