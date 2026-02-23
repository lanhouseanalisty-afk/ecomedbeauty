import { Helmet } from "react-helmet-async";
import { UnifiedSupplyRequestForm } from "@/components/crm/shared/UnifiedSupplyRequestForm";
import { useParams, useLocation } from "react-router-dom";

interface InsumoSolicitationPageProps {
    sector?: string;
    sectorLabel?: string;
}

export default function InsumoSolicitationPage({ sector: propSector, sectorLabel: propSectorLabel }: InsumoSolicitationPageProps) {
    const location = useLocation();

    // Determine sector from URL if not provided by prop
    // Paths are usually /crm/:sector/insumos
    const pathParts = location.pathname.split('/');
    const urlSector = pathParts[2]; // Index 2 should be the sector (crm is index 1)

    const sector = propSector || urlSector || 'marketing';

    // Map sector slugs to readable labels if needed, or use prop
    const sectorLabels: Record<string, string> = {
        'marketing': 'Marketing',
        'comercial': 'Comercial',
        'tech': 'Tecnologia da Informação',
        'cientifica': 'Científica',
        'admin': 'Administração',
        'compras': 'Compras',
        'ecommerce': 'E-commerce',
        'financeiro': 'Financeiro',
        'juridico': 'Jurídico',
        'logistica': 'Logística',
        'manutencao': 'Manutenção',
        'rh': 'Recursos Humanos',
        'com_inside': 'Inside Sales',
        'com_franchises': 'Franquias',
        'com_sudeste': 'Sudeste',
        'com_sul': 'Sul',
        'com_centro': 'Centro-Oeste',
        'com_norte': 'Norte/Nordeste'
    };

    const sectorLabel = propSectorLabel || sectorLabels[sector] || sector.toUpperCase();

    return (
        <>
            <Helmet>
                <title>Insumos - {sectorLabel} | MedBeauty CRM</title>
            </Helmet>

            <div className="py-10 px-4">
                <div className="container mx-auto animate-in fade-in zoom-in-95 duration-500">
                    <UnifiedSupplyRequestForm sector={sector} sectorLabel={sectorLabel} />
                </div>
            </div>
        </>
    );
}
