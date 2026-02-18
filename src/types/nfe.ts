// Types for NFE System
export interface NFERecord {
    id: string;
    sector: string;

    // NFE Data
    nfe_number: string;
    nfe_series?: string;
    emission_date: string;
    due_date: string;

    // Supplier Data
    supplier_name: string;
    supplier_cnpj?: string;

    // Values
    total_value: number;
    description?: string;

    // Recurrence
    is_recurring: boolean;
    recurrence_type?: 'monthly' | 'quarterly' | 'annual' | 'custom';
    recurrence_day?: number;
    next_due_date?: string;

    // Status
    status: 'pending' | 'paid' | 'overdue' | 'cancelled';
    payment_date?: string;
    payment_notes?: string;

    // Metadata
    created_by?: string;
    created_at?: string;
    updated_at?: string;
}

export interface NFEAttachment {
    id: string;
    nfe_id: string;
    file_type: 'nfe_pdf' | 'boleto_pdf';
    file_name: string;
    file_path: string;
    file_size?: number;
    uploaded_by?: string;
    uploaded_at?: string;
}

export interface NFENotification {
    id: string;
    nfe_id: string;
    notification_type: 'due_soon' | 'overdue' | 'renewal_needed';
    notification_date: string;
    days_until_due?: number;
    message?: string;
    is_read: boolean;
    read_at?: string;
    read_by?: string;
    created_at?: string;
}

export interface NFEFormData {
    sector: string;
    nfe_number: string;
    nfe_series?: string;
    emission_date: string;
    due_date: string;
    supplier_name: string;
    supplier_cnpj?: string;
    total_value: number;
    description?: string;
    is_recurring: boolean;
    recurrence_type?: 'monthly' | 'quarterly' | 'annual' | 'custom';
    recurrence_day?: number;
    nfe_file?: File;
    boleto_file?: File;
}
