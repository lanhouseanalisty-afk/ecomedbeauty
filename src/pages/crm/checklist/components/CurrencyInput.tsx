
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
    value?: number | string | null;
    onValueChange: (value: number) => void;
}

export function CurrencyInput({ value, onValueChange, className, ...props }: CurrencyInputProps) {
    const [displayValue, setDisplayValue] = useState("");

    useEffect(() => {
        if (value === undefined || value === null || value === "") {
            setDisplayValue("");
            return;
        }
        const num = typeof value === 'string' ? parseFloat(value) : value;
        if (!isNaN(num)) {
            setDisplayValue(formatCurrency(num));
        }
    }, [value]);

    const formatCurrency = (val: number) => {
        return val.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let rawValue = e.target.value.replace(/\D/g, ""); // Remove non-digits

        // Prevent excessive zeros at start
        if (rawValue.startsWith("00")) {
            rawValue = rawValue.substring(1);
        }

        // Logic: treat last 2 digits as decimals
        // 1 -> 0.01
        // 12 -> 0.12
        // 123 -> 1.23
        // 1234 -> 12.34

        const numValue = rawValue ? parseInt(rawValue, 10) / 100 : 0;

        if (rawValue === "") {
            setDisplayValue("");
            onValueChange(0); // Or handle null?
        } else {
            setDisplayValue(formatCurrency(numValue));
            onValueChange(numValue);
        }
    };

    return (
        <Input
            {...props}
            type="text"
            inputMode="numeric"
            value={displayValue}
            onChange={handleChange}
            className={cn("text-right", className)}
        />
    );
}
