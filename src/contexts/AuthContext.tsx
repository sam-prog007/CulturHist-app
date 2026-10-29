import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { PREMIUM_ENABLED } from '@/lib/pricing';
import type { OAuthProvider } from '@/lib/authProviders';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null; session: Session | null }>;
  signInWithProvider: (provider: OAuthProvider) => Promise<{ error: AuthError | null }>;
  sendPasswordReset: (email: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  loading: boolean;
  isPremium: boolean;
  isAdmin: boolean;
  premiumUntil: string | null;
  checkSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [premiumUntil, setPremiumUntil] = useState<string | null>(null);

  // Takes the session explicitly: callers inside the auth listener must not
  // rely on the `session` state, which is still stale at that point.
  const refreshSubscription = async (currentSession: Session | null) => {
    if (!currentSession || !PREMIUM_ENABLED) return;

    try {
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${currentSession.access_token}`
        }
      });
      
      if (error) {
        console.error('Error checking subscription:', error);
        return;
      }
      
      setIsPremium(data?.subscribed || false);
      setPremiumUntil(data?.subscription_end || null);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const checkSubscription = () => refreshSubscription(session);

  const refreshAdminRole = async (userId: string) => {
    const { data, error } = await supabase.rpc('has_role', { _user_id: userId, _role: 'admin' });
    if (error) {
      console.error('Error checking admin role:', error);
    }
    setIsAdmin(!error && data === true);
  };

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!mounted) return;
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);
        
        // Check subscription when user logs in. Deferred so no Supabase call
        // runs inside the auth callback (supabase-js can deadlock otherwise).
        if (currentSession?.user) {
          setTimeout(() => {
            refreshSubscription(currentSession);
            refreshAdminRole(currentSession.user.id);
          }, 0);
        } else {
          setIsPremium(false);
          setIsAdmin(false);
          setPremiumUntil(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (!mounted) return;
      
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
      
      if (currentSession?.user) {
        refreshSubscription(currentSession);
        refreshAdminRole(currentSession.user.id);
      }
    }).catch((error) => {
      console.error('Error getting session:', error);
      if (mounted) {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  // Links in e-mails and provider redirects come back to the app, which sends
  // a new account on to the onboarding questions.
  const appUrl = `${window.location.origin}/app`;

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: appUrl },
    });
    return { error, session: data.session };
  };

  /** Leaves for Apple's or Google's sign-in page, which comes back to the app. */
  const signInWithProvider = async (provider: OAuthProvider) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: appUrl },
    });
    return { error };
  };

  const sendPasswordReset = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth?mode=update`,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, signIn, signUp, signInWithProvider, sendPasswordReset, signOut, loading, isPremium, isAdmin, premiumUntil, checkSubscription }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
