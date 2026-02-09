import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { AdmissaoFlow } from "./components/AdmissaoFlow";
import { DemissaoFlow } from "./components/DemissaoFlow";
import type { Database } from "@/integrations/supabase/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Checklist = any; // Simplify for now

export default function ChecklistDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [checklist, setChecklist] = useState<Checklist | null>(null);
    const [loading, setLoading] = useState(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const fetchChecklist = async () => {
            if (!id) return;

            const { data, error } = await supabase
                .from('checklists')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                console.error("Error fetching checklist:", error);
                navigate('/crm/checklist'); // Redirect on error
            }

            if (data) {
                setChecklist(data);
            }
            setLoading(false);
        };

        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // Fetch user role from public.users or department_members
                // For now, let's assume specific email logic or metadata for role.
                // In a real scenario, you'd join with your users table.
                // Mocking role for now based on email or setting a default.
                // If you have a profiles table, fetch it here.

                // Simulating Role based on "mock" logic or simple user metadata
                // To make it easy for testing, I'll default to 'Adm' effectively allowing everything
                // or try to fetch from department_members if possible.

                const { data: member } = await supabase
                    .from('department_members')
                    .select('role, department:departments(code)')
                    .eq('user_id', user.id)
                    .single();

                let derivedRole = 'Colaborador';
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const deptCode = (member?.department as any)?.code;

                if (deptCode === 'rh') derivedRole = 'RH';
                else if (deptCode === 'ti') derivedRole = 'TI';
                else if (member?.role === 'manager') derivedRole = 'Gestor';

                // Override for Development/Testing:
                derivedRole = 'Adm';

                setUser({ ...user, role: derivedRole });
            }
        };

        fetchUser();
        fetchChecklist();
    }, [id, navigate]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleUpdate = async (updatedData: any) => {
        if (!checklist) return;

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { error } = await supabase
            .from('checklists')
            .update({
                data: updatedData,
                updated_at: new Date().toISOString()
            })
            .eq('id', checklist.id);

        if (error) {
            console.error("Error updating checklist:", error);
            alert("Erro ao salvar progresso.");
        } else {
            setChecklist({ ...checklist, data: updatedData });
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Carregando processo...</div>;
    }

    if (!checklist) {
        return <div className="flex items-center justify-center h-screen">Checklist não encontrado.</div>;
    }

    return (
        <div className="container mx-auto p-8 space-y-6">
            <Button variant="ghost" onClick={() => navigate('/crm/checklist')} className="mb-4 pl-0 hover:pl-2 transition-all">
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Dashboard
            </Button>

            {checklist.type === 'admissao' && (
                <AdmissaoFlow
                    data={checklist.data}
                    onUpdate={handleUpdate}
                    user={user}
                />
            )}

            {checklist.type === 'demissao' && (
                <DemissaoFlow
                    data={checklist.data}
                    onUpdate={handleUpdate}
                    user={user}
                />
            )}
        </div>
    );
}
