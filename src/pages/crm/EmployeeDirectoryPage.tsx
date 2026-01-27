import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Briefcase, Mail, Filter } from "lucide-react";
import { useEmployees } from "@/hooks/useRH";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function EmployeeDirectoryPage() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const { employees, isLoading } = useEmployees();

    const filteredEmployees = employees?.filter(emp =>
        emp.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (emp as any).position?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (emp as any).department?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="font-serif text-3xl font-bold italic text-primary">Nossa Comunidade</h1>
                    <p className="text-muted-foreground">Conecte-se com seus colegas de trabalho</p>
                </div>
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        className="pl-10"
                        placeholder="Buscar por nome, cargo ou setor..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <Skeleton key={i} className="h-64 w-full rounded-xl" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredEmployees.map((employee) => (
                        <Card
                            key={employee.id}
                            className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-none bg-background/50 backdrop-blur-sm shadow-sm overflow-hidden"
                            onClick={() => navigate(`/crm/rh/funcionario/${employee.id}`)}
                        >
                            <div className="h-20 bg-gradient-to-r from-primary/20 to-primary/5 group-hover:to-primary/20 transition-all" />
                            <CardContent className="relative pt-0 flex flex-col items-center">
                                <Avatar className="h-24 w-24 -mt-12 border-4 border-background shadow-lg group-hover:scale-105 transition-transform">
                                    <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                                        {getInitials(employee.full_name)}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="mt-4 text-center space-y-1">
                                    <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
                                        {employee.full_name}
                                    </h3>
                                    <p className="text-sm text-muted-foreground font-medium">
                                        {(employee as any).position?.title || 'Colaborador'}
                                    </p>
                                </div>

                                <div className="mt-4 flex flex-wrap justify-center gap-2">
                                    <Badge variant="secondary" className="font-normal text-[10px]">
                                        {(employee as any).department?.name || 'Geral'}
                                    </Badge>
                                    <Badge variant="outline" className="text-[10px] font-normal">
                                        ID: {employee.cpf.replace(/\D/g, '').slice(0, 3)}...
                                    </Badge>
                                </div>

                                <div className="mt-6 w-full flex items-center justify-center gap-4 text-muted-foreground">
                                    <Mail className="h-4 w-4 hover:text-primary transition-colors" />
                                    <MapPin className="h-4 w-4 hover:text-primary transition-colors" />
                                    <Briefcase className="h-4 w-4 hover:text-primary transition-colors" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {!isLoading && filteredEmployees.length === 0 && (
                <div className="text-center py-20 bg-muted/20 rounded-xl border-2 border-dashed border-muted">
                    <p className="text-muted-foreground">Nenhum colaborador encontrado com esses termos.</p>
                </div>
            )}
        </div>
    );
}
