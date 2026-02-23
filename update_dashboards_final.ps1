
$dashboards = @(
    @{
        Path        = 'src\pages\crm\tech\TechDashboard.tsx'
        Target      = '<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>'
        Replacement = '<div className="flex gap-2"><Button onClick={() => window.location.href = "/crm/tech/operacoes"} variant="outline" className="gap-2 border-orange-200 hover:border-orange-300 bg-orange-50/30 text-orange-700"><UserPlus className="h-4 w-4" />Admissão & Demissão</Button><Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>'
    },
    @{
        Path        = 'src\pages\crm\admin\AdminCRMDashboard.tsx'
        Target      = '<div className="flex gap-2">'
        Replacement = '<div className="flex gap-2"><Button onClick={() => window.location.href = "/crm/admin/operacoes"} variant="outline" className="gap-2 border-orange-200 hover:border-orange-300 bg-orange-50/30 text-orange-700"><UserPlus className="h-4 w-4" />Admissão & Demissão</Button>'
    },
    @{
        Path        = 'src\pages\crm\admin\CientificaDashboard.tsx'
        Target      = '<div className="flex gap-2">'
        Replacement = '<div className="flex gap-2"><Button onClick={() => window.location.href = "/crm/cientifica/operacoes"} variant="outline" className="gap-2 border-orange-200 hover:border-orange-300 bg-orange-50/30 text-orange-700"><UserPlus className="h-4 w-4" />Admissão & Demissão</Button>'
    },
    @{
        Path        = 'src\pages\legal\LegalDashboard.tsx'
        Target      = '<div className="flex gap-2">'
        Replacement = '<div className="flex gap-2"><Button onClick={() => window.location.href = "/crm/juridico/operacoes"} variant="outline" className="gap-2 border-orange-200 hover:border-orange-300 bg-orange-50/30 text-orange-700"><UserPlus className="h-4 w-4" />Admissão & Demissão</Button>'
    },
    @{
        Path        = 'src\pages\crm\logistica\LogisticaDashboard.tsx'
        Target      = '<div className="flex gap-2">'
        Replacement = '<div className="flex gap-2"><Button onClick={() => window.location.href = "/crm/logistica/operacoes"} variant="outline" className="gap-2 border-orange-200 hover:border-orange-300 bg-orange-50/30 text-orange-700"><UserPlus className="h-4 w-4" />Admissão & Demissão</Button>'
    },
    @{
        Path        = 'src\pages\crm\manutencao\ManutencaoDashboard.tsx'
        Target      = '<div className="flex gap-2">'
        Replacement = '<div className="flex gap-2"><Button onClick={() => window.location.href = "/crm/manutencao/operacoes"} variant="outline" className="gap-2 border-orange-200 hover:border-orange-300 bg-orange-50/30 text-orange-700"><UserPlus className="h-4 w-4" />Admissão & Demissão</Button>'
    }
)

$basePath = 'c:\Users\reginaldo.mazaro\OneDrive - Skinstore S.A\Documentos\GitHub\ecomedbeauty-main\'

foreach ($db in $dashboards) {
    $fullPath = Join-Path $basePath $db.Path
    if (Test-Path $fullPath) {
        $content = Get-Content $fullPath -Raw
        
        # Add UserPlus import if missing
        if ($content -notmatch 'UserPlus') {
            $content = $content -replace '(} from "lucide-react";)', ", UserPlus`n} from `"lucide-react`";"
        }
        
        if ($content.Contains($db.Target)) {
            $content = $content.Replace($db.Target, $db.Replacement)
            Write-Host "Updated: $($db.Path)"
        }
        else {
            Write-Host "Target not found in: $($db.Path)"
        }
        
        Set-Content $fullPath $content -NoNewline
    }
    else {
        Write-Host "File not found: $($db.Path)"
    }
}
