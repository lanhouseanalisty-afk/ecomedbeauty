
import {
    Mail,
    Phone,
    MapPin,
    Briefcase,
    Plus
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const TEAM_MEMBERS = [
    {
        id: 1,
        name: "Luciana Maluf",
        role: "Head Jurídico",
        email: "luciana.maluf@medbeauty.com.br",
        phone: "+55 11 99999-9999",
        location: "São Paulo - SP",
        initials: "LM",
        expertises: ["Contratos", "Compliance", "Societário"],
        bio: "Advogada sênior com mais de 15 anos de experiência em direito empresarial e gestão de riscos corporativos. Lidera a estratégia jurídica da MedBeauty com foco em inovação e segurança."
    },
    {
        id: 2,
        name: "Equipe Jurídico",
        role: "Suporte Legal",
        email: "juridico@medbeauty.com.br",
        phone: "+55 11 3000-0000",
        location: "Matriz",
        initials: "EJ",
        expertises: ["Atendimento", "Análise Prévia", "Gestão de Processos"],
        bio: "Equipe dedicada ao suporte diário das demandas internas, garantindo agilidade e conformidade em todas as operações da empresa."
    }
];

export default function LegalDashboard() {
    const navigate = useNavigate();

    return (
        <div className="space-y-8 animate-fade-in-up p-6">
            {/* Header Section */}
            <div className="flex flex-col gap-2">
                <h1 className="font-serif text-4xl font-bold tracking-tight text-primary">
                    Nossa Equipe Jurídica
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl">
                    Conheça os profissionais dedicados a garantir a segurança, conformidade e o sucesso legal das operações da MedBeauty.
                </p>
            </div>

            {/* Team Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {TEAM_MEMBERS.map((member) => (
                    <Card key={member.id} className="overflow-hidden border-t-4 border-t-primary shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <CardHeader className="text-center pb-2 relative">
                            <div className="absolute top-4 right-4">
                                <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                                    {member.role}
                                </Badge>
                            </div>
                            <div className="flex justify-center mb-4 pt-6">
                                <Avatar className="h-24 w-24 border-4 border-background shadow-md">
                                    <AvatarImage src={`/avatars/${member.id}.png`} alt={member.name} />
                                    <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                                        {member.initials}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                            <CardTitle className="text-xl font-bold">{member.name}</CardTitle>
                            <CardDescription className="flex items-center justify-center gap-1">
                                <MapPin className="h-3 w-3" /> {member.location}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 text-center">
                            <p className="text-sm text-muted-foreground italic px-4">
                                "{member.bio}"
                            </p>

                            <div className="flex flex-wrap gap-2 justify-center mt-4">
                                {member.expertises.map((skill) => (
                                    <Badge key={skill} variant="outline" className="text-xs">
                                        {skill}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-center gap-3 bg-muted/30 pt-4 pb-6">
                            <Button variant="outline" size="sm" className="gap-2" onClick={() => window.location.href = `mailto:${member.email}`}>
                                <Mail className="h-4 w-4" />
                                Email
                            </Button>
                            <Button variant="ghost" size="sm" className="gap-2">
                                <Phone className="h-4 w-4" />
                                Contato
                            </Button>
                        </CardFooter>
                    </Card>
                ))}

                {/* Call to Action / Info Card */}
                <Card className="flex flex-col items-center justify-center border-dashed border-2 shadow-sm bg-muted/10">
                    <CardContent className="flex flex-col items-center text-center p-8 space-y-4">
                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                            <Briefcase className="h-8 w-8 text-primary" />
                        </div>
                        <CardTitle className="text-xl">Precisa de ajuda?</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Para dúvidas gerais, solicitações de contratos ou orientação legal, entre em contato diretamente com nossa central ou abra um chamado.
                        </p>
                        <Button
                            onClick={() => navigate("/crm/intranet/contratos/novo")}
                            className="mt-4 bg-[#D0998B] hover:bg-[#b07d72] text-white rounded-xl px-6"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Solicitar Contrato
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
