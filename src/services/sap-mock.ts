
// SAP Business One Service
// Supports both Mock data and Real Service Layer connection

export interface SapProduct {
    ItemCode: string;
    ItemName: string;
    OnHand: number;
    Price: number;
    WhsCode: string;
}

export interface SapOrder {
    DocEntry: number;
    CardName: string;
    DocTotal: number;
    DocDate: string;
    DocStatus: 'O' | 'C';
}

export interface SapConfig {
    apiUrl: string;
    companyDB: string;
    user: string;
    password: string;
    useRealConnection: boolean;
}

// Default Configuration (Local Storage or Env)
let currentConfig: SapConfig = {
    apiUrl: import.meta.env.VITE_SAP_API_URL || 'https://sap-server:50000/b1s/v1',
    companyDB: import.meta.env.VITE_SAP_COMPANY_DB || '',
    user: import.meta.env.VITE_SAP_USER || '',
    password: import.meta.env.VITE_SAP_PASSWORD || '',
    useRealConnection: false
};

// Mock Data
const MOCK_PRODUCTS: SapProduct[] = [
    { ItemCode: 'A001', ItemName: 'Botox Type A 100u', OnHand: 150, Price: 850.00, WhsCode: '01' },
    { ItemCode: 'A002', ItemName: 'Ácido Hialurônico 1ml', OnHand: 320, Price: 450.00, WhsCode: '01' },
    { ItemCode: 'A003', ItemName: 'Seringa Descartável', OnHand: 5000, Price: 2.50, WhsCode: '02' },
    { ItemCode: 'B001', ItemName: 'Dermocosmético Vit C', OnHand: 45, Price: 120.00, WhsCode: '01' },
    { ItemCode: 'C005', ItemName: 'Kit Peeling Químico', OnHand: 12, Price: 340.00, WhsCode: '03' },
];

const MOCK_ORDERS: SapOrder[] = [
    { DocEntry: 102030, CardName: 'Clínica Estética Bela', DocTotal: 4500.00, DocDate: '2026-02-01', DocStatus: 'O' },
    { DocEntry: 102031, CardName: 'Dra. Ana Silva', DocTotal: 1250.00, DocDate: '2026-02-02', DocStatus: 'C' },
    { DocEntry: 102032, CardName: 'Centro Médico Sul', DocTotal: 15800.00, DocDate: '2026-02-03', DocStatus: 'O' },
    { DocEntry: 102033, CardName: 'Hospital Sta. Cruz', DocTotal: 2200.00, DocDate: '2026-02-04', DocStatus: 'O' },
    // Only mock orders
];

let sessionId: string | null = null;

export const sapService = {
    updateConfig: (config: SapConfig) => {
        currentConfig = config;
        sessionId = null; // Reset session on config change
    },

    getConfig: () => currentConfig,

    login: async () => {
        if (!currentConfig.useRealConnection) return;

        try {
            const res = await fetch(`${currentConfig.apiUrl}/Login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    CompanyDB: currentConfig.companyDB,
                    UserName: currentConfig.user,
                    Password: currentConfig.password
                })
            });

            if (!res.ok) throw new Error('Falha no login SAP');

            const data = await res.json();
            sessionId = data.SessionId;
            return sessionId;
        } catch (error) {
            console.error(error);
            throw error;
        }
    },

    getInventory: async (): Promise<SapProduct[]> => {
        if (currentConfig.useRealConnection) {
            try {
                if (!sessionId) await sapService.login();

                // Fetch Items (Example OData query)
                const res = await fetch(`${currentConfig.apiUrl}/Items?$select=ItemCode,ItemName,QuantityOnStock,ItemPrices&$top=20`, {
                    headers: {
                        'Cookie': `B1SESSION=${sessionId}`,
                        'Prefer': 'odata.maxpagesize=20'
                    }
                });

                if (!res.ok) throw new Error('Erro ao buscar itens');

                const data = await res.json();
                return data.value.map((item: any) => ({
                    ItemCode: item.ItemCode,
                    ItemName: item.ItemName,
                    OnHand: item.QuantityOnStock,
                    Price: item.ItemPrices?.[0]?.Price || 0,
                    WhsCode: 'Default'
                }));
            } catch (e) {
                console.warn("SAP Connection Failed, falling back to mock", e);
                throw e; // Let the UI handle the error or fallback
            }
        }

        // Mock Fallback
        return new Promise((resolve) => setTimeout(() => resolve(MOCK_PRODUCTS), 800));
    },

    getRecentOrders: async (): Promise<SapOrder[]> => {
        if (currentConfig.useRealConnection) {
            try {
                if (!sessionId) await sapService.login();

                const res = await fetch(`${currentConfig.apiUrl}/Orders?$select=DocEntry,CardName,DocTotal,DocDate,DocumentStatus&$top=10&$orderby=DocEntry desc`, {
                    headers: { 'Cookie': `B1SESSION=${sessionId}` }
                });

                if (!res.ok) throw new Error('Erro ao buscar pedidos');

                const data = await res.json();
                return data.value.map((ord: any) => ({
                    DocEntry: ord.DocEntry,
                    CardName: ord.CardName,
                    DocTotal: ord.DocTotal,
                    DocDate: ord.DocDate,
                    DocStatus: ord.DocumentStatus === 'bost_Open' ? 'O' : 'C'
                }));
            } catch (e) {
                console.warn("SAP Connection Failed", e);
                throw e;
            }
        }

        return new Promise((resolve) => setTimeout(() => resolve(MOCK_ORDERS), 800));
    }
};
