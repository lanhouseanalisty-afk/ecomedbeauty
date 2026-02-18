import * as React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface CurrencyInputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
    onValueChange: (value: number | undefined) => void
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
    ({ className, value, onValueChange, ...props }, ref) => {
        const [displayValue, setDisplayValue] = React.useState("")

        React.useEffect(() => {
            if (value !== undefined && value !== null) {
                const numberValue = typeof value === 'string' ? parseFloat(value) : value;
                if (!isNaN(numberValue)) {
                    setDisplayValue(new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numberValue));
                }
            } else {
                setDisplayValue("");
            }
        }, [value]);


        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const rawValue = e.target.value.replace(/\D/g, "")

            if (rawValue === "") {
                setDisplayValue("");
                onValueChange(undefined);
                return;
            }

            const numberValue = parseInt(rawValue) / 100;
            setDisplayValue(new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numberValue));
            onValueChange(numberValue);
        }

        return (
            <Input
                type="text"
                inputMode="numeric"
                className={cn("", className)}
                value={displayValue}
                onChange={handleChange}
                ref={ref}
                {...props}
            />
        )
    }
)
CurrencyInput.displayName = "CurrencyInput"

export { CurrencyInput }
