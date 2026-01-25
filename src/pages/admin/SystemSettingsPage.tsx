import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import { Key, Save, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function SystemSettingsPage() {
    const { settings, isLoading, updateSetting, getSetting } = useSystemSettings();
    const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
    const [editedValues, setEditedValues] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState<Record<string, boolean>>({});

    const apiKeySettings = settings.filter((s) => s.category === "api_keys");

    const handleToggleVisibility = (key: string) => {
        setShowKeys((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const handleValueChange = (key: string, value: string) => {
        setEditedValues((prev) => ({ ...prev, [key]: value }));
    };

    const handleSave = async (key: string) => {
        const value = editedValues[key] !== undefined ? editedValues[key] : getSetting(key) || "";

        setSaving((prev) => ({ ...prev, [key]: true }));
        const success = await updateSetting(key, value);
        setSaving((prev) => ({ ...prev, [key]: false }));

        if (success) {
            // Limpar valor editado após salvar
            setEditedValues((prev) => {
                const newValues = { ...prev };
                delete newValues[key];
                return newValues;
            });
        }
    };

    const getCurrentValue = (key: string): string => {
        return editedValues[key] !== undefined ? editedValues[key] : getSetting(key) || "";
    };

    const hasChanges = (key: string): boolean => {
        return editedValues[key] !== undefined && editedValues[key] !== getSetting(key);
    };

    const maskValue = (value: string): string => {
        if (!value) return "";
        if (value.length <= 8) return "••••••••";
        return value.substring(0, 4) + "••••••••" + value.substring(value.length - 4);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <p className="text-muted-foreground">Carregando configurações...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Configurações do Sistema</h1>
                <p className="text-muted-foreground mt-2">
                    Gerencie chaves de API e outras configurações globais do sistema
                </p>
            </div>

            <Tabs defaultValue="api-keys" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="api-keys" className="flex items-center gap-2">
                        <Key className="h-4 w-4" />
                        Chaves de API
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="api-keys" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Key className="h-5 w-5" />
                                Chaves de API Externas
                            </CardTitle>
                            <CardDescription>
                                Configure as chaves de API para integração com serviços externos
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {apiKeySettings.map((setting) => {
                                const currentValue = getCurrentValue(setting.key);
                                const isVisible = showKeys[setting.key];
                                const isSaving = saving[setting.key];
                                const changed = hasChanges(setting.key);
                                const isEmpty = !currentValue;

                                return (
                                    <div key={setting.id} className="space-y-3">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <Label htmlFor={setting.key} className="text-base font-medium">
                                                        {setting.description || setting.key}
                                                    </Label>
                                                    {isEmpty ? (
                                                        <Badge variant="outline" className="text-xs">
                                                            <AlertCircle className="h-3 w-3 mr-1" />
                                                            Não configurada
                                                        </Badge>
                                                    ) : !changed ? (
                                                        <Badge variant="secondary" className="text-xs">
                                                            <CheckCircle2 className="h-3 w-3 mr-1" />
                                                            Configurada
                                                        </Badge>
                                                    ) : null}
                                                    {changed && (
                                                        <Badge variant="default" className="text-xs">
                                                            Alterada
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    Chave: <code className="text-xs bg-muted px-1 py-0.5 rounded">{setting.key}</code>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <div className="flex-1 relative">
                                                <Input
                                                    id={setting.key}
                                                    type={isVisible ? "text" : "password"}
                                                    value={currentValue}
                                                    onChange={(e) => handleValueChange(setting.key, e.target.value)}
                                                    placeholder="Cole sua chave de API aqui..."
                                                    className="font-mono text-sm pr-10"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                                                    onClick={() => handleToggleVisibility(setting.key)}
                                                >
                                                    {isVisible ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </div>
                                            <Button
                                                onClick={() => handleSave(setting.key)}
                                                disabled={isSaving || !changed}
                                                size="default"
                                            >
                                                {isSaving ? (
                                                    <>Salvando...</>
                                                ) : (
                                                    <>
                                                        <Save className="h-4 w-4 mr-2" />
                                                        Salvar
                                                    </>
                                                )}
                                            </Button>
                                        </div>

                                        <Separator />
                                    </div>
                                );
                            })}

                            {apiKeySettings.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>Nenhuma chave de API configurada</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Card de Ajuda */}
                    <Card className="border-blue-200 bg-blue-50/50">
                        <CardHeader>
                            <CardTitle className="text-base">💡 Como obter as chaves de API</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div>
                                <p className="font-medium">Google Maps API:</p>
                                <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-2">
                                    <li>Acesse <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Cloud Console</a></li>
                                    <li>Crie um projeto ou selecione um existente</li>
                                    <li>Ative a "Places API"</li>
                                    <li>Vá em "Credentials" e crie uma "API Key"</li>
                                    <li>Copie a chave e cole acima</li>
                                </ol>
                            </div>
                            <Separator />
                            <div>
                                <p className="font-medium">Instagram API:</p>
                                <p className="text-muted-foreground ml-2">Em desenvolvimento - aguarde próximas atualizações</p>
                            </div>
                            <Separator />
                            <div>
                                <p className="font-medium">LinkedIn API:</p>
                                <p className="text-muted-foreground ml-2">Em desenvolvimento - aguarde próximas atualizações</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
