import { Helmet } from "react-helmet-async";
import { MarketingRequestForm } from "@/components/crm/marketing/MarketingRequestForm";

export default function MarketingSolicitacaoPage() {
    return (
        <>
            <Helmet>
                <title>Solicitação de Insumos - Marketing | MedBeauty CRM</title>
            </Helmet>

            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8 px-4">
                <div className="container mx-auto">
                    <MarketingRequestForm />
                </div>
            </div>
        </>
    );
}
