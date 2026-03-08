import { Button } from "@/components/ui/button";

export function ProductView({ productId }: { productId: string }) {
    return (
        <div className="py-12 bg-white min-h-[70vh]">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="grid md:grid-cols-2 gap-12">
                    {/* Image Placeholder */}
                    <div className="bg-slate-100 aspect-square rounded-2xl flex items-center justify-center border border-slate-200">
                        <span className="text-slate-400 font-medium">Imagem do Produto</span>
                    </div>

                    {/* Product Details */}
                    <div className="space-y-6 flex flex-col justify-center">
                        <div>
                            <span className="text-[#8347EB] text-sm font-bold tracking-wider uppercase mb-2 block">Categoria</span>
                            <h1 className="text-4xl font-serif text-[#2B0F54] font-bold">Produto Exemplo {productId}</h1>
                        </div>

                        <div className="text-2xl font-bold text-slate-900">
                            R$ 299,90
                        </div>

                        <p className="text-slate-600 leading-relaxed">
                            Descrição detalhada do produto focado em harmonização facial. Este é um texto de exemplo para visualização no editor da loja.
                        </p>

                        <div className="pt-6 border-t border-slate-100 flex gap-4">
                            <Button className="flex-1 bg-[#2B0F54] hover:bg-[#1a0933] h-12 text-lg">
                                Adicionar ao Carrinho
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
