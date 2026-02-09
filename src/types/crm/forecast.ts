
export interface Consultor {
    id: string;
    nome: string;
    email?: string | null; // Email para vínculo de acesso
    ativo: boolean;
    avatar_url?: string;
}

export interface MesConfig {
    id: string;
    ano: number;
    mes: number;
    meta: number;
    previsao: number;
    meta_adicional: number;
    campanha: boolean;
    observacoes: string;
}

export interface LancamentoDiario {
    id: string;
    consultor_id: string;
    data: string; // YYYY-MM-DD
    valor: number;
    valor_meta?: number; // Valor que precisa/meta diária
    etiqueta: string | null; // 'feriado', 'campanha', 'sabado'
    origem: string;
}

export interface WeekSummary {
    weekNumber: number;
    startDate: string;
    endDate: string;
    total: number;
}

export interface ConsultorMonthData {
    consultor: Consultor;
    lancamentos: LancamentoDiario[];
    totalMes: number;
    weeks: WeekSummary[];
}
