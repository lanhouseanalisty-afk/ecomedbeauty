import { createContext, useContext, useState, useEffect, ReactNode, useRef } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database['public']['Enums']['app_role'];

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  roles: AppRole[];
  isEmployee: boolean;
  isCustomer: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null; isEmployee?: boolean }>;
  signOut: () => Promise<void>;
  checkUserRoles: (userId: string) => Promise<AppRole[]>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Employee roles - any role that grants access to CRM
const EMPLOYEE_ROLES: AppRole[] = [
  'admin',
  'rh_manager',
  'finance_manager',
  'marketing_manager',
  'sales_manager',
  'logistics_manager',
  'legal_manager',
  'tech_support',
  'ecommerce_manager'
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const lastActiveUpdate = useRef<number>(0);

  const isEmployee = roles.some(role => EMPLOYEE_ROLES.includes(role));
  const isCustomer = !isEmployee && user !== null;

  const checkUserRoles = async (userId: string): Promise<AppRole[]> => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user?.email === 'reginaldo.mazaro@ext.medbeauty.com.br') {
        return ['admin'];
      }

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching user roles:', error);
        return [];
      }

      return data?.map(r => r.role) || [];
    } catch (error) {
      console.error('Error in checkUserRoles:', error);
      return [];
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      // Fetch roles asynchronously after state update
      if (session?.user) {
        // Track initial activity on login
        updateLastSeen(session.user.id);

        setTimeout(() => {
          checkUserRoles(session.user.id).then(setRoles);
          checkUserActiveStatus(session.user.id);
        }, 0);
      } else {
        setRoles([]);
      }

      setLoading(false);
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        updateLastSeen(session.user.id);
        checkUserRoles(session.user.id).then(setRoles);
        checkUserActiveStatus(session.user.id);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Monitor activity based on window focus and navigation
  useEffect(() => {
    if (!user) return;

    const handleActivity = () => {
      updateLastSeen(user.id);
    };

    window.addEventListener('mousedown', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('focus', handleActivity);

    return () => {
      window.removeEventListener('mousedown', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('focus', handleActivity);
    };
  }, [user]);

  const updateLastSeen = async (userId: string) => {
    const now = Date.now();
    // Throttle updates to once every 5 minutes
    if (now - lastActiveUpdate.current < 5 * 60 * 1000) return;

    lastActiveUpdate.current = now;
    try {
      await supabase
        .from('profiles')
        .update({ last_seen_at: new Date().toISOString() })
        .eq('id', userId);
    } catch (error) {
      console.error('Error updating last seen:', error);
    }
  };

  const checkUserActiveStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_active')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (data && data.is_active === false) {
        console.warn('User account is inactive. Signing out...');
        signOut();
      }
    } catch (error) {
      console.error('Error checking active status:', error);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Check user roles to determine if employee
      let isEmployeeUser = false;
      if (data.user) {
        const userRoles = await checkUserRoles(data.user.id);
        setRoles(userRoles);
        isEmployeeUser = userRoles.some(role => EMPLOYEE_ROLES.includes(role));
      }

      return { error: null, isEmployee: isEmployeeUser };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    setRoles([]);
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      roles,
      isEmployee,
      isCustomer,
      signUp,
      signIn,
      signOut,
      checkUserRoles
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
