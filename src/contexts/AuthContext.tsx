import { createContext, useContext, useState, useEffect, ReactNode, useRef } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { analytics } from "@/lib/analytics";

type AppRole = Database["public"]["Enums"]["app_role"];

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  roles: AppRole[];
  permissions: string[];
  departmentId: string | null;
  departmentModule: string | null;
  isEmployee: boolean;
  isCustomer: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null; isEmployee?: boolean }>;
  signOut: () => Promise<void>;
  checkUserRoles: (userId: string, email?: string) => Promise<{ roles: AppRole[]; permissions: string[] }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const EMPLOYEE_ROLES: string[] = [
  "admin", "manager", "user", "tech_digital", "analyst", "rh_manager", "finance_manager",
  "marketing_manager", "sales_manager", "logistics_manager", "legal_manager",
  "tech_support", "ecommerce_manager", "rh", "financeiro", "marketing",
  "comercial", "logistica", "juridico", "tech", "ecommerce", "compras",
  "manutencao", "tecnico", "editor", "auditor", "viewer", "operator", "technician"
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [departmentId, setDepartmentId] = useState<string | null>(null);
  const [departmentModule, setDepartmentModule] = useState<string | null>(null);
  const [employeeRecordId, setEmployeeRecordId] = useState<string | null>(null);
  const lastActiveUpdate = useRef<number>(0);

  const isEmployee = roles.some(role => EMPLOYEE_ROLES.includes(role)) || roles.includes("admin") || !!departmentId || !!employeeRecordId;
  const isCustomer = !isEmployee && user !== null;

  async function fetchDepartmentInfo(userId: string, email?: string): Promise<{ empId: string | null; id: string | null; module: string | null }> {
    try {
      const getQuery = () => supabase
        .from("employees")
        .select(`
          id,
          department_id,
          departments (
            module_slug
          )
        `);

      const formatData = (data: any) => {
        const deptData = Array.isArray(data.departments) ? data.departments[0] : data.departments;
        return {
          empId: data.id,
          id: data.department_id,
          module: (deptData as any)?.module_slug || null
        };
      };

      // Try by userId first
      if (userId) {
        const { data } = await getQuery().eq("user_id", userId).maybeSingle();
        if (data) return formatData(data);
      }

      // Fallback to email
      if (email) {
        const { data } = await getQuery().eq("email", email).maybeSingle();
        if (data) return formatData(data);
      }

      return { empId: null, id: null, module: null };
    } catch (error) {
      return { empId: null, id: null, module: null };
    }
  }

  async function checkUserRoles(userId: string, email?: string): Promise<{ roles: AppRole[]; permissions: string[] }> {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role, permissions")
        .eq("user_id", userId);

      if (error) return { roles: [], permissions: [] };
      return {
        roles: data?.map(r => r.role as AppRole) || [],
        permissions: data?.[0]?.permissions || []
      };
    } catch (error) {
      return { roles: [], permissions: [] };
    }
  }

  async function updateLastSeen(userId: string) {
    const now = Date.now();
    if (now - lastActiveUpdate.current < 300000) return;
    lastActiveUpdate.current = now;
    try {
      await supabase.from("profiles").update({ last_seen_at: new Date().toISOString() }).eq("id", userId);
    } catch (error) {
      console.error("Error updating last seen:", error);
    }
  }

  async function checkUserActiveStatus(userId: string) {
    try {
      const { data } = await supabase.from("employees").select("status").eq("user_id", userId).maybeSingle();
      if (data && data.status === "inactive") signOut();
    } catch (error) {
      console.error("Error checking user active status:", error);
    }
  }

  useEffect(() => {
    let mounted = true;
    const failsafe = setTimeout(() => {
      if (mounted && loading) setLoading(false);
    }, 10000);

    const loadMetadata = async (userId: string, email?: string) => {
      try {
        const [authInfo, deptInfo] = await Promise.all([
          Promise.race([
            checkUserRoles(userId, email),
            new Promise<{ roles: AppRole[]; permissions: string[] }>((res) => setTimeout(() => res({ roles: [], permissions: [] }), 5000))
          ]),
          Promise.race([
            fetchDepartmentInfo(userId, email),
            new Promise<{ empId: any; id: any; module: any }>((res) => setTimeout(() => res({ empId: null, id: null, module: null }), 5000))
          ])
        ]);

        if (mounted) {
          setRoles(authInfo.roles);
          setPermissions(authInfo.permissions);
          setDepartmentId(deptInfo.id);
          setDepartmentModule(deptInfo.module);
          setEmployeeRecordId(deptInfo.empId);
          checkUserActiveStatus(userId);
          if (userId) analytics.identify(userId, { email, role: authInfo.roles.join(","), permissions: authInfo.permissions.join(",") });
        }
      } catch (err) {
        console.error("[AuthContext] Error loading metadata:", err);
      }
    };

    const initialize = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          updateLastSeen(session.user.id);
          await loadMetadata(session.user.id, session.user.email);
        }
      } catch (err) {
        console.error('[AuthContext] Initialization error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      console.log('[AuthContext] Auth state change:', event);
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
          await loadMetadata(session.user.id, session.user.email);
          if (mounted) setLoading(false);
        } else if (event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
          // If metadata is already loaded, don't set loading to false here, just let it be.
          // If it isn't loaded, trigger a reload to prevent incomplete state but don't disable loading yet.
          if (roles.length === 0) {
            await loadMetadata(session.user.id, session.user.email);
            if (mounted) setLoading(false);
          }
        }
      } else {
        setRoles([]);
        setPermissions([]);
        setDepartmentId(null);
        setDepartmentModule(null);
        setEmployeeRecordId(null);
        if (mounted) setLoading(false);
      }
    });

    // Extra safety: Verify if metadata needs to be reloaded when user is present but roles are empty
    if (user && roles.length === 0 && !loading) {
      console.log('[AuthContext] User present but no roles, triggering auto-load');
      setLoading(true);
      loadMetadata(user.id, user.email).then(() => {
        if (mounted) setLoading(false);
      });
    }

    return () => {
      mounted = false;
      clearTimeout(failsafe);
      subscription.unsubscribe();
    };
  }, [user?.id, roles.length]); // Add roles.length to catch empty roles after loading

  const signUp = async (email: string, password: string, fullName: string, metadata: any = {}) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            ...metadata
          }
        }
      });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      let isEmp = false;
      if (data.user) {
        const authInfo = await checkUserRoles(data.user.id, data.user.email);
        setRoles(authInfo.roles);
        setPermissions(authInfo.permissions);
        const { empId, id, module } = await fetchDepartmentInfo(data.user.id, data.user.email || undefined);
        setDepartmentId(id);
        setDepartmentModule(module);
        setEmployeeRecordId(empId);
        isEmp = authInfo.roles.some(role => EMPLOYEE_ROLES.includes(role)) || authInfo.roles.includes("admin") || !!id || !!empId;
      }
      return { error: null, isEmployee: isEmp };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    setRoles([]);
    setPermissions([]);
    setDepartmentId(null);
    setDepartmentModule(null);
    setEmployeeRecordId(null);
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{
      user, session, loading, roles, permissions, departmentId, departmentModule,
      isEmployee, isCustomer, signUp, signIn, signOut, checkUserRoles
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
