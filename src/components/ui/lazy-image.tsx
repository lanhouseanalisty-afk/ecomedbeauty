import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt: string;
    className?: string;
    placeholder?: React.ReactNode;
}

export const LazyImage: React.FC<LazyImageProps> = ({
    src,
    alt,
    className,
    placeholder,
    ...props
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsInView(true);
                        observer.disconnect();
                    }
                });
            },
            {
                rootMargin: '50px', // Start loading when 50px away from viewport
            }
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => {
            observer.disconnect();
        };
    }, []);

    return (
        <div className={cn("relative overflow-hidden", className)}>
            {!isLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                    {placeholder || <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />}
                </div>
            )}
            <img
                ref={imgRef}
                src={isInView ? src : undefined} // Only set src when in view
                alt={alt}
                className={cn(
                    "h-full w-full object-cover transition-opacity duration-300",
                    isLoaded ? "opacity-100" : "opacity-0"
                )}
                onLoad={() => setIsLoaded(true)}
                {...props}
            />
        </div>
    );
};
