import type { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CheckCircle2, FileSignature } from "lucide-react";

interface StepColaboradorProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form: UseFormReturn<any>;
    isReadOnly: boolean;
    onSign: () => void;
    isSigning: boolean;
}

export function StepColaborador({ form, isReadOnly, onSign, isSigning }: StepColaboradorProps) {
    const termoAssinado = form.watch("termo_assinado");

    return (
        <Card>
            <CardHeader className="bg-rose-gold/10 dark:bg-rose-gold/20 rounded-t-lg border-b border-rose-gold/10">
                <CardTitle>Confirmação do Colaborador</CardTitle>
                <CardDescription>
                    Por favor, confirme o recebimento dos itens e assine o termo de responsabilidade.
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
                <FormField
                    control={form.control}
                    name="confirma_recebimento_equipamentos"
                    render={({ field }) => (
                        <FormItem className="space-y-3 rounded-md border p-4">
                            <FormLabel className="text-base">
                                1. Confirmo que recebi os equipamentos listados acima em bom estado de conservação.
                            </FormLabel>
                            <FormControl>
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-6" disabled={isReadOnly}>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="Sim" id="conf-equip-sim" />
                                        <Label htmlFor="conf-equip-sim">Sim, confirmo</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="Nao" id="conf-equip-nao" />
                                        <Label htmlFor="conf-equip-nao">Não recebi/Há problemas</Label>
                                    </div>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="confirma_funcionamento_acessos"
                    render={({ field }) => (
                        <FormItem className="space-y-3 rounded-md border p-4">
                            <FormLabel className="text-base">
                                2. Confirmo que meus acessos (Email, AD, Softwares) foram testados e estão funcionais.
                            </FormLabel>
                            <FormControl>
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-6" disabled={isReadOnly}>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="Sim" id="conf-acesso-sim" />
                                        <Label htmlFor="conf-acesso-sim">Sim, confirmo</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="Nao" id="conf-acesso-nao" />
                                        <Label htmlFor="conf-acesso-nao">Não consigo acessar</Label>
                                    </div>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="recebeu_orientacao_sistemas"
                    render={({ field }) => (
                        <FormItem className="space-y-3 rounded-md border p-4">
                            <FormLabel className="text-base">
                                3. Recebi orientações básicas sobre segurança da informação e uso dos sistemas.
                            </FormLabel>
                            <FormControl>
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-6" disabled={isReadOnly}>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="Sim" id="conf-orient-sim" />
                                        <Label htmlFor="conf-orient-sim">Sim, confirmo</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="Nao" id="conf-orient-nao" />
                                        <Label htmlFor="conf-orient-nao">Ainda não</Label>
                                    </div>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="bg-muted p-6 rounded-lg text-center space-y-4">
                    <h3 className="text-lg font-semibold">Termo de Responsabilidade e Uso de Equipamentos</h3>
                    <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
                        Para finalizar o processo de admissão e entrega de equipamentos, é necessário assinar digitalmente o Termo de Responsabilidade através da plataforma DocuSign.
                    </p>

                    {termoAssinado ? (
                        <div className="flex flex-col items-center justify-center gap-2 text-green-600 bg-green-50 p-4 rounded-lg border border-green-200">
                            <CheckCircle2 className="w-8 h-8" />
                            <span className="font-bold">Termo Assinado com Sucesso!</span>
                            <span className="text-xs text-green-700">O documento foi arquivado automaticamente.</span>
                        </div>
                    ) : (
                        <div className="pt-2">
                            <Button
                                type="button"
                                onClick={onSign}
                                disabled={isSigning || isReadOnly || termoAssinado}
                                className="bg-[#4C00FF] hover:bg-[#3900BF] text-white px-8 h-12 text-lg shadow-lg hover:shadow-xl transition-all"
                            >
                                {isSigning ? (
                                    <>Enviando para DocuSign...</>
                                ) : (
                                    <><FileSignature className="mr-2 h-5 w-5" /> Assinar via DocuSign</>
                                )}
                            </Button>
                            <p className="text-xs text-muted-foreground mt-2">
                                Você será redirecionado para assinar ou receberá um e-mail.
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
