import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Helper function to create notification and send email
async function createNotificationAndSendEmail(
  admissionProcessId: string,
  targetStep: string,
  targetDepartment: string,
  employeeName: string,
  targetEmail?: string | null,
  position?: string,
  managerName?: string
) {
  // Create notification in database
  const { data: notification, error: notifError } = await supabase
    .from('admission_notifications')
    .insert({
      admission_process_id: admissionProcessId,
      target_step: targetStep,
      target_email: targetEmail,
      target_department: targetDepartment,
      notification_type: 'step_pending',
      status: 'pending',
      metadata: {
        employee_name: employeeName,
        position,
        manager_name: managerName,
      },
    })
    .select()
    .single();

  if (notifError) {
    console.error('Error creating notification:', notifError);
    return;
  }

  // If we have an email, try to send it
  if (targetEmail && notification) {
    try {
      const baseUrl = window.location.origin;

      const { error: emailError } = await supabase.functions.invoke('send-admission-notification', {
        body: {
          email: targetEmail,
          employeeName,
          department: targetDepartment,
          targetStep,
          linkToken: notification.link_token,
          baseUrl,
          managerName,
          position,
        },
      });

      if (emailError) {
        console.error('Error sending email:', emailError);
      } else {
        // Update notification status to sent
        await supabase
          .from('admission_notifications')
          .update({ status: 'sent', sent_at: new Date().toISOString() })
          .eq('id', notification.id);
      }
    } catch (error) {
      console.error('Error invoking email function:', error);
    }
  }
}

export interface AdmissionProcess {
  id: string;
  employee_name: string;
  display_name: string | null;
  cpf: string;
  admission_date: string;
  start_date: string;
  contract_type: string;
  department: string;
  branch: string;
  manager_name: string;
  manager_email: string | null;
  position: string;
  work_regime: string;
  hr_observations: string | null;
  // Campos do Gestor
  buddy_mentor: string | null;
  needs_laptop: boolean | null;
  needs_monitor: boolean | null;
  needs_headset: boolean | null;
  needs_keyboard: boolean | null;
  needs_mouse: boolean | null;
  needs_printer: boolean | null;
  software_list: string[] | null;
  systems_list: string[] | null; // Acessos necessários
  email_required: boolean | null;
  email_distribution_lists: string[] | null;
  shared_folders: string[] | null;
  manager_observations: string | null;
  // Campos da TI (12 itens do checklist)
  email_created: string | null;           // 3. E-mail corporativo criado?
  user_ad_created: boolean | null;        // 2. Conta AD criada?
  microsoft_licenses: string[] | null;    // 4. Licenças Microsoft 365
  vpn_configured: string | null;          // 5. VPN configurada?
  sap_user_created: string | null;        // 7. Usuário SAP B1 criado?
  salesforce_profile_created: string | null; // 8. Perfil Salesforce criado?
  network_folders_released: string | null; // 9. Pastas de rede liberadas?
  printers_configured: string | null;     // 10. Impressoras configuradas?
  general_tests_done: string | null;      // 11. Testes gerais realizados?
  accesses_released: string[] | null;
  equipment_delivered: string[] | null;
  it_responsible: string | null;
  it_completion_date: string | null;
  it_observations: string | null;
  // Campos do Colaborador
  documents_received: string[] | null;
  documents_pending: string[] | null;
  // Controle de fluxo
  current_step: 'rh' | 'gestor' | 'ti' | 'rh_review' | 'colaborador' | 'concluido';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  target_department: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  hr_completed_at: string | null;
  hr_completed_by: string | null;
  manager_completed_at: string | null;
  manager_completed_by: string | null;
  ti_completed_at: string | null;
  ti_completed_by: string | null;
  documents_completed_at: string | null;
}

// Map department names to route slugs
const departmentToSlug: Record<string, string> = {
  'Financeiro': 'financeiro',
  'Marketing': 'marketing',
  'Comercial': 'comercial',
  'Logística': 'logistica',
  'Logistica': 'logistica',
  'Jurídico': 'juridico',
  'Juridico': 'juridico',
  'TI': 'tech',
  'Tech': 'tech',
  'Tecnologia': 'tech',
  'Suporte': 'tech',
  'E-commerce': 'ecommerce',
  'Ecommerce': 'ecommerce',
  'RH': 'rh',
  'Recursos Humanos': 'rh',
};

export function getDepartmentSlug(department: string): string {
  // Try exact match first
  if (departmentToSlug[department]) {
    return departmentToSlug[department];
  }

  // Try case-insensitive match
  const lowerDept = department.toLowerCase();
  for (const [key, value] of Object.entries(departmentToSlug)) {
    if (key.toLowerCase() === lowerDept) {
      return value;
    }
  }

  // Default fallback - use the department name as slug
  return department.toLowerCase().replace(/\s+/g, '-').replace(/[áàãâ]/g, 'a').replace(/[éèê]/g, 'e').replace(/[íìî]/g, 'i').replace(/[óòõô]/g, 'o').replace(/[úùû]/g, 'u');
}

export function useAdmissionProcesses(department?: string, fetchAll?: boolean) {
  const queryClient = useQueryClient();

  const { data: processes, isLoading, error } = useQuery({
    queryKey: ['admission-processes', department, fetchAll],
    queryFn: async () => {
      let query = supabase
        .from('admission_processes')
        .select('*')
        .order('created_at', { ascending: false });

      // Filter by department if specified and not fetching all
      if (department && !fetchAll) {
        const slug = getDepartmentSlug(department);
        query = query.eq('target_department', slug);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as AdmissionProcess[];
    },
  });

  // Create new admission (HR step)
  const createAdmission = useMutation({
    mutationFn: async (data: {
      employee_name: string;
      display_name?: string;
      cpf: string;
      admission_date: string;
      start_date: string;
      contract_type: string;
      department: string;
      branch: string;
      manager_name: string;
      manager_email?: string;
      position: string;
      work_regime: string;
      hr_observations?: string;
    }) => {
      const { data: user } = await supabase.auth.getUser();

      // Determine target department based on the selected department
      const targetDepartment = getDepartmentSlug(data.department);

      const { data: result, error } = await supabase
        .from('admission_processes')
        .insert({
          ...data,
          target_department: targetDepartment,
          current_step: 'gestor', // Move to manager step after HR completes
          status: 'in_progress',
          created_by: user?.user?.id,
          hr_completed_at: new Date().toISOString(),
          hr_completed_by: user?.user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Create notification for Gestor (manager)
      await createNotificationAndSendEmail(
        result.id,
        'gestor',
        result.target_department,
        result.employee_name,
        result.manager_email, // Send to manager email
        result.position,
        result.manager_name
      );

      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admission-processes'] });
      toast.success(`Admissão criada e notificação enviada para o setor ${data.department}`);
    },
    onError: (error) => {
      toast.error('Erro ao criar admissão: ' + error.message);
    },
  });

  // Update manager step (Gestor) - Mapeando campos do formulário para o banco
  const updateManagerStep = useMutation({
    mutationFn: async ({ id, data }: {
      id: string;
      data: {
        buddy_mentor?: string;
        equipamentos_necessarios?: string[]; // Array com nomes dos equipamentos
        softwares_necessarios?: string[];
        acessos_necessarios?: string[]; // Mapeado para systems_list
        necessita_impressora?: boolean;
        manager_observations?: string;
      };
    }) => {
      const { data: user } = await supabase.auth.getUser();

      // Mapear equipamentos_necessarios para os campos individuais do banco
      const equipamentos = data.equipamentos_necessarios || [];

      const { data: result, error } = await supabase
        .from('admission_processes')
        .update({
          buddy_mentor: data.buddy_mentor,
          // Mapear lista de equipamentos para campos booleanos
          needs_laptop: equipamentos.includes('Notebook') || equipamentos.includes('Desktop'),
          needs_monitor: equipamentos.includes('Monitor'),
          needs_headset: equipamentos.includes('Headset'),
          needs_keyboard: equipamentos.includes('Teclado'),
          needs_mouse: equipamentos.includes('Mouse'),
          needs_printer: data.necessita_impressora,
          software_list: data.softwares_necessarios,
          systems_list: data.acessos_necessarios, // Acessos necessários
          manager_observations: data.manager_observations,
          current_step: 'ti',
          manager_completed_at: new Date().toISOString(),
          manager_completed_by: user?.user?.id,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Create notification for TI
      await createNotificationAndSendEmail(
        result.id,
        'ti',
        'tech',
        result.employee_name,
        null, // TI email could be configured
        result.position,
        result.manager_name
      );

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admission-processes'] });
      toast.success('Definições do gestor salvas. Notificação enviada para TI.');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar: ' + error.message);
    },
  });

  // Update IT step - agora volta para RH revisar
  // 12 itens do checklist de TI
  const updateITStep = useMutation({
    mutationFn: async ({ id, data }: {
      id: string;
      data: {
        it_responsible?: string;           // 1. Responsável TI
        user_ad_created?: boolean;         // 2. Conta AD criada?
        email_created?: string;            // 3. E-mail corporativo criado?
        microsoft_licenses?: string[];     // 4. Licenças Microsoft 365
        vpn_configured?: boolean;          // 5. VPN configurada?
        software_list_installed?: string[]; // 6. Softwares instalados
        sap_user_created?: boolean;        // 7. Usuário SAP B1 criado?
        salesforce_profile_created?: boolean; // 8. Perfil Salesforce criado?
        network_folders_released?: boolean; // 9. Pastas de rede liberadas?
        printers_configured?: boolean;     // 10. Impressoras configuradas?
        general_tests_done?: boolean;      // 11. Testes gerais realizados?
        it_observations?: string;          // 12. Observações da TI
      };
    }) => {
      const { data: user } = await supabase.auth.getUser();

      const { data: result, error } = await supabase
        .from('admission_processes')
        .update({
          it_responsible: data.it_responsible,
          user_ad_created: data.user_ad_created,
          email_created: data.email_created,
          microsoft_licenses: data.microsoft_licenses,
          vpn_configured: data.vpn_configured ? 'Sim' : null,
          // Softwares instalados são salvos junto com os solicitados
          sap_user_created: data.sap_user_created ? 'Sim' : null,
          salesforce_profile_created: data.salesforce_profile_created ? 'Sim' : null,
          network_folders_released: data.network_folders_released ? 'Sim' : null,
          printers_configured: data.printers_configured ? 'Sim' : null,
          general_tests_done: data.general_tests_done ? 'Sim' : null,
          it_observations: data.it_observations,
          current_step: 'rh_review', // Volta para RH revisar
          it_completion_date: new Date().toISOString(),
          ti_completed_at: new Date().toISOString(),
          ti_completed_by: user?.user?.id,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Create notification for RH to review
      await createNotificationAndSendEmail(
        result.id,
        'rh_review',
        'rh',
        result.employee_name,
        null, // RH will see in dashboard
        result.position,
        result.manager_name
      );

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admission-processes'] });
      toast.success('Configuração TI concluída. Enviado para revisão do RH.');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar: ' + error.message);
    },
  });

  // RH sends to Colaborador after reviewing
  const sendToColaborador = useMutation({
    mutationFn: async (id: string) => {
      const { data: result, error } = await supabase
        .from('admission_processes')
        .update({
          current_step: 'colaborador',
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Create notification for Colaborador
      await createNotificationAndSendEmail(
        result.id,
        'colaborador',
        result.target_department,
        result.employee_name,
        result.email_created,
        result.position,
        result.manager_name
      );

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admission-processes'] });
      toast.success('Checklist enviado para o colaborador.');
    },
    onError: (error) => {
      toast.error('Erro ao enviar: ' + error.message);
    },
  });

  // RH returns process to a previous step
  const returnToStep = useMutation({
    mutationFn: async ({ id, targetStep, reason }: {
      id: string;
      targetStep: 'gestor' | 'ti';
      reason?: string;
    }) => {
      const { data: user } = await supabase.auth.getUser();

      const { data: result, error } = await supabase
        .from('admission_processes')
        .update({
          current_step: targetStep,
          hr_observations: reason ? `[Retorno] ${reason}` : null,
          // Reset completion timestamps for the step being returned to
          ...(targetStep === 'gestor' ? {
            manager_completed_at: null,
            manager_completed_by: null,
          } : {}),
          ...(targetStep === 'ti' ? {
            ti_completed_at: null,
            ti_completed_by: null,
          } : {}),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Create notification for the target step
      const targetDepartment = targetStep === 'ti' ? 'tech' : result.target_department;
      await createNotificationAndSendEmail(
        result.id,
        targetStep,
        targetDepartment,
        result.employee_name,
        targetStep === 'gestor' ? result.manager_email : null,
        result.position,
        result.manager_name
      );

      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admission-processes'] });
      const stepLabel = variables.targetStep === 'gestor' ? 'Gestor' : 'TI';
      toast.success(`Processo retornado para ${stepLabel}.`);
    },
    onError: (error) => {
      toast.error('Erro ao retornar processo: ' + error.message);
    },
  });

  // Complete admission
  const completeAdmission = useMutation({
    mutationFn: async ({ id, documents_received, documents_pending }: {
      id: string;
      documents_received?: string[];
      documents_pending?: string[];
    }) => {
      const { data: result, error } = await supabase
        .from('admission_processes')
        .update({
          documents_received,
          documents_pending,
          current_step: 'concluido',
          status: 'completed',
          documents_completed_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admission-processes'] });
      toast.success('Processo de admissão concluído!');
    },
    onError: (error) => {
      toast.error('Erro ao finalizar: ' + error.message);
    },
  });

  return {
    processes,
    isLoading,
    error,
    createAdmission,
    updateManagerStep,
    updateITStep,
    sendToColaborador,
    returnToStep,
    completeAdmission,
  };
}

// Hook for department-specific admissions
export function useDepartmentAdmissions(departmentSlug: string) {
  // Para TI, buscar todos os processos (pois TI processa admissões de todos os departamentos)
  const fetchAll = departmentSlug === 'tech';
  return useAdmissionProcesses(departmentSlug, fetchAll);
}
