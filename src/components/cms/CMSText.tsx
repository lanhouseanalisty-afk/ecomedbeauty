import { useState, useEffect, useRef } from "react";
import { useCMS } from "@/contexts/CMSContext";
import { cn } from "@/lib/utils";
import { Pencil } from "lucide-react";

interface CMSTextProps {
    path: string; // e.g. "hero.titleStart"
    className?: string;
    multiline?: boolean;
    as?: any; // Component type (h1, p, span, etc)
}

export function CMSText({ path, className, multiline = false, as: Component = "span" }: CMSTextProps) {
    const { content, updateContent, isEditing } = useCMS();
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

    // Resolve value from paty
    const keys = path.split('.');
    let value = content as any;
    for (const key of keys) {
        value = value?.[key];
    }

    const [localValue, setLocalValue] = useState(value as string);

    // Sync with global content when it changes (unless focused)
    useEffect(() => {
        if (!isFocused) {
            setLocalValue(value as string);
        }
    }, [value, isFocused]);

    useEffect(() => {
        if (isFocused && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isFocused]);

    const handleBlur = () => {
        setIsFocused(false);
        updateContent(path, localValue);
    };

    if (isEditing && isFocused) {
        if (multiline) {
            return (
                <textarea
                    ref={inputRef as any}
                    value={localValue}
                    onChange={(e) => setLocalValue(e.target.value)}
                    onBlur={handleBlur}
                    className={cn("bg-white text-black p-1 rounded border border-blue-500 w-full min-h-[1em] outline-none z-50 relative", className)}
                    style={{ fontSize: 'inherit', fontWeight: 'inherit', lineHeight: 'inherit' }}
                />
            );
        }
        return (
            <input
                ref={inputRef as any}
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={(e) => { if (e.key === 'Enter') handleBlur(); }}
                className={cn("bg-white text-black px-1 rounded border border-blue-500 outline-none z-50 relative min-w-[1em]", className)}
                style={{ width: `${Math.max(localValue.length, 3)}ch`, fontSize: 'inherit', fontWeight: 'inherit', lineHeight: 'inherit' }}
            />
        );
    }

    if (isEditing) {
        return (
            <Component
                onClick={(e: any) => { e.preventDefault(); e.stopPropagation(); setIsFocused(true); }}
                className={cn(
                    "cursor-pointer hover:outline hover:outline-2 hover:outline-blue-500 hover:bg-blue-50/20 rounded px-1 -mx-1 transition-all relative group inline-block",
                    className
                )}
                title={`Editar ${path}`}
            >
                {localValue}
                <Pencil className="w-3 h-3 absolute -top-3 -right-3 opacity-0 group-hover:opacity-100 text-blue-500 bg-white rounded-full p-0.5 shadow-sm z-50 pointer-events-none" />
            </Component>
        );
    }

    return <Component className={className}>{localValue}</Component>;
}
