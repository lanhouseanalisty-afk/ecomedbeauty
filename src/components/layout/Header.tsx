import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom"; // Added useLocation
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
  const { totalItems } = useCart();
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
    <header className="sticky top-0 z-50 w-full" style={{ backgroundColor: '#2b0f54' }}> {/* Deep Purple Background */}
      <nav className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-4 py-3 lg:px-8">

        {/* Left Section: Logo & Divider */}
        <div className="flex items-center gap-6">
          <LinkComponent {...linkProps("/")} className="group cursor-pointer flex items-center">
            {/* Recreating the Logo Text style if image doesn't work well on dark */}
            <span className="font-sans text-2xl font-medium tracking-wide text-white uppercase flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-[#ECB546] self-baseline mt-2"></span> {/* Dot */}
              MEDBEAUTY
              <span className="w-1 h-1 rounded-full bg-[#ECB546] self-start mb-2"></span> {/* Dot */}
            </span>
          </LinkComponent>

          {/* Vertical Gold Divider */}
          <div className="hidden lg:block h-8 w-[1px] bg-[#ECB546]"></div>

          {/* Desktop Navigation - Integrated on the left/center */}
          <div className="hidden lg:flex items-center gap-x-8 ml-2">
            {[
              { label: "Home", path: "/" },
              { label: "Sobre Nós", path: "/sobre" },
              { label: "Produtos", path: "/produtos" },
              { label: "Onde Comprar", path: "/onde-comprar" },
              { label: "Contatos", path: "/contatos" },
              { label: "Blog", path: "/blog" },
            ].map(item => (
              <LinkComponent
                key={item.label}
                {...linkProps(item.path)}
                className={`text-[15px] font-normal transition-colors cursor-pointer text-center tracking-wide
                            ${isActive(item.path) ? 'text-[#ECB546]' : 'text-white hover:text-[#ECB546]'}
                        `}
              >
                {item.label}
              </LinkComponent>
            ))}
            <LinkComponent
              {...linkProps("/area-do-aluno")}
              className={`text-[15px] font-normal transition-colors cursor-pointer text-center tracking-wide text-white hover:text-[#ECB546]`}
            >
              Área do Aluno
            </LinkComponent>
          </div>
        </div>


        {/* Right Section: Flags & Tools */}
        <div className="flex items-center gap-6">
          {/* Flags */}
          <div className="hidden lg:flex flex-col gap-1 items-center justify-center mr-4">
            <img src="/medbeauty/en-us.png" alt="US" className="w-5 h-auto opacity-80 hover:opacity-100 cursor-pointer" />
            <img src="/medbeauty/pt-br.png" alt="BR" className="w-5 h-auto opacity-100 hover:opacity-100 cursor-pointer shadow-sm" />
            <img src="/medbeauty/es.png" alt="ES" className="w-5 h-auto opacity-80 hover:opacity-100 cursor-pointer" />
          </div>

          {/* Actions Icons (White) */}
          <div className="flex items-center gap-3 text-white">
            {/* Search */}
            <Sheet open={searchOpen} onOpenChange={setSearchOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="hidden lg:flex text-white hover:text-[#ECB546] hover:bg-white/10">
                  <Search className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="top" className="h-auto">
                <SheetHeader>
                  <SheetTitle className="sr-only">Buscar produtos</SheetTitle>
                </SheetHeader>
                <div className="mx-auto max-w-2xl py-8">
                  <ProductSearch onClose={() => setSearchOpen(false)} />
                </div>
              </SheetContent>
            </Sheet>

            <LinkComponent {...linkProps("/conta")}>
              <Button variant="ghost" size="icon" className="hidden lg:flex text-white hover:text-[#ECB546] hover:bg-white/10">
                <User className="h-5 w-5" />
              </Button>
            </LinkComponent>

            <LinkComponent {...linkProps("/carrinho")} className="relative">
              <Button variant="ghost" size="icon" className="text-white hover:text-[#ECB546] hover:bg-white/10">
                <ShoppingBag className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#ECB546] text-[10px] font-bold text-[#2b0f54]">
                    {totalItems}
                  </span>
                )}
              </Button>
            </LinkComponent>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-white"
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
              { label: "Onde Comprar", path: "/onde-comprar" },
              { label: "Contatos", path: "/contatos" },
              { label: "Blog", path: "/blog" },
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
