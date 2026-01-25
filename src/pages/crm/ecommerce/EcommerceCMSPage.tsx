import { useState } from "react";
import { Save, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function EcommerceCMSPage() {
    const [settings, setSettings] = useState({
        siteName: "MedBeauty Store",
        primaryColor: "#0f172a"
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="font-serif text-3xl font-bold">CMS & Vitrine</h1>
                    <p className="text-muted-foreground">
                        Personalize a aparência da sua loja.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline">
                        <Globe className="mr-2 h-4 w-4" />
                        Ver Loja
                    </Button>
                    <Button onClick={() => toast.success("Salvo!")}>
                        <Save className="mr-2 h-4 w-4" />
                        Salvar
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Configurações Básicas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2">
                        <Label>Nome do Site</Label>
                        <Input
                            value={settings.siteName}
                            onChange={e => setSettings({ ...settings, siteName: e.target.value })}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Cor Primária</Label>
                        <div className="flex gap-2">
                            <div className="w-10 h-10 rounded border" style={{ backgroundColor: settings.primaryColor }} />
                            <Input
                                type="color"
                                value={settings.primaryColor}
                                onChange={e => setSettings({ ...settings, primaryColor: e.target.value })}
                                className="w-20"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
