import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Crown, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PREMIUM_PRICES } from '@/lib/pricing';

interface PremiumButtonProps {
  variant?: 'default' | 'card';
}

export default function PremiumButton({ variant = 'default' }: PremiumButtonProps) {
  const [loading, setLoading] = useState(false);
  const { isPremium, premiumUntil, checkSubscription } = useAuth();

  const handleSubscribe = async (priceId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId }
      });
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
        toast.success('Redirection vers le paiement...');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast.error('Erreur lors de la création du paiement');
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
        toast.success('Redirection vers la gestion...');
      }
    } catch (error) {
      console.error('Error opening portal:', error);
      toast.error('Erreur lors de l\'ouverture du portail');
    } finally {
      setLoading(false);
    }
  };

  if (variant === 'card') {
    return (
      <Card className="card-shadow hover-scale smooth-transition">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-accent" />
                CulturHist +
              </CardTitle>
              <CardDescription>
                Accédez à toutes les fonctionnalités premium
              </CardDescription>
            </div>
            {isPremium && (
              <Badge variant="secondary" className="bg-accent/10 text-accent">
                Actif
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isPremium ? (
            <>
              <p className="text-sm text-muted-foreground">
                Votre abonnement est actif jusqu'au{' '}
                {premiumUntil ? new Date(premiumUntil).toLocaleDateString('fr-FR') : 'N/A'}
              </p>
              <Button 
                onClick={handleManageSubscription}
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Chargement...
                  </>
                ) : (
                  <>
                    Gérer mon abonnement
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-accent" />
                  Contenus exclusifs
                </li>
                <li className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-accent" />
                  Quiz illimités
                </li>
                <li className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-accent" />
                  Statistiques avancées
                </li>
              </ul>
              <div className="pt-2 space-y-3">
                <div>
                  <p className="text-2xl font-bold mb-1">1,99€<span className="text-sm font-normal text-muted-foreground">/mois</span></p>
                  <Button 
                    onClick={() => handleSubscribe(PREMIUM_PRICES.monthly)}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Chargement...
                      </>
                    ) : (
                      <>
                        <Crown className="mr-2 h-4 w-4" />
                        Mensuel
                      </>
                    )}
                  </Button>
                </div>
                <div>
                  <p className="text-2xl font-bold mb-1">12,99€<span className="text-sm font-normal text-muted-foreground">/an</span></p>
                  <p className="text-xs text-accent mb-2">Économisez 35% !</p>
                  <Button 
                    onClick={() => handleSubscribe(PREMIUM_PRICES.yearly)}
                    disabled={loading}
                    variant="outline"
                    className="w-full border-accent text-accent hover:bg-accent/10"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Chargement...
                      </>
                    ) : (
                      <>
                        <Crown className="mr-2 h-4 w-4" />
                        Annuel
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  if (isPremium) {
    return (
      <Button 
        onClick={handleManageSubscription}
        disabled={loading}
        variant="outline"
        className="gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Chargement...
          </>
        ) : (
          <>
            <Crown className="h-4 w-4 text-accent" />
            Gérer Premium
          </>
        )}
      </Button>
    );
  }

  return (
    <div className="flex gap-2">
      <Button 
        onClick={() => handleSubscribe(PREMIUM_PRICES.monthly)}
        disabled={loading}
        className="gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Chargement...
          </>
        ) : (
          <>
            <Crown className="h-4 w-4" />
            Mensuel 1,99€
          </>
        )}
      </Button>
      <Button 
        onClick={() => handleSubscribe(PREMIUM_PRICES.yearly)}
        disabled={loading}
        variant="outline"
        className="gap-2 border-accent text-accent hover:bg-accent/10"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Chargement...
          </>
        ) : (
          <>
            <Crown className="h-4 w-4" />
            Annuel 12,99€
          </>
        )}
      </Button>
    </div>
  );
}
