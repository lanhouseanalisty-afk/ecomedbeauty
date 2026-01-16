import ithreadImg from "@/assets/product-ithread.jpg";
import eptqImg from "@/assets/product-eptq.jpg";
import idebenoneImg from "@/assets/product-idebenone.jpg";
import nanocannulaImg from "@/assets/product-nanocannula.jpg";
import { Product, Coupon, Review } from "@/types/product";

export const products: Product[] = [
  {
    id: "1",
    name: "i-THREAD",
    description: "Fios de PDO para bioestimulação de colágeno e reposicionamento tecidual.",
    longDescription: `O i-THREAD é a linha pioneira de fios de PDO no Brasil, desenvolvida para bioestimulação de colágeno e reposicionamento tecidual facial e corporal.

Reconhecido internacionalmente, oferece resultados naturais e duradouros. Aprovado pela ANVISA e utilizado por profissionais de referência em estética avançada.

**Indicações:**
- Lifting facial não cirúrgico
- Rejuvenescimento da pele
- Redefinição do contorno facial
- Tratamento de flacidez`,
    price: 890.00,
    originalPrice: 1090.00,
    image: ithreadImg,
    category: "Fios",
    tags: ["PDO", "Lifting", "Rejuvenescimento"],
    inStock: true,
    sku: "ITH-001",
    rating: 4.9,
    reviewCount: 127,
    badge: "bestseller",
    stock: 45,
  },
  {
    id: "2",
    name: "e.p.t.q",
    description: "Preenchedor de ácido hialurônico com equilíbrio perfeito entre firmeza e fluidez.",
    longDescription: `O e.p.t.q é um preenchedor de ácido hialurônico premium, desenvolvido com tecnologia exclusiva que proporciona equilíbrio ideal entre firmeza e fluidez.

Oferece resultados naturais com máximo conforto durante a aplicação, sendo ideal para harmonização facial.

**Indicações:**
- Preenchimento labial
- Correção de sulcos
- Volumização facial
- Harmonização do contorno`,
    price: 650.00,
    image: eptqImg,
    category: "Preenchedores",
    tags: ["Ácido Hialurônico", "Preenchimento", "Harmonização"],
    inStock: true,
    sku: "EPT-001",
    rating: 4.8,
    reviewCount: 89,
    badge: "new",
    stock: 32,
  },
  {
    id: "3",
    name: "Idebenone Ampoule",
    description: "Tratamento antioxidante premium em ampolas com tecnologia de duas soluções.",
    longDescription: `O Idebenone Ampoule é um tratamento antioxidante de alta performance, apresentado em sistema exclusivo de duas soluções para máxima eficácia.

Combate os sinais do envelhecimento cutâneo, protegendo a pele contra danos oxidativos e promovendo luminosidade.

**Benefícios:**
- Ação antioxidante potente
- Proteção contra radicais livres
- Melhora da luminosidade
- Tratamento anti-aging completo`,
    price: 420.00,
    originalPrice: 520.00,
    image: idebenoneImg,
    category: "Skincare",
    tags: ["Antioxidante", "Anti-aging", "Ampolas"],
    inStock: true,
    sku: "IDE-001",
    rating: 4.7,
    reviewCount: 56,
    badge: "sale",
    stock: 78,
  },
  {
    id: "4",
    name: "Nano Cânula",
    description: "Cânulas de alta precisão para procedimentos estéticos minimamente invasivos.",
    longDescription: `A Nano Cânula MedBeauty oferece precisão máxima em procedimentos estéticos minimamente invasivos, com design otimizado para conforto do paciente.

Fabricada com materiais de última geração, proporciona deslizamento suave e controle excepcional.

**Características:**
- Ponta flexível e segura
- Múltiplos calibres disponíveis
- Esterilização garantida
- Embalagem individual`,
    price: 180.00,
    image: nanocannulaImg,
    category: "Instrumentais",
    tags: ["Cânula", "Procedimentos", "Precisão"],
    inStock: true,
    sku: "NAN-001",
    rating: 4.6,
    reviewCount: 203,
    stock: 150,
  },
  {
    id: "5",
    name: "Ultra Lift PDO",
    description: "Fios tensores premium com máxima capacidade de sustentação para lifting avançado.",
    longDescription: `O Ultra Lift PDO representa o que há de mais avançado em tecnologia de fios tensores, oferecendo sustentação superior e resultados de longa duração.

**Características:**
- Âncoras bidirecionais
- Material biocompatível
- Resultados imediatos
- Duração de até 24 meses`,
    price: 1290.00,
    originalPrice: 1490.00,
    image: ithreadImg,
    category: "Fios",
    tags: ["PDO", "Lifting", "Tensor"],
    inStock: true,
    sku: "ULT-001",
    rating: 5.0,
    reviewCount: 42,
    badge: "limited",
    stock: 12,
  },
  {
    id: "6",
    name: "Hydra Boost Serum",
    description: "Sérum intensivo de hidratação profunda com ácido hialurônico de baixo peso molecular.",
    longDescription: `O Hydra Boost Serum penetra nas camadas mais profundas da pele, proporcionando hidratação intensa e duradoura.

**Benefícios:**
- Hidratação 72 horas
- Preenchimento de linhas finas
- Barreira cutânea fortalecida
- Textura aveludada`,
    price: 280.00,
    image: idebenoneImg,
    category: "Skincare",
    tags: ["Hidratação", "Ácido Hialurônico", "Sérum"],
    inStock: true,
    sku: "HYD-001",
    rating: 4.8,
    reviewCount: 178,
    badge: "bestseller",
    stock: 95,
  },
  {
    id: "7",
    name: "Precision Needle Set",
    description: "Kit profissional de agulhas de alta precisão para procedimentos estéticos variados.",
    longDescription: `O Precision Needle Set contém uma seleção completa de agulhas para diferentes procedimentos, garantindo versatilidade e segurança.

**Conteúdo:**
- 10 calibres diferentes
- Embalagem estéril individual
- Guia de aplicação
- Estojo organizador`,
    price: 350.00,
    image: nanocannulaImg,
    category: "Instrumentais",
    tags: ["Agulhas", "Kit", "Precisão"],
    inStock: false,
    sku: "PRE-001",
    rating: 4.5,
    reviewCount: 67,
    stock: 0,
  },
  {
    id: "8",
    name: "Volume Plus HA",
    description: "Preenchedor volumizador de alta densidade para áreas que necessitam maior sustentação.",
    longDescription: `O Volume Plus HA é formulado especialmente para áreas que requerem maior volumização e sustentação, como maçãs do rosto e mento.

**Indicações:**
- Volumização malar
- Correção de contorno mandibular
- Projeção de mento
- Harmonização facial completa`,
    price: 890.00,
    image: eptqImg,
    category: "Preenchedores",
    tags: ["Ácido Hialurônico", "Volume", "Contorno"],
    inStock: true,
    sku: "VOL-001",
    rating: 4.9,
    reviewCount: 94,
    badge: "new",
    stock: 28,
  },
];

export const categories = [
  { id: "all", name: "Todos", count: products.length },
  { id: "Fios", name: "Fios", count: products.filter(p => p.category === "Fios").length },
  { id: "Preenchedores", name: "Preenchedores", count: products.filter(p => p.category === "Preenchedores").length },
  { id: "Skincare", name: "Skincare", count: products.filter(p => p.category === "Skincare").length },
  { id: "Instrumentais", name: "Instrumentais", count: products.filter(p => p.category === "Instrumentais").length },
];

export const reviews: Review[] = [
  {
    id: "1",
    productId: "1",
    userName: "Dra. Ana Silva",
    rating: 5,
    comment: "Excelente qualidade! Os resultados são impressionantes e meus pacientes amam.",
    date: new Date("2024-01-15"),
    verified: true,
  },
  {
    id: "2",
    productId: "1",
    userName: "Dr. Carlos Mendes",
    rating: 5,
    comment: "Produto de altíssima qualidade. Uso há 2 anos e nunca me decepcionou.",
    date: new Date("2024-01-10"),
    verified: true,
  },
  {
    id: "3",
    productId: "2",
    userName: "Dra. Beatriz Santos",
    rating: 4,
    comment: "Ótimo preenchedor, fácil aplicação e resultado natural.",
    date: new Date("2024-01-08"),
    verified: true,
  },
];

export const coupons: Coupon[] = [
  {
    code: "PRIMEIRA10",
    discount: 10,
    type: "percentage",
    minValue: 200,
  },
  {
    code: "FRETE50",
    discount: 50,
    type: "fixed",
    minValue: 500,
  },
  {
    code: "MEDBEAUTY20",
    discount: 20,
    type: "percentage",
    minValue: 1000,
  },
];

export const testimonials = [
  {
    id: "1",
    name: "Dra. Marina Costa",
    role: "Dermatologista",
    location: "São Paulo, SP",
    avatar: "MC",
    content: "A MedBeauty revolucionou minha clínica. Produtos de qualidade excepcional e suporte técnico impecável.",
    rating: 5,
  },
  {
    id: "2",
    name: "Dr. Roberto Lima",
    role: "Cirurgião Plástico",
    location: "Rio de Janeiro, RJ",
    avatar: "RL",
    content: "Confio nos produtos MedBeauty há mais de 5 anos. A consistência e qualidade são incomparáveis.",
    rating: 5,
  },
  {
    id: "3",
    name: "Dra. Patricia Alves",
    role: "Esteticista",
    location: "Belo Horizonte, MG",
    avatar: "PA",
    content: "Meus pacientes percebem a diferença. Os resultados com os fios i-THREAD são extraordinários.",
    rating: 5,
  },
];

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProductsByCategory(category: string): Product[] {
  if (category === "all") return products;
  return products.filter((p) => p.category === category);
}

export function searchProducts(query: string): Product[] {
  const lowercaseQuery = query.toLowerCase();
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(lowercaseQuery) ||
      p.description.toLowerCase().includes(lowercaseQuery) ||
      p.category.toLowerCase().includes(lowercaseQuery) ||
      p.tags?.some((t) => t.toLowerCase().includes(lowercaseQuery))
  );
}

export function getRelatedProducts(productId: string, limit = 4): Product[] {
  const product = getProductById(productId);
  if (!product) return [];
  
  return products
    .filter((p) => p.id !== productId && p.category === product.category)
    .slice(0, limit);
}

export function getProductReviews(productId: string): Review[] {
  return reviews.filter((r) => r.productId === productId);
}

export function validateCoupon(code: string, cartTotal: number): Coupon | null {
  const coupon = coupons.find((c) => c.code.toUpperCase() === code.toUpperCase());
  if (!coupon) return null;
  if (coupon.minValue && cartTotal < coupon.minValue) return null;
  if (coupon.expiresAt && new Date() > coupon.expiresAt) return null;
  return coupon;
}

export function sortProducts(
  productList: Product[],
  sortBy: "price-asc" | "price-desc" | "name" | "newest" | "rating"
): Product[] {
  return [...productList].sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "name":
        return a.name.localeCompare(b.name);
      case "rating":
        return (b.rating || 0) - (a.rating || 0);
      case "newest":
      default:
        return 0;
    }
  });
}

export function filterProductsByPrice(
  productList: Product[],
  minPrice: number,
  maxPrice: number
): Product[] {
  return productList.filter((p) => p.price >= minPrice && p.price <= maxPrice);
}
