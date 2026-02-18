
import { useState, useMemo } from "react";
import {
    Calculator,
    Plus,
    Pencil,
    Trash2,
    Search,
    ArrowRight,
    Save,
    TrendingUp,
    Package,
    AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    usePricingIngredients,
    useCreatePricingIngredient,
    useUpdatePricingIngredient,
    useDeletePricingIngredient,
    usePricingRecipes,
    useUpdatePricingRecipe,
    useAllPricingRecipes,
    PricingIngredient,
} from "@/hooks/usePricing";
import { useProductsAdmin } from "@/hooks/useEcommerce";

export default function PricingPage() {
    const [activeTab, setActiveTab] = useState("analysis");
    const [searchTerm, setSearchTerm] = useState("");
    const [isIngredientDialogOpen, setIsIngredientDialogOpen] = useState(false);
    const [selectedIngredient, setSelectedIngredient] = useState<PricingIngredient | null>(null);
    const [selectedProductId, setSelectedProductId] = useState<string>("");
    const [targetMargin, setTargetMargin] = useState<number>(30); // 30% default margin

    // Data
    const { data: ingredients, isLoading: loadingIng } = usePricingIngredients();
    const { data: products, isLoading: loadingProducts } = useProductsAdmin();
    const { data: allRecipes, isLoading: loadingRecipes } = useAllPricingRecipes();

    const createIng = useCreatePricingIngredient();
    const updateIng = useUpdatePricingIngredient();
    const deleteIng = useDeletePricingIngredient();
    const updateRecipe = useUpdatePricingRecipe();

    // Selected product recipe
    const { data: currentRecipe } = usePricingRecipes(selectedProductId);
    const [recipeItems, setRecipeItems] = useState<{ ingredient_id: string; quantity: number }[]>([]);

    // Form State for Ingredients
    const [ingFormData, setIngFormData] = useState({
        name: "",
        unit: "",
        cost_per_unit: 0,
        supplier: "",
    });

    // Derived Data: CMV Analysis
    const productAnalysis = useMemo(() => {
        if (!products || !allRecipes) return [];

        return products.map(product => {
            const recipe = allRecipes.filter(r => r.product_id === product.id);
            const totalCost = recipe.reduce((acc, item) => {
                return acc + (item.quantity * (item.ingredient?.cost_per_unit || 0));
            }, 0);

            const margin = product.price > 0 ? ((product.price - totalCost) / product.price) * 100 : 0;
            const suggestedPrice = totalCost / (1 - (targetMargin / 100));

            return {
                ...product,
                totalCost,
                margin,
                suggestedPrice
            };
        });
    }, [products, allRecipes, targetMargin]);

    // Handlers
    const handleOpenIngDialog = (ing?: PricingIngredient) => {
        if (ing) {
            setSelectedIngredient(ing);
            setIngFormData({
                name: ing.name,
                unit: ing.unit,
                cost_per_unit: ing.cost_per_unit,
                supplier: ing.supplier || "",
            });
        } else {
            setSelectedIngredient(null);
            setIngFormData({ name: "", unit: "", cost_per_unit: 0, supplier: "" });
        }
        setIsIngredientDialogOpen(true);
    };

    const handleSaveIngredient = async () => {
        if (selectedIngredient) {
            await updateIng.mutateAsync({ id: selectedIngredient.id, ...ingFormData });
        } else {
            await createIng.mutateAsync(ingFormData);
        }
        setIsIngredientDialogOpen(false);
    };

    const handleLoadRecipe = (productId: string) => {
        setSelectedProductId(productId);
        const existing = allRecipes?.filter(r => r.product_id === productId) || [];
        setRecipeItems(existing.map(r => ({ ingredient_id: r.ingredient_id, quantity: r.quantity })));
        setActiveTab("recipes");
    };

    const handleSaveRecipe = async () => {
        await updateRecipe.mutateAsync({
            product_id: selectedProductId,
            ingredients: recipeItems
        });
    };

    const addIngredientToRecipe = () => {
        setRecipeItems([...recipeItems, { ingredient_id: "", quantity: 0 }]);
    };

    const removeIngredientFromRecipe = (index: number) => {
        setRecipeItems(recipeItems.filter((_, i) => i !== index));
    };

    const updateRecipeItem = (index: number, updates: any) => {
        const newItems = [...recipeItems];
        newItems[index] = { ...newItems[index], ...updates };
        setRecipeItems(newItems);
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="font-serif text-3xl font-bold">Precificação & CMV</h1>
                    <p className="text-muted-foreground">
                        Gestão de custos de insumos e formação de preços sugeridos.
                    </p>
                </div>
                <div className="flex items-center gap-4 bg-white p-2 rounded-lg border shadow-sm">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground">Margem Alvo</span>
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                value={targetMargin}
                                onChange={(e) => setTargetMargin(Number(e.target.value))}
                                className="h-8 w-16 text-center font-bold"
                            />
                            <span className="font-bold">%</span>
                        </div>
                    </div>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="bg-white border p-1 rounded-full w-fit">
                    <TabsTrigger value="analysis" className="rounded-full px-6">Análise CMV</TabsTrigger>
                    <TabsTrigger value="services" className="rounded-full px-6">Serviços</TabsTrigger>
                    <TabsTrigger value="recipes" className="rounded-full px-6">Fichas Técnicas</TabsTrigger>
                </TabsList>

                <TabsContent value="analysis" className="space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <div>
                                <CardTitle>Painel de Rentabilidade</CardTitle>
                                <CardDescription>Comparativo entre custo real, preço atual e sugestão com margem de {targetMargin}%.</CardDescription>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar produto..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-[250px] pl-8 bg-slate-50 border-none"
                                />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Produto</TableHead>
                                        <TableHead>Custo (CMV)</TableHead>
                                        <TableHead>Preço Atual</TableHead>
                                        <TableHead>Margem Atual</TableHead>
                                        <TableHead>Sugestão ({targetMargin}%)</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {productAnalysis
                                        .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
                                        .map((product) => (
                                            <TableRow key={product.id}>
                                                <TableCell className="font-medium text-slate-900">{product.name}</TableCell>
                                                <TableCell className="font-mono text-slate-600">{formatCurrency(product.totalCost)}</TableCell>
                                                <TableCell className="font-bold text-slate-900">{formatCurrency(product.price)}</TableCell>
                                                <TableCell>
                                                    <Badge variant={product.margin >= targetMargin ? "success" : product.margin > 0 ? "warning" : "destructive"}>
                                                        {product.margin.toFixed(1)}%
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-primary font-bold">{formatCurrency(product.suggestedPrice)}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="hover:bg-slate-100"
                                                        onClick={() => handleLoadRecipe(product.id)}
                                                    >
                                                        <Pencil className="h-4 w-4 mr-2" />
                                                        Ficha Técnica
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="services" className="space-y-4">
                    <div className="flex justify-end">
                        <Button onClick={() => handleOpenIngDialog()} className="bg-primary hover:bg-primary/90">
                            <Plus className="mr-2 h-4 w-4" />
                            Novo Serviço
                        </Button>
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Catálogo de Serviços</CardTitle>
                            <CardDescription>Base de preços para cálculos de CMV.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nome</TableHead>
                                        <TableHead>Unidade</TableHead>
                                        <TableHead>Custo/Un</TableHead>
                                        <TableHead>Fornecedor</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {ingredients?.map((ing) => (
                                        <TableRow key={ing.id}>
                                            <TableCell className="font-medium">{ing.name}</TableCell>
                                            <TableCell><Badge variant="outline">{ing.unit}</Badge></TableCell>
                                            <TableCell className="font-mono">{formatCurrency(ing.cost_per_unit)}</TableCell>
                                            <TableCell className="text-slate-500">{ing.supplier || "-"}</TableCell>
                                            <TableCell className="text-right flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleOpenIngDialog(ing)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => deleteIng.mutate(ing.id)} className="text-destructive">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="recipes" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card className="lg:col-span-1 border-primary/20 bg-slate-50/30">
                            <CardHeader>
                                <CardTitle className="text-lg">Selecionar Produto</CardTitle>
                                <CardDescription>Escolha um produto para carregar a ficha técnica.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Select value={selectedProductId} onValueChange={handleLoadRecipe}>
                                    <SelectTrigger className="bg-white">
                                        <SelectValue placeholder="Selecione um produto..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {products?.map(p => (
                                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {selectedProductId && (
                                    <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/10">
                                        <p className="text-sm font-bold text-primary mb-1">Cálculo Atual</p>
                                        <div className="flex justify-between items-end">
                                            <span className="text-2xl font-serif font-bold">
                                                {formatCurrency(recipeItems.reduce((acc, item) => {
                                                    const ing = ingredients?.find(i => i.id === item.ingredient_id);
                                                    return acc + (item.quantity * (ing?.cost_per_unit || 0));
                                                }, 0))}
                                            </span>
                                            <span className="text-xs text-muted-foreground mb-1">CMV Total</span>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="lg:col-span-2">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Composição da Receita</CardTitle>
                                    <CardDescription>Defina os itens e quantidades para este produto.</CardDescription>
                                </div>
                                {selectedProductId && (
                                    <Button variant="outline" size="sm" onClick={addIngredientToRecipe}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Adicionar Serviço
                                    </Button>
                                )}
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {!selectedProductId ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
                                        <Package className="h-12 w-12 mb-4 opacity-20" />
                                        <p>Selecione um produto para começar a editar sua receita.</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-3">
                                            {recipeItems.map((item, index) => (
                                                <div key={index} className="flex gap-4 items-end p-3 rounded-lg border bg-slate-50/50">
                                                    <div className="flex-1 space-y-1.5">
                                                        <Label className="text-[10px] uppercase font-bold text-slate-500">Serviço</Label>
                                                        <Select
                                                            value={item.ingredient_id}
                                                            onValueChange={(val) => updateRecipeItem(index, { ingredient_id: val })}
                                                        >
                                                            <SelectTrigger className="bg-white h-9">
                                                                <SelectValue placeholder="Escolha..." />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {ingredients?.map(ing => (
                                                                    <SelectItem key={ing.id} value={ing.id}>{ing.name} ({ing.unit})</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="w-24 space-y-1.5">
                                                        <Label className="text-[10px] uppercase font-bold text-slate-500">Qtd</Label>
                                                        <Input
                                                            type="number"
                                                            value={item.quantity}
                                                            onChange={(e) => updateRecipeItem(index, { quantity: Number(e.target.value) })}
                                                            className="h-9 bg-white"
                                                        />
                                                    </div>
                                                    <div className="w-24 space-y-1.5">
                                                        <Label className="text-[10px] uppercase font-bold text-slate-500">Custo</Label>
                                                        <div className="h-9 flex items-center px-3 rounded-md bg-slate-100 font-mono text-sm border overflow-hidden">
                                                            {formatCurrency(item.quantity * (ingredients?.find(i => i.id === item.ingredient_id)?.cost_per_unit || 0))}
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => removeIngredientFromRecipe(index)}
                                                        className="text-destructive hover:bg-destructive/10"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="pt-4 border-t flex justify-end">
                                            <Button onClick={handleSaveRecipe} disabled={updateRecipe.isPending} className="px-8">
                                                <Save className="mr-2 h-4 w-4" />
                                                {updateRecipe.isPending ? "Salvando..." : "Salvar Ficha Técnica"}
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Ingredient Dialog */}
            <Dialog open={isIngredientDialogOpen} onOpenChange={setIsIngredientDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{selectedIngredient ? "Editar" : "Novo"} Serviço</DialogTitle>
                        <DialogDescription>Cadastre a unidade e o custo unitário do serviço.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Nome do Serviço</Label>
                            <Input
                                value={ingFormData.name}
                                onChange={(e) => setIngFormData({ ...ingFormData, name: e.target.value })}
                                placeholder="Ex: Mão de obra, Logística, Embalagem"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Unidade</Label>
                                <Input
                                    value={ingFormData.unit}
                                    onChange={(e) => setIngFormData({ ...ingFormData, unit: e.target.value })}
                                    placeholder="Ex: kg, L, un"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Custo Unitário</Label>
                                <Input
                                    type="number"
                                    value={ingFormData.cost_per_unit}
                                    onChange={(e) => setIngFormData({ ...ingFormData, cost_per_unit: Number(e.target.value) })}
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Fornecedor (Opcional)</Label>
                            <Input
                                value={ingFormData.supplier}
                                onChange={(e) => setIngFormData({ ...ingFormData, supplier: e.target.value })}
                                placeholder="Nome do fornecedor"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsIngredientDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSaveIngredient} disabled={createIng.isPending || updateIng.isPending}>
                            {createIng.isPending || updateIng.isPending ? "Salvando..." : "Confirmar"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
