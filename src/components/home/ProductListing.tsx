import { FeaturedProducts } from "./FeaturedProducts";
import { CategoriesSection } from "./CategoriesSection";

export function ProductListing() {
    return (
        <div className="py-12 bg-slate-50 min-h-screen">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-serif text-[#2B0F54] mb-8 text-center font-bold">Nossa Loja</h1>
                <CategoriesSection />
                <div className="mt-12">
                    <FeaturedProducts />
                </div>
            </div>
        </div>
    );
}
