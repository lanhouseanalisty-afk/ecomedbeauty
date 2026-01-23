import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  ChevronRight,
  ChevronLeft,
  User,
  Briefcase,
  Monitor,
  CheckCircle2,
  Send,
  Save
} from "lucide-react";

// Departamentos disponíveis para roteamento
const DEPARTAMENTOS = [
  { value: "Financeiro", label: "Financeiro" },
  { value: "Marketing", label: "Marketing" },
  { value: "Comercial", label: "Comercial" },
  { value: "Logística", label: "Logística" },
  { value: "Jurídico", label: "Jurídico" },
  { value: "TI", label: "TI / Tech" },
  { value: "RH", label: "RH / Recursos Humanos" },
];

// Schema de validação para Seção 1 - RH
const secaoRHSchema = z.object({
  nome_completo: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  nome_exibicao: z.string().optional(),
  cpf: z.string().min(11, "CPF inválido").max(14),
  data_admissao: z.string().min(1, "Data de admissão é obrigatória"),
  data_inicio: z.string().min(1, "Data de início é obrigatória"),
  tipo_contratacao: z.enum(["CLT", "PJ", "Estágio", "Temporário"], {
    required_error: "Selecione o tipo de contratação",
  }),
  setor_departamento: z.string().min(1, "Setor é obrigatório"),
  filial_unidade: z.string().min(1, "Filial é obrigatória"),
  gestor_direto: z.string().min(1, "Gestor é obrigatório"),
  email_gestor: z.string().email("Email inválido").optional().or(z.literal("")),
  cargo_funcao: z.string().min(1, "Cargo é obrigatório"),
  regime_trabalho: z.enum(["Presencial", "Híbrido", "Remoto"], {
    required_error: "Selecione o regime de trabalho",
  }),
  observacoes_rh: z.string().optional(),
});

// Schema para Seção 2 - Gestor (campos opcionais para permitir submissão parcial)
const secaoGestorSchema = z.object({
  buddy_mentor: z.string().optional(),
  equipamentos_necessarios: z.array(z.string()).optional().default([]),
  softwares_necessarios: z.array(z.string()).optional().default([]),
  acessos_necessarios: z.array(z.string()).optional().default([]),
  sharepoint_pasta: z.string().optional(),
  outros_acessos: z.string().optional(),
  necessita_impressora: z.enum(["Sim", "Nao"]).optional(),
  observacoes_gestor: z.string().optional(),
});

// Opções para o Gestor
const EQUIPAMENTOS_OPTIONS = [
  { value: "Notebook", label: "Notebook" },
  { value: "Desktop", label: "Desktop" },
  { value: "Celular", label: "Celular" },
  { value: "Monitor", label: "Monitor" },
  { value: "HeadSet", label: "HeadSet" },
  { value: "Mouse", label: "Mouse" },
];

const SOFTWARES_OPTIONS = [
  { value: "Microsoft 365", label: "Microsoft 365" },
  { value: "SAP B1", label: "SAP B1" },
  { value: "Salesforce", label: "Salesforce" },
];

const ACESSOS_OPTIONS = [
  { value: "AD", label: "AD" },
  { value: "Teams", label: "Teams" },
  { value: "Pastas de Rede / Sharepoint", label: "Pastas de Rede / Sharepoint" },
  { value: "VPN", label: "VPN" },
  { value: "Outros", label: "Outros" },
];

// Schema para Seção 3 - TI (campos opcionais para permitir submissão parcial)
const secaoTISchema = z.object({
  conta_ad_criada: z.enum(["Sim", "Nao", "NaoAplica"]).optional(),
  email_corporativo_criado: z.enum(["Sim", "Nao", "NaoAplica"]).optional(),
  licencas_microsoft365: z.array(z.string()).optional(),
  vpn_configurada: z.enum(["Sim", "Nao", "NaoAplica"]).optional(),
  softwares_instalados: z.enum(["Sim", "Nao"]).optional(),
  usuario_sap_criado: z.enum(["Sim", "Nao", "NaoAplica"]).optional(),
  perfil_salesforce_criado: z.enum(["Sim", "Nao", "NaoAplica"]).optional(),
  pastas_rede_liberadas: z.enum(["Sim", "Nao"]).optional(),
  impressoras_configuradas: z.enum(["Sim", "Nao"]).optional(),
  testes_gerais_realizados: z.enum(["Sim", "Nao"]).optional(),
  observacoes_ti: z.string().optional(),
});

// Opções de licenças Microsoft 365
const LICENCAS_MICROSOFT365_OPTIONS = [
  { value: "Exchange Online 1", label: "Exchange Online 1" },
  { value: "Exchange Online 2", label: "Exchange Online 2" },
  { value: "Microsoft 365 Business Basic", label: "Microsoft 365 Business Basic" },
  { value: "Microsoft 365 Business Premium", label: "Microsoft 365 Business Premium" },
  { value: "Microsoft 365 Business Standard", label: "Microsoft 365 Business Standard" },
  { value: "Microsoft Intune Plan 1 Device", label: "Microsoft Intune Plan 1 Device" },
  { value: "Power BI Pro", label: "Power BI Pro" },
];

// Schema para Seção 4 - Colaborador
const secaoColaboradorSchema = z.object({
  confirma_recebimento_equipamentos: z.enum(["Sim", "Nao"], {
    required_error: "Selecione uma opção",
  }).optional(),
  confirma_funcionamento_acessos: z.enum(["Sim", "Nao"], {
    required_error: "Selecione uma opção",
  }).optional(),
  recebeu_orientacao_sistemas: z.enum(["Sim", "Nao"], {
    required_error: "Selecione uma opção",
  }).optional(),
  sabe_solicitar_suporte: z.enum(["Sim", "Nao"], {
    required_error: "Selecione uma opção",
  }).optional(),
  observacoes_colaborador: z.string().optional(),
});

const fullSchema = secaoRHSchema
  .merge(secaoGestorSchema)
  .merge(secaoTISchema)
  .merge(secaoColaboradorSchema);

type FormData = z.infer<typeof fullSchema>;

interface AdmissaoFormProps {
  onSubmit: (data: FormData) => void;
  onSaveDraft?: (data: Partial<FormData>) => void;
  initialData?: Partial<FormData>;
  currentSection?: number;
  isReadOnly?: boolean;
  allowedSections?: number[]; // Restrict which sections can be edited
  showOnlySections?: number[]; // Only show specific sections
  userRole?: 'rh' | 'gestor' | 'ti' | 'colaborador'; // Role of current user
}

const sections = [
  { id: 1, title: "Dados do Colaborador", icon: User, role: "RH" },
  { id: 2, title: "Definições do Gestor", icon: Briefcase, role: "Gestor" },
  { id: 3, title: "Configuração TI", icon: Monitor, role: "TI" },
  { id: 4, title: "Documentos", icon: CheckCircle2, role: "Colaborador" },
];

export default function AdmissaoForm({
  onSubmit,
  onSaveDraft,
  initialData,
  currentSection: initialSection = 1,
  isReadOnly = false,
  allowedSections,
  showOnlySections,
  userRole = 'rh',
}: AdmissaoFormProps) {
  const [currentSection, setCurrentSection] = useState(initialSection);

  const form = useForm<FormData>({
    resolver: zodResolver(fullSchema),
    defaultValues: {
      nome_completo: "",
      nome_exibicao: "",
      cpf: "",
      data_admissao: "",
      data_inicio: "",
      tipo_contratacao: undefined,
      setor_departamento: "",
      filial_unidade: "",
      gestor_direto: "",
      email_gestor: "",
      cargo_funcao: "",
      regime_trabalho: undefined,
      observacoes_rh: "",
      buddy_mentor: "",
      equipamentos_necessarios: [],
      softwares_necessarios: [],
      acessos_necessarios: [],
      sharepoint_pasta: "",
      outros_acessos: "",
      necessita_impressora: undefined,
      observacoes_gestor: "",
      conta_ad_criada: undefined,
      email_corporativo_criado: undefined,
      licencas_microsoft365: [],
      vpn_configurada: undefined,
      softwares_instalados: undefined,
      usuario_sap_criado: undefined,
      perfil_salesforce_criado: undefined,
      pastas_rede_liberadas: undefined,
      impressoras_configuradas: undefined,
      testes_gerais_realizados: undefined,
      observacoes_ti: "",
      confirma_recebimento_equipamentos: undefined,
      confirma_funcionamento_acessos: undefined,
      recebeu_orientacao_sistemas: undefined,
      sabe_solicitar_suporte: undefined,
      observacoes_colaborador: "",
      ...initialData,
    },
  });

  const progress = (currentSection / sections.length) * 100;

  const handleNext = () => {
    if (currentSection < sections.length) {
      setCurrentSection(currentSection + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSection > 1) {
      setCurrentSection(currentSection - 1);
    }
  };

  const handleSaveDraft = () => {
    const data = form.getValues();
    onSaveDraft?.(data);
  };

  return (
    <div className="space-y-6">
      {/* Header com título e progresso */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl text-primary">
                MEDBEAUTY — Checklist de Admissão RH
              </CardTitle>
              <CardDescription className="mt-1">
                Formulário oficial de admissão de colaboradores da MEDBEAUTY.
                <br />
                <span className="text-xs font-medium mt-1 inline-block">
                  Fluxo: RH → Gestor → TI → Colaborador
                </span>
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-sm px-3 py-1">
              Seção {currentSection} de {sections.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              {sections.map((section) => (
                <div
                  key={section.id}
                  className={`flex items-center gap-1 ${section.id === currentSection
                    ? "text-primary font-medium"
                    : section.id < currentSection
                      ? "text-green-600"
                      : "text-muted-foreground"
                    }`}
                >
                  <section.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{section.role}</span>
                </div>
              ))}
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Navigation tabs - RH only sees section 1 */}
      {userRole === 'rh' ? (
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button
            variant="default"
            size="sm"
            className="flex items-center gap-2 whitespace-nowrap"
          >
            <User className="h-4 w-4" />
            Dados do Colaborador
          </Button>
        </div>
      ) : (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {sections.map((section) => (
            <Button
              key={section.id}
              variant={currentSection === section.id ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentSection(section.id)}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <section.icon className="h-4 w-4" />
              {section.title}
              {section.id < currentSection && (
                <CheckCircle2 className="h-3 w-3 text-green-500" />
              )}
            </Button>
          ))}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

          {/* Seção 1 - DADOS DO COLABORADOR (RH) */}
          {currentSection === 1 && (
            <Card>
              <CardHeader className="bg-blue-50 dark:bg-blue-950/20 rounded-t-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle>Seção 1 — DADOS DO COLABORADOR (RH)</CardTitle>
                    <CardDescription>
                      Informações básicas preenchidas pelo RH
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="nome_completo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          1. Nome completo do colaborador <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Insira sua resposta" {...field} disabled={isReadOnly} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nome_exibicao"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>2. Nome de exibição</FormLabel>
                        <FormControl>
                          <Input placeholder="Insira sua resposta" {...field} disabled={isReadOnly} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="cpf"
                  render={({ field }) => (
                    <FormItem className="max-w-sm">
                      <FormLabel>
                        3. CPF do Colaborador <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="000.000.000-00"
                          {...field}
                          disabled={isReadOnly}
                        />
                      </FormControl>
                      <FormDescription>O valor deve ser um número</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="data_admissao"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          4. Data de admissão <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input type="date" {...field} disabled={isReadOnly} />
                        </FormControl>
                        <FormDescription>Insira a data (dd/MM/yyyy)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="data_inicio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          5. Data de Início <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input type="date" {...field} disabled={isReadOnly} />
                        </FormControl>
                        <FormDescription>Insira a data (dd/MM/yyyy)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="tipo_contratacao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        6. Tipo de contratação <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-wrap gap-4"
                          disabled={isReadOnly}
                        >
                          {["CLT", "PJ", "Estágio", "Temporário"].map((tipo) => (
                            <div key={tipo} className="flex items-center space-x-2">
                              <RadioGroupItem value={tipo} id={`tipo-${tipo}`} />
                              <Label htmlFor={`tipo-${tipo}`} className="cursor-pointer">
                                {tipo}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="setor_departamento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          7. Setor / Departamento <span className="text-destructive">*</span>
                        </FormLabel>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value || ""}
                          className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2"
                          disabled={isReadOnly}
                        >
                          {DEPARTAMENTOS.map((dept) => (
                            <div key={dept.value} className="flex items-center space-x-2 rounded-md border p-3 hover:bg-muted/50 transition-colors">
                              <RadioGroupItem value={dept.value} id={`dept-${dept.value}`} />
                              <Label htmlFor={`dept-${dept.value}`} className="flex-1 cursor-pointer font-normal">
                                {dept.label}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                        <FormDescription>
                          O formulário será enviado automaticamente para este setor
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="filial_unidade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          8. Filial / Unidade <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Insira sua resposta" {...field} disabled={isReadOnly} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="gestor_direto"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          9. Gestor direto <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Insira sua resposta" {...field} disabled={isReadOnly} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email_gestor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>10. E-mail Gestor</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="email@medbeauty.com.br"
                            {...field}
                            disabled={isReadOnly}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="cargo_funcao"
                  render={({ field }) => (
                    <FormItem className="max-w-md">
                      <FormLabel>
                        11. Cargo / Função <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Insira sua resposta" {...field} disabled={isReadOnly} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="regime_trabalho"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        12. Regime de trabalho <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-wrap gap-4"
                          disabled={isReadOnly}
                        >
                          {["Presencial", "Híbrido", "Remoto"].map((regime) => (
                            <div key={regime} className="flex items-center space-x-2">
                              <RadioGroupItem value={regime} id={`regime-${regime}`} />
                              <Label htmlFor={`regime-${regime}`} className="cursor-pointer">
                                {regime}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="observacoes_rh"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>13. Observações do RH</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Insira sua resposta"
                          className="min-h-[100px]"
                          {...field}
                          disabled={isReadOnly}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {/* Seção 2 - DEFINIÇÕES DO GESTOR */}
          {currentSection === 2 && (
            <Card>
              <CardHeader className="bg-amber-50 dark:bg-amber-950/20 rounded-t-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
                    <Briefcase className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <CardTitle>Seção 2 — DEFINIÇÕES DO GESTOR</CardTitle>
                    <CardDescription>
                      Informações preenchidas pelo gestor direto
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <FormField
                  control={form.control}
                  name="buddy_mentor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>1. Buddy / Mentor designado</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nome do colaborador que será o mentor"
                          {...field}
                          disabled={isReadOnly}
                        />
                      </FormControl>
                      <FormDescription>
                        Pessoa que irá acompanhar o novo colaborador nas primeiras semanas
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="equipamentos_necessarios"
                  render={() => (
                    <FormItem>
                      <FormLabel>
                        2. Equipamentos necessários <span className="text-destructive">*</span>
                      </FormLabel>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                        {EQUIPAMENTOS_OPTIONS.map((item) => (
                          <FormField
                            key={item.value}
                            control={form.control}
                            name="equipamentos_necessarios"
                            render={({ field }) => (
                              <FormItem
                                key={item.value}
                                className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(item.value)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, item.value])
                                        : field.onChange(
                                          field.value?.filter((value) => value !== item.value)
                                        );
                                    }}
                                    disabled={isReadOnly}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">
                                  {item.label}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="softwares_necessarios"
                  render={() => (
                    <FormItem>
                      <FormLabel>
                        3. Softwares necessários <span className="text-destructive">*</span>
                      </FormLabel>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                        {SOFTWARES_OPTIONS.map((item) => (
                          <FormField
                            key={item.value}
                            control={form.control}
                            name="softwares_necessarios"
                            render={({ field }) => (
                              <FormItem
                                key={item.value}
                                className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(item.value)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, item.value])
                                        : field.onChange(
                                          field.value?.filter((value) => value !== item.value)
                                        );
                                    }}
                                    disabled={isReadOnly}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">
                                  {item.label}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="acessos_necessarios"
                  render={() => (
                    <FormItem>
                      <FormLabel>
                        4. Acessos necessários <span className="text-destructive">*</span>
                      </FormLabel>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                        {ACESSOS_OPTIONS.map((item) => (
                          <FormField
                            key={item.value}
                            control={form.control}
                            name="acessos_necessarios"
                            render={({ field }) => (
                              <FormItem
                                key={item.value}
                                className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(item.value)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, item.value])
                                        : field.onChange(
                                          field.value?.filter((value) => value !== item.value)
                                        );
                                    }}
                                    disabled={isReadOnly}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">
                                  {item.label}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>

                      {/* Campo condicional para Sharepoint */}
                      {form.watch("acessos_necessarios")?.includes("Pastas de Rede / Sharepoint") && (
                        <FormField
                          control={form.control}
                          name="sharepoint_pasta"
                          render={({ field }) => (
                            <FormItem className="mt-3 pl-4 border-l-2 border-primary/30">
                              <FormLabel>
                                Pasta do Sharepoint <span className="text-destructive">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Ex: /Documentos/Projeto/Equipe"
                                  disabled={isReadOnly}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      {/* Campo condicional para Outros */}
                      {form.watch("acessos_necessarios")?.includes("Outros") && (
                        <FormField
                          control={form.control}
                          name="outros_acessos"
                          render={({ field }) => (
                            <FormItem className="mt-3 pl-4 border-l-2 border-primary/30">
                              <FormLabel>
                                Especifique outros acessos <span className="text-destructive">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Descreva os outros acessos necessários..."
                                  disabled={isReadOnly}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="necessita_impressora"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        5. Necessita impressora? <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-wrap gap-4"
                          disabled={isReadOnly}
                        >
                          {["Sim", "Nao"].map((opcao) => (
                            <div key={opcao} className="flex items-center space-x-2">
                              <RadioGroupItem value={opcao} id={`impressora-${opcao}`} />
                              <Label htmlFor={`impressora-${opcao}`} className="cursor-pointer">
                                {opcao === "Nao" ? "Não" : opcao}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="observacoes_gestor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>6. Observações do Gestor</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Insira sua resposta"
                          className="min-h-[100px]"
                          {...field}
                          disabled={isReadOnly}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {/* Seção 3 - TECNOLOGIA DA INFORMAÇÃO (TI) */}
          {currentSection === 3 && (
            <Card>
              <CardHeader className="bg-purple-50 dark:bg-purple-950/20 rounded-t-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <Monitor className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <CardTitle>Seção 3 — TECNOLOGIA DA INFORMAÇÃO (TI)</CardTitle>
                    <CardDescription>
                      Configurações técnicas realizadas pela equipe de TI
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">

                {/* 1. Conta AD criada */}
                <FormField
                  control={form.control}
                  name="conta_ad_criada"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        1. Conta AD criada? <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-wrap gap-4"
                          disabled={isReadOnly}
                        >
                          {[
                            { value: "Sim", label: "Sim" },
                            { value: "Nao", label: "Não" },
                            { value: "NaoAplica", label: "Não se aplica" },
                          ].map((opcao) => (
                            <div key={opcao.value} className="flex items-center space-x-2">
                              <RadioGroupItem value={opcao.value} id={`conta-ad-${opcao.value}`} />
                              <Label htmlFor={`conta-ad-${opcao.value}`} className="cursor-pointer">
                                {opcao.label}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 2. E-mail corporativo criado */}
                <FormField
                  control={form.control}
                  name="email_corporativo_criado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        2. E-mail corporativo criado? <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-wrap gap-4"
                          disabled={isReadOnly}
                        >
                          {[
                            { value: "Sim", label: "Sim" },
                            { value: "Nao", label: "Não" },
                            { value: "NaoAplica", label: "Não se aplica" },
                          ].map((opcao) => (
                            <div key={opcao.value} className="flex items-center space-x-2">
                              <RadioGroupItem value={opcao.value} id={`email-corp-${opcao.value}`} />
                              <Label htmlFor={`email-corp-${opcao.value}`} className="cursor-pointer">
                                {opcao.label}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 3. Licença Microsoft 365 aplicada */}
                <FormField
                  control={form.control}
                  name="licencas_microsoft365"
                  render={() => (
                    <FormItem>
                      <FormLabel>
                        3. Licença Microsoft 365 aplicada? <span className="text-destructive">*</span>
                      </FormLabel>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                        {LICENCAS_MICROSOFT365_OPTIONS.map((item) => (
                          <FormField
                            key={item.value}
                            control={form.control}
                            name="licencas_microsoft365"
                            render={({ field }) => (
                              <FormItem
                                key={item.value}
                                className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(item.value)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...(field.value || []), item.value])
                                        : field.onChange(
                                          field.value?.filter((value) => value !== item.value)
                                        );
                                    }}
                                    disabled={isReadOnly}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">
                                  {item.label}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 4. VPN configurada */}
                <FormField
                  control={form.control}
                  name="vpn_configurada"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        4. VPN configurada? <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-wrap gap-4"
                          disabled={isReadOnly}
                        >
                          {[
                            { value: "Sim", label: "Sim" },
                            { value: "Nao", label: "Não" },
                            { value: "NaoAplica", label: "Não se aplica" },
                          ].map((opcao) => (
                            <div key={opcao.value} className="flex items-center space-x-2">
                              <RadioGroupItem value={opcao.value} id={`vpn-${opcao.value}`} />
                              <Label htmlFor={`vpn-${opcao.value}`} className="cursor-pointer">
                                {opcao.label}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 5. Softwares instalados */}
                <FormField
                  control={form.control}
                  name="softwares_instalados"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        5. Softwares instalados? <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-wrap gap-4"
                          disabled={isReadOnly}
                        >
                          {["Sim", "Nao"].map((opcao) => (
                            <div key={opcao} className="flex items-center space-x-2">
                              <RadioGroupItem value={opcao} id={`softwares-${opcao}`} />
                              <Label htmlFor={`softwares-${opcao}`} className="cursor-pointer">
                                {opcao === "Nao" ? "Não" : opcao}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 6. Usuário SAP B1 criado */}
                <FormField
                  control={form.control}
                  name="usuario_sap_criado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        6. Usuário SAP B1 criado? <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-wrap gap-4"
                          disabled={isReadOnly}
                        >
                          {[
                            { value: "Sim", label: "Sim" },
                            { value: "Nao", label: "Não" },
                            { value: "NaoAplica", label: "Não se aplica" },
                          ].map((opcao) => (
                            <div key={opcao.value} className="flex items-center space-x-2">
                              <RadioGroupItem value={opcao.value} id={`sap-${opcao.value}`} />
                              <Label htmlFor={`sap-${opcao.value}`} className="cursor-pointer">
                                {opcao.label}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 7. Perfil Salesforce criado */}
                <FormField
                  control={form.control}
                  name="perfil_salesforce_criado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        7. Perfil Salesforce criado? <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-wrap gap-4"
                          disabled={isReadOnly}
                        >
                          {[
                            { value: "Sim", label: "Sim" },
                            { value: "Nao", label: "Não" },
                            { value: "NaoAplica", label: "Não se aplica" },
                          ].map((opcao) => (
                            <div key={opcao.value} className="flex items-center space-x-2">
                              <RadioGroupItem value={opcao.value} id={`salesforce-${opcao.value}`} />
                              <Label htmlFor={`salesforce-${opcao.value}`} className="cursor-pointer">
                                {opcao.label}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 8. Pastas de rede liberadas */}
                <FormField
                  control={form.control}
                  name="pastas_rede_liberadas"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        8. Pastas de rede liberadas? <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-wrap gap-4"
                          disabled={isReadOnly}
                        >
                          {["Sim", "Nao"].map((opcao) => (
                            <div key={opcao} className="flex items-center space-x-2">
                              <RadioGroupItem value={opcao} id={`pastas-rede-${opcao}`} />
                              <Label htmlFor={`pastas-rede-${opcao}`} className="cursor-pointer">
                                {opcao === "Nao" ? "Não" : opcao}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 9. Impressoras configuradas */}
                <FormField
                  control={form.control}
                  name="impressoras_configuradas"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        9. Impressoras configuradas? <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-wrap gap-4"
                          disabled={isReadOnly}
                        >
                          {["Sim", "Nao"].map((opcao) => (
                            <div key={opcao} className="flex items-center space-x-2">
                              <RadioGroupItem value={opcao} id={`impressoras-${opcao}`} />
                              <Label htmlFor={`impressoras-${opcao}`} className="cursor-pointer">
                                {opcao === "Nao" ? "Não" : opcao}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 10. Testes gerais realizados */}
                <FormField
                  control={form.control}
                  name="testes_gerais_realizados"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        10. Testes gerais realizados? <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-wrap gap-4"
                          disabled={isReadOnly}
                        >
                          {["Sim", "Nao"].map((opcao) => (
                            <div key={opcao} className="flex items-center space-x-2">
                              <RadioGroupItem value={opcao} id={`testes-${opcao}`} />
                              <Label htmlFor={`testes-${opcao}`} className="cursor-pointer">
                                {opcao === "Nao" ? "Não" : opcao}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 11. Observações da TI */}
                <FormField
                  control={form.control}
                  name="observacoes_ti"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>11. Observações da TI</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Insira sua resposta"
                          className="min-h-[100px]"
                          {...field}
                          disabled={isReadOnly}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {/* Seção 4 - COLABORADOR */}
          {currentSection === 4 && (
            <Card>
              <CardHeader className="bg-green-50 dark:bg-green-950/20 rounded-t-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <CardTitle>Seção 4 — COLABORADOR</CardTitle>
                    <CardDescription>
                      Confirmações finais do colaborador
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {/* 1. Confirmo o recebimento dos equipamentos */}
                <FormField
                  control={form.control}
                  name="confirma_recebimento_equipamentos"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>1. Confirmo o recebimento dos equipamentos</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-wrap gap-4"
                          disabled={isReadOnly}
                        >
                          {["Sim", "Nao"].map((opcao) => (
                            <div key={opcao} className="flex items-center space-x-2">
                              <RadioGroupItem value={opcao} id={`equipamentos-${opcao}`} />
                              <Label htmlFor={`equipamentos-${opcao}`} className="cursor-pointer">
                                {opcao === "Nao" ? "Não" : opcao}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 2. Confirmo funcionamento dos acessos */}
                <FormField
                  control={form.control}
                  name="confirma_funcionamento_acessos"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>2. Confirmo funcionamento dos acessos</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-wrap gap-4"
                          disabled={isReadOnly}
                        >
                          {["Sim", "Nao"].map((opcao) => (
                            <div key={opcao} className="flex items-center space-x-2">
                              <RadioGroupItem value={opcao} id={`acessos-${opcao}`} />
                              <Label htmlFor={`acessos-${opcao}`} className="cursor-pointer">
                                {opcao === "Nao" ? "Não" : opcao}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 3. Recebi orientação sobre os sistemas */}
                <FormField
                  control={form.control}
                  name="recebeu_orientacao_sistemas"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>3. Recebi orientação sobre os sistemas</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-wrap gap-4"
                          disabled={isReadOnly}
                        >
                          {["Sim", "Nao"].map((opcao) => (
                            <div key={opcao} className="flex items-center space-x-2">
                              <RadioGroupItem value={opcao} id={`orientacao-${opcao}`} />
                              <Label htmlFor={`orientacao-${opcao}`} className="cursor-pointer">
                                {opcao === "Nao" ? "Não" : opcao}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 4. Sei como solicitar suporte técnico */}
                <FormField
                  control={form.control}
                  name="sabe_solicitar_suporte"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>4. Sei como solicitar suporte técnico</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-wrap gap-4"
                          disabled={isReadOnly}
                        >
                          {["Sim", "Nao"].map((opcao) => (
                            <div key={opcao} className="flex items-center space-x-2">
                              <RadioGroupItem value={opcao} id={`suporte-${opcao}`} />
                              <Label htmlFor={`suporte-${opcao}`} className="cursor-pointer">
                                {opcao === "Nao" ? "Não" : opcao}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 5. Observações do colaborador */}
                <FormField
                  control={form.control}
                  name="observacoes_colaborador"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>5. Observações do colaborador</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Insira sua resposta"
                          className="min-h-[100px]"
                          {...field}
                          disabled={isReadOnly}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {userRole !== 'rh' && currentSection > 1 && (
                <Button type="button" variant="outline" onClick={handlePrevious}>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Anterior
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              {onSaveDraft && userRole !== 'rh' && (
                <Button type="button" variant="outline" onClick={handleSaveDraft}>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Rascunho
                </Button>
              )}

              {userRole === 'rh' ? (
                <Button type="submit" className="bg-primary hover:bg-primary/90">
                  <Send className="h-4 w-4 mr-2" />
                  Enviar
                </Button>
              ) : currentSection < sections.length ? (
                <Button type="button" onClick={handleNext}>
                  Próximo
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Formulário
                </Button>
              )}
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
