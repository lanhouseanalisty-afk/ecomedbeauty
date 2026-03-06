import { SectorRequestsPage } from "./components/SectorRequestsPage";

interface SectorRequestsWrapperProps {
    department: string;
}

const departmentNames: Record<string, string> = {
    admin: "Administração",
    cientifica: "Científica",
    comercial: "Comercial",
    compras: "Compras",
    ecommerce: "E-commerce",
    financeiro: "Financeiro",
    juridico: "Jurídico",
    logistica: "Logística",
    manutencao: "Manutenção",
    marketing: "Marketing",
    rh: "RH",
    tech: "Tech Digital",
    com_inside: "Inside Sales",
    com_franchises: "Franquias",
    com_sudeste: "Sudeste",
    com_sul: "Sul",
    com_centro: "Centro-Oeste",
    com_norte: "Norte/Nordeste",
};

export default function SectorRequestsWrapper({ department }: SectorRequestsWrapperProps) {
    return (
        <SectorRequestsPage
            currentSector={department}
            sectorName={departmentNames[department] || department}
        />
    );
}
