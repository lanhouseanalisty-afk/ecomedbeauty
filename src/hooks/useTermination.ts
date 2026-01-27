import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Helper function to create notification
async function createNotification(
    processId: string,
    targetStep: string,
    targetDepartment: string,
    employeeName: string,
    targetEmail?: string | null
) {
    try {
        // 1. Create notification record
        const { data: notification, error } = await supabase
            .from('termination_notifications')
            .insert({
                termination_process_id: processId,
                target_step: targetStep,
                target_email: targetEmail,
                metadata: {
                    employee_name: employeeName,
                    department: targetDepartment
                }
            })
            .select()
            .single();

        if (error) {
            console.error("Error creating notification:", error);
            return false;
        }

        // 2. Invoke Edge Function to send email
        if (notification) {
            // Note: In a real scenario, we might default targetEmail if not provided, 
            // or the Edge Function handles logic based on Department.
            // For now we assume the caller provides it or the Edge Function fetches it.

            const baseUrl = window.location.origin;

            const { error: emailError } = await supabase.functions.invoke('send-termination-notification', {
                body: {
                    email: targetEmail,
                    employeeName,
                    department: targetDepartment,
                    targetStep,
                    baseUrl,
                    processId
                }
            });

            if (emailError) {
                console.error('Error sending email:', emailError);
            } else {
                await supabase
                    .from('termination_notifications')
                    .update({ status: 'sent', sent_at: new Date().toISOString() })
                    .eq('id', notification.id);
            }
        }

        return true;
    } catch (e) {
        console.error("Notification exception:", e);
        return false;
    }
}

export type TerminationStep = 'rh' | 'gestor' | 'ti' | 'dp' | 'concluido';

export interface TerminationProcess {
    id: string;
    employee_id: string;
    employee_name: string;
    department: string;
    position: string;
    manager_name: string;
    current_step: TerminationStep;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';

    // RH Data
    notice_date: string;
    last_day: string;
    reason: string;
    notice_type: string;
    hr_observations: string | null;
    equipment_list: string | null;  // Lista importada da admissão

    // Manager Data
    equipment_returned: 'Sim' | 'Nao' | 'Parcial' | null;
    pending_items: string | null;
    backup_done: boolean | null;
    project_transferred: boolean | null;
    access_keys_returned: boolean | null;
    manager_observations: string | null;

    // TI Data
    ad_blocked: boolean | null;
    email_blocked: boolean | null;
    vpn_revoked: boolean | null;
    licenses_removed: boolean | null;
    equipment_collected: boolean | null;
    ti_observations: string | null;

    // DP Data
    exam_status: string | null;
    exam_date: string | null;
    severance_calc_status: string | null;
    payment_date: string | null;
    ctps_lowered: boolean | null;
    esocial_sent: boolean | null;
    final_observations: string | null;

    created_at: string;
    updated_at: string;
}

export function useTerminationProcesses(department?: string, fetchAll?: boolean) {
    const queryClient = useQueryClient();

    const { data: processes, isLoading, error } = useQuery({
        queryKey: ['termination-processes', department, fetchAll],
        queryFn: async () => {
            let query = supabase
                .from('termination_processes')
                .select('*')
                .order('created_at', { ascending: false });

            // Filter by department if needed (omitted for now to see all for dev)
            // if (department && !fetchAll) { query = query.eq('department', department); }

            const { data, error } = await query;
            if (error) {
                console.error("Error fetching termination processes:", error);
                // Return empty array on error to avoid breaking UI during dev if table missing
                return [];
            }
            return data as TerminationProcess[];
        },
    });

    // 1. RH Starts Process
    // 1. RH Starts Process
    const createTermination = useMutation({
        mutationFn: async (data: any) => {
            const { data: user } = await supabase.auth.getUser();

            // Mapeamento Form (PT) -> DB (EN)
            const dbData = {
                employee_id: data.funcionario_id,
                employee_name: data.nome_completo,
                department: data.departamento,
                position: data.cargo,
                notice_date: data.data_comunicado,
                last_day: data.ultimo_dia,
                reason: data.motivo_desligamento,
                notice_type: data.tipo_aviso,
                hr_observations: data.observacoes_rh,
                equipment_list: data.lista_equipamentos,
                current_step: 'gestor',
                status: 'in_progress',
                created_by: user?.user?.id
            };

            const { data: result, error } = await supabase
                .from('termination_processes')
                .insert(dbData)
                .select()
                .single();

            if (error) throw error;

            await createNotification(result.id, 'gestor', data.departamento, data.nome_completo);

            return result;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['termination-processes'] });
            toast.success('Desligamento iniciado. Enviado para o Gestor.');
        },
        onError: (err: any) => {
            console.error(err);
            toast.error('Erro ao iniciar desligamento: ' + err.message);
        }
    });

    // 2. Manager Completes Step
    const updateManagerStep = useMutation({
        mutationFn: async ({ id, data }: { id: string, data: any }) => {

            // Mapeamento Gestor -> DB
            const dbUpdate = {
                equipment_returned: data.equipamentos_devolvidos,
                pending_items: data.lista_pendencias,
                backup_done: data.backup_realizado === 'Sim',
                project_transferred: data.projeto_transferido === 'Sim',
                access_keys_returned: data.chave_acesso_entregue === 'Sim',
                manager_observations: data.observacoes_gestor,
                current_step: 'ti'
            };

            const { data: result, error } = await supabase
                .from('termination_processes')
                .update(dbUpdate)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            await createNotification(result.id, 'ti', 'TI', result.employee_name);

            return result;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['termination-processes'] });
            toast.success('Checklist do Gestor salvo. Enviado para TI.');
        },
        onError: (err: any) => {
            toast.error('Erro ao salvar checklist: ' + err.message);
        }
    });

    // 3. TI Completes Step
    const updateTIStep = useMutation({
        mutationFn: async ({ id, data }: { id: string, data: any }) => {

            // Mapeamento TI -> DB
            const dbUpdate = {
                ad_blocked: data.conta_ad_bloqueada,
                email_blocked: data.email_bloqueado,
                vpn_revoked: data.acesso_vpn_revogado,
                licenses_removed: data.licencas_removidas,
                equipment_collected: data.equipamentos_recolhidos,
                ti_observations: data.observacoes_ti,
                current_step: 'dp'
            };

            const { data: result, error } = await supabase
                .from('termination_processes')
                .update(dbUpdate)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            await createNotification(result.id, 'dp', 'DP', result.employee_name);

            return result;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['termination-processes'] });
            toast.success('Bloqueios de TI confirmados. Enviado para DP.');
        },
        onError: (err: any) => {
            toast.error('Erro ao confirmar bloqueios: ' + err.message);
        }
    });

    // 4. DP Completes Process
    const completeTermination = useMutation({
        mutationFn: async ({ id, data }: { id: string, data: any }) => {

            // Mapeamento DP -> DB
            const dbUpdate = {
                exam_status: data.exame_demissional,
                exam_date: data.data_exame || null,
                severance_calc_status: data.calculo_rescisao,
                payment_date: data.pagamento_agendado || null,
                ctps_lowered: data.baixa_ctps,
                esocial_sent: data.envio_esocial,
                final_observations: data.observacoes_final,
                current_step: 'concluido',
                status: 'completed'
            };

            const { data: result, error } = await supabase
                .from('termination_processes')
                .update(dbUpdate)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return result;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['termination-processes'] });
            toast.success('Processo de desligamento FINALIZADO com sucesso.');
        },
        onError: (err: any) => {
            toast.error('Erro ao finalizar desligamento: ' + err.message);
        }
    });

    return {
        processes,
        isLoading,
        createTermination,
        updateManagerStep,
        updateTIStep,
        completeTermination
    };
}
