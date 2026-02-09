import { useState, useEffect } from "react";
import type { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

const INVENTORY_TYPES = ["Notebook", "Tablet", "Celular"];

const VEHICLE_TYPE = "Carro Corporativo"; // Special handling for cars

interface StepTIProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form: UseFormReturn<any>;
    isReadOnly: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    availableAssets: any[];
}

export function StepTI({ form, isReadOnly, availableAssets }: StepTIProps) {
    const equipamentosNecessarios = form.watch("equipamentos_necessarios") || [];
    const softwaresNecessarios = form.watch("softwares_necessarios") || [];
    const necessitaVpn = form.watch("necessita_vpn");


    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [availableVehicles, setAvailableVehicles] = useState<any[]>([]);

    useEffect(() => {
        if (equipamentosNecessarios.includes(VEHICLE_TYPE)) {
            const fetchVehicles = async () => {
                const { data } = await supabase
                    .from('vehicles')
                    .select('*')
                    .eq('status', 'available');

                if (data) setAvailableVehicles(data);
            };
            fetchVehicles();
        }
    }, [equipamentosNecessarios]);

    return (
        <Card>
            <CardHeader className="bg-rose-gold/10 dark:bg-rose-gold/20 rounded-t-lg border-b border-rose-gold/10">
                <CardTitle>Configuração de TI & Facilities</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-8">
                {/* 1. Atribuição de Ativos e Veículos */}
                <div className="space-y-4 p-4 border rounded-lg bg-gray-50 dark:bg-zinc-900 border-gray-200 dark:border-zinc-800">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        📦 Atribuição de Equipamentos
                    </h3>

                    {/* Standard Assets */}
                    {equipamentosNecessarios.filter((eq: string) => INVENTORY_TYPES.includes(eq)).map((eq: string) => (
                        <FormField
                            key={eq}
                            control={form.control}
                            name={`equipamentos_definidos.${eq}`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Selecionar {eq}</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger disabled={isReadOnly}>
                                                <SelectValue placeholder={`Selecione um ${eq} do estoque`} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                            {availableAssets
                                                .filter((asset: any) => asset.device_type === eq || asset.device_type === eq.toLowerCase())
                                                /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                                                .map((asset: any) => (
                                                    <SelectItem key={asset.id} value={asset.asset_tag}>
                                                        {asset.asset_tag} - {asset.model}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    ))}

                    {/* Vehicles */}
                    {equipamentosNecessarios.includes(VEHICLE_TYPE) && (
                        <FormField
                            control={form.control}
                            name="equipamentos_definidos.Veiculo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Selecionar Veículo</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger disabled={isReadOnly}>
                                                <SelectValue placeholder="Selecione um veículo da frota" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {availableVehicles.length === 0 ? (
                                                <SelectItem value="none">Nenhum veículo disponível</SelectItem>
                                            ) : (
                                                /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                                                availableVehicles.map((vehicle: any) => (
                                                    <SelectItem key={vehicle.id} value={vehicle.plate}>
                                                        {vehicle.model} - {vehicle.plate} ({vehicle.location})
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}

                    {equipamentosNecessarios.filter((eq: string) => INVENTORY_TYPES.includes(eq) || eq === VEHICLE_TYPE).length === 0 && (
                        <p className="text-muted-foreground italic text-sm">Nenhum equipamento rastreável ou veículo solicitado.</p>
                    )}


                    {/* 2. Configurações de Acesso */}
                    <div className="space-y-4 pt-4 border-t">
                        <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                            Entregas de Periféricos (Não Rastreáveis)
                        </h4>
                        {equipamentosNecessarios.filter((eq: string) => !INVENTORY_TYPES.includes(eq) && eq !== VEHICLE_TYPE).map((eq: string) => (
                            <FormField
                                key={eq}
                                control={form.control}
                                name={`status_perifericos.${eq}`}
                                render={({ field }) => (
                                    <FormItem className="flex items-center justify-between p-2 border rounded bg-white">
                                        <FormLabel className="flex-1">{eq}</FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                className="flex space-x-4"
                                                disabled={isReadOnly}
                                            >
                                                <FormItem className="flex items-center space-x-2">
                                                    <FormControl><RadioGroupItem value="Sim" /></FormControl>
                                                    <Label className="cursor-pointer">Entregue</Label>
                                                </FormItem>
                                                <FormItem className="flex items-center space-x-2">
                                                    <FormControl><RadioGroupItem value="Nao" /></FormControl>
                                                    <Label className="cursor-pointer">Pendente</Label>
                                                </FormItem>
                                            </RadioGroup>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        ))}
                    </div>

                </div>

                {/* 2. Checklist Técnico */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        🔧 Configurações e Acessos
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="conta_ad_criada"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Conta AD Criada?</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl><SelectTrigger disabled={isReadOnly}><SelectValue placeholder="Status" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="Sim">Sim</SelectItem>
                                            <SelectItem value="Nao">Não</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {field.value === "Sim" && (
                                        <Input
                                            placeholder="Detalhes (Login)"
                                            className="mt-2"
                                            {...form.register("detalhes_conta_ad")}
                                            readOnly={isReadOnly}
                                        />
                                    )}
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="email_corporativo_criado"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email Criado?</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl><SelectTrigger disabled={isReadOnly}><SelectValue placeholder="Status" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="Sim">Sim</SelectItem>
                                            <SelectItem value="Nao">Não</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {field.value === "Sim" && (
                                        <Input
                                            placeholder="Email (usuario@medbeauty.com.br)"
                                            className="mt-2"
                                            {...form.register("detalhes_email")}
                                            readOnly={isReadOnly}
                                        />
                                    )}
                                </FormItem>
                            )}
                        />

                        {softwaresNecessarios.includes("SAP B1") && (
                            <FormField
                                control={form.control}
                                name="usuario_sap_criado"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Usuário SAP Criado?</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl><SelectTrigger disabled={isReadOnly}><SelectValue placeholder="Status" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="Sim">Sim</SelectItem>
                                                <SelectItem value="Nao">Não</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {field.value === "Sim" && (
                                            <Input
                                                placeholder="Licença / ID"
                                                className="mt-2"
                                                {...form.register("detalhes_sap")}
                                                readOnly={isReadOnly}
                                            />
                                        )}
                                    </FormItem>
                                )}
                            />
                        )}

                        {softwaresNecessarios.includes("Salesforce") && (
                            <FormField
                                control={form.control}
                                name="perfil_salesforce_criado"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Perfil Salesforce?</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl><SelectTrigger disabled={isReadOnly}><SelectValue placeholder="Status" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="Sim">Sim</SelectItem>
                                                <SelectItem value="Nao">Não</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {field.value === "Sim" && (
                                            <Input
                                                placeholder="Perfil Atribuído"
                                                className="mt-2"
                                                {...form.register("detalhes_salesforce")}
                                                readOnly={isReadOnly}
                                            />
                                        )}
                                    </FormItem>
                                )}
                            />
                        )}

                        {necessitaVpn === "Sim" && (
                            <FormField
                                control={form.control}
                                name="vpn_configurada"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>VPN Configurada?</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl><SelectTrigger disabled={isReadOnly}><SelectValue placeholder="Status" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="Sim">Sim</SelectItem>
                                                <SelectItem value="Nao">Não</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />
                        )}

                        <FormField
                            control={form.control}
                            name="testes_gerais_realizados"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Testes de Acesso Realizados?</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl><SelectTrigger disabled={isReadOnly}><SelectValue placeholder="Status" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="Sim">Sim</SelectItem>
                                            <SelectItem value="Nao">Não</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {field.value === "Sim" && (
                                        <Input
                                            placeholder="Responsável pelos testes"
                                            className="mt-2"
                                            {...form.register("detalhes_testes")}
                                            readOnly={isReadOnly}
                                        />
                                    )}
                                </FormItem>
                            )}
                        />

                    </div>
                </div>

                <FormField
                    control={form.control}
                    name="observacoes_ti"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Observações Técnicas</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Informações adicionais sobre a configuração..."
                                    className="resize-none"
                                    {...field}
                                    readOnly={isReadOnly}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>
    );
}
