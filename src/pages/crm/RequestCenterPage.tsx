
import { RequestList } from '@/components/workflow/RequestList';

export default function RequestCenterPage() {
    return (
        <div className="container mx-auto p-6 max-w-5xl animate-in fade-in">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Caixa de Solicitações</h1>
                <p className="text-muted-foreground mt-2">
                    Gerencie pedidos entre setores, acompanhe prazos e SLAs.
                </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
                <RequestList />
            </div>
        </div>
    );
}
