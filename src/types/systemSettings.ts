// Tipos para a tabela system_settings
export interface SystemSetting {
    id: string;
    key: string;
    value: string | null;
    description: string | null;
    is_encrypted: boolean;
    category: string;
    created_at: string;
    updated_at: string;
}

export interface SystemSettingInsert {
    id?: string;
    key: string;
    value?: string | null;
    description?: string | null;
    is_encrypted?: boolean;
    category?: string;
    created_at?: string;
    updated_at?: string;
}

export interface SystemSettingUpdate {
    id?: string;
    key?: string;
    value?: string | null;
    description?: string | null;
    is_encrypted?: boolean;
    category?: string;
    created_at?: string;
    updated_at?: string;
}
