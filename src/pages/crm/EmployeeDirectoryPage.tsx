
import { useState } from "react";
import {
    Users,
    Search,
    MapPin,
    Mail,
    Phone,
    Filter,
    MessageSquare,
    Globe,
    Share2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useEmployeeDirectory } from "@/hooks/useIntranet";
import { Skeleton } from "@/components/ui/skeleton";

export default function EmployeeDirectoryPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState("all");

    const { data: employees, isLoading } = useEmployeeDirectory();

    // Departments for filter
    const departments = Array.from(new Set(employees?.map(e => e.department_name).filter(Boolean)));

    const filteredEmployees = employees?.filter(emp => {
        const matchesSearch =
            emp.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.position_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesDept = departmentFilter === "all" || emp.department_name === departmentFilter;

        return matchesSearch && matchesDept;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="font-serif text-3xl font-bold">Diretório Medbeauty</h1>
                    <p className="text-muted-foreground italic">
                        "Saber quem é quem faz nossa força fluir melhor."
                    </p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl border shadow-sm items-end">
                <div className="flex-1 space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Buscar Colega</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Nome, cargo ou habilidade..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 h-11 bg-slate-50/50 border-none rounded-xl"
                        />
                    </div>
                </div>
                <div className="w-full md:w-64 space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Filtrar Departamento</label>
                    <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                        <SelectTrigger className="h-11 bg-slate-50/50 border-none rounded-xl">
                            <SelectValue placeholder="Todos os Departamentos" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos os Departamentos</SelectItem>
                            {departments.map(dept => (
                                <SelectItem key={dept} value={dept!}>{dept}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <Skeleton key={i} className="h-64 w-full rounded-3xl" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEmployees?.map((emp) => (
                        <Card key={emp.id} className="group overflow-hidden rounded-3xl border-none shadow-sm hover:shadow-xl transition-all duration-300 bg-white">
                            <CardHeader className="relative p-0 h-24 bg-gradient-to-r from-primary/10 to-primary/5">
                                <div className="absolute -bottom-10 left-6">
                                    <Avatar className="h-20 w-20 border-4 border-white shadow-md ring-2 ring-primary/10">
                                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${emp.full_name}`} />
                                        <AvatarFallback>{emp.full_name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-12 pb-6 px-6">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary transition-colors">{emp.full_name}</h3>
                                    <p className="text-sm font-medium text-slate-500">{emp.position_title || "Colaborador"}</p>
                                    <Badge variant="secondary" className="mt-1 bg-slate-100 text-slate-600 border-none text-[10px] font-bold uppercase tracking-wider">
                                        {emp.department_name || "Geral"}
                                    </Badge>
                                </div>

                                <div className="mt-6 space-y-3">
                                    <div className="flex items-center gap-3 text-sm text-slate-600">
                                        <Mail className="h-4 w-4 text-primary/60" />
                                        <span className="truncate">{emp.email}</span>
                                    </div>
                                    {emp.phone && (
                                        <div className="flex items-center gap-3 text-sm text-slate-600">
                                            <Phone className="h-4 w-4 text-primary/60" />
                                            <span>{emp.phone}</span>
                                        </div>
                                    )}
                                </div>

                                {emp.skills && emp.skills.length > 0 && (
                                    <div className="mt-6 flex flex-wrap gap-1.5">
                                        {emp.skills.map(skill => (
                                            <span key={skill} className="px-2 py-0.5 bg-primary/5 text-primary text-[10px] font-medium rounded-full">
                                                #{skill}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <div className="mt-8 flex gap-2">
                                    <Button
                                        variant="outline"
                                        className="flex-1 rounded-xl h-9 text-xs font-bold border-slate-100 bg-slate-50/50 hover:bg-primary hover:text-white transition-all"
                                        onClick={() => window.location.href = `/crm/rh/perfil/${emp.id}`}
                                    >
                                        Ver Perfil
                                    </Button>
                                    <Button variant="outline" size="icon" className="rounded-xl h-9 w-9 border-slate-100 bg-slate-50/50 hover:text-primary">
                                        <MessageSquare className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {!isLoading && filteredEmployees?.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="bg-slate-50 p-6 rounded-full mb-4">
                        <Users className="h-12 w-12 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-400">Nenhum colega encontrado</h3>
                    <p className="text-slate-400">Tente buscar por outro termo ou departamento.</p>
                </div>
            )}
        </div>
    );
}
