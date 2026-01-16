import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Truck, MapPin, Clock, CheckCircle } from "lucide-react";

interface ShippingOption {
  id: string;
  name: string;
  price: number;
  days: string;
  icon: typeof Truck;
}

interface ShippingCalculatorProps {
  cartTotal: number;
  onSelectShipping: (option: ShippingOption | null) => void;
  selectedOption: ShippingOption | null;
}

export function ShippingCalculator({
  cartTotal,
  onSelectShipping,
  selectedOption,
}: ShippingCalculatorProps) {
  const [cep, setCep] = useState("");
  const [isCalculating, setIsCalculating] = useState(false);
  const [options, setOptions] = useState<ShippingOption[] | null>(null);

  const formatCep = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 5) return numbers;
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
  };

  const handleCalculate = async () => {
    if (cep.replace(/\D/g, "").length !== 8) return;

    setIsCalculating(true);
    
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1000));

    const isFreeShipping = cartTotal >= 500;

    setOptions([
      {
        id: "pac",
        name: "PAC",
        price: isFreeShipping ? 0 : 25,
        days: "8-12 dias úteis",
        icon: Truck,
      },
      {
        id: "sedex",
        name: "SEDEX",
        price: isFreeShipping ? 0 : 45,
        days: "3-5 dias úteis",
        icon: Truck,
      },
      {
        id: "express",
        name: "SEDEX 10",
        price: isFreeShipping ? 15 : 65,
        days: "1-2 dias úteis",
        icon: Truck,
      },
    ]);

    setIsCalculating(false);
  };

  const formatPrice = (price: number) => {
    if (price === 0) return "Grátis";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <MapPin className="h-4 w-4 text-primary" />
        Calcular frete
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="00000-000"
          value={cep}
          onChange={(e) => setCep(formatCep(e.target.value))}
          maxLength={9}
        />
        <Button
          onClick={handleCalculate}
          disabled={isCalculating || cep.replace(/\D/g, "").length !== 8}
        >
          {isCalculating ? "..." : "Calcular"}
        </Button>
      </div>

      {options && (
        <div className="space-y-2 animate-fade-in-up">
          {options.map((option) => (
            <button
              key={option.id}
              onClick={() => onSelectShipping(option)}
              className={`flex w-full items-center justify-between rounded-lg border p-3 transition-all ${
                selectedOption?.id === option.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`rounded-full p-2 ${
                  selectedOption?.id === option.id ? "bg-primary/10" : "bg-muted"
                }`}>
                  <Truck className="h-4 w-4 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-foreground">{option.name}</p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {option.days}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`font-semibold ${
                  option.price === 0 ? "text-success" : "text-foreground"
                }`}>
                  {formatPrice(option.price)}
                </span>
                {selectedOption?.id === option.id && (
                  <CheckCircle className="h-4 w-4 text-primary" />
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {cartTotal >= 500 && (
        <p className="flex items-center gap-2 text-sm text-success">
          <CheckCircle className="h-4 w-4" />
          Você ganhou frete grátis!
        </p>
      )}
    </div>
  );
}
