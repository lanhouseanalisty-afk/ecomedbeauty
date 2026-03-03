import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Capture hash and params BEFORE getSession (which might clear the hash from URL)
      const currentHash = window.location.hash;
      const params = new URLSearchParams(window.location.search);
      const next = params.get("next");

      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Auth error:", error.message);
        navigate("/auth");
        return;
      }

      // Check if this is a password recovery flow
      if (currentHash && currentHash.includes("type=recovery")) {
        navigate("/update-password");
        return;
      }

      if (next) {
        navigate(next);
        return;
      }

      navigate("/");
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-50/50 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-medium text-slate-500 animate-pulse">Finalizando autenticação...</p>
      </div>
    </div>
  );
}
