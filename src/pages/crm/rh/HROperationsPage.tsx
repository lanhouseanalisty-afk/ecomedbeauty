import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, UserMinus, Briefcase } from "lucide-react";
import AdmissaoPage from "./AdmissaoPage";
import DemissaoPage from "./DemissaoPage";
import { Card } from "@/components/ui/card";

export default function HROperationsPage() {
    return (
        <div className="container mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-serif text-gray-900 dark:text-gray-100 flex items-center gap-3">
                    <Briefcase className="h-8 w-8 text-rose-gold" />
                    Gestão de Pessoal
                </h1>
                <p className="text-muted-foreground text-lg">
                    Central de processos de admissão e desligamento da MedBeauty.
                </p>
            </div>

            <Card className="p-1 bg-muted/30 border-rose-gold/10">
                <Tabs defaultValue="admissao" className="w-full">
                    <div className="px-4 pt-4">
                        <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-2">
                            <TabsTrigger
                                value="admissao"
                                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
                            >
                                <UserPlus className="h-4 w-4" />
                                Admissão
                            </TabsTrigger>
                            <TabsTrigger
                                value="demissao"
                                className="flex items-center gap-2 data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground transition-all"
                            >
                                <UserMinus className="h-4 w-4" />
                                Desligamento
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="p-4 md:p-6 bg-background rounded-b-xl border-t border-muted">
                        <TabsContent value="admissao" className="mt-0 border-none animate-in slide-in-from-left-2 duration-300">
                            <AdmissaoPage />
                        </TabsContent>

                        <TabsContent value="demissao" className="mt-0 border-none animate-in slide-in-from-right-2 duration-300">
                            <DemissaoPage />
                        </TabsContent>
                    </div>
                </Tabs>
            </Card>
        </div>
    );
}
