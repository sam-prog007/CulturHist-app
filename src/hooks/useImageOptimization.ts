import { useState, useEffect } from 'react';

/**
 * Hook pour optimiser le chargement des images
 * Implémente le lazy loading et la gestion d'erreur
 */
export const useImageOptimization = (src: string, placeholder?: string) => {
  const [imageSrc, setImageSrc] = useState<string>(placeholder || '');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!src) {
      setIsLoading(false);
      setError(false);
      return;
    }

    let mounted = true;
    setIsLoading(true);
    setError(false);

    const img = new Image();
    
    const handleLoad = () => {
      if (mounted) {
        setImageSrc(src);
        setIsLoading(false);
      }
    };

    const handleError = () => {
      if (mounted) {
        setError(true);
        setIsLoading(false);
        if (placeholder) {
          setImageSrc(placeholder);
        }
      }
    };

    img.onload = handleLoad;
    img.onerror = handleError;
    img.src = src;

    return () => {
      mounted = false;
      img.onload = null;
      img.onerror = null;
    };
  }, [src, placeholder]);

  return { imageSrc, isLoading, error };
};
