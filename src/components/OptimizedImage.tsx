import { useImageOptimization } from '@/hooks/useImageOptimization';
import { Skeleton } from '@/components/ui/skeleton';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
}

/**
 * Composant d'image optimisé avec lazy loading et fallback
 */
export const OptimizedImage = ({ 
  src, 
  alt, 
  className = '', 
  placeholder 
}: OptimizedImageProps) => {
  const { imageSrc, isLoading, error } = useImageOptimization(src, placeholder);

  if (isLoading) {
    return <Skeleton className={className} />;
  }

  if (error && !placeholder) {
    return (
      <div className={`${className} flex items-center justify-center bg-muted`}>
        <span className="text-xs text-muted-foreground">Image indisponible</span>
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
    />
  );
};
