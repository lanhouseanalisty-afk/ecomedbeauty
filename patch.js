const fs = require('fs');
const file = 'src/components/crm/DepartmentAdmissaoPage.tsx';
let txt = fs.readFileSync(file, 'utf8');

// 1. Add States
txt = txt.replace('const [selectedProcess, setSelectedProcess] = useState<string | null>(null);', 
\const [selectedProcess, setSelectedProcess] = useState<string | null>(null);
  const [isSigningDialogOpen, setIsSigningDialogOpen] = useState(false);
  const [newSignerEmail, setNewSignerEmail] = useState("");
  const [activeProcessForDocusign, setActiveProcessForDocusign] = useState<any>(null);

  const sendToDocuSign = async () => {
    if (!newSignerEmail) {
      toast.error("Por favor, informe o e-mail do colaborador.");
      return;
    }
    setIsSigningDialogOpen(false);
    try {
      toast.loading("Enviando Termo de Responsabilidade via DocuSign...");
      const payload = {
         ...activeProcessForDocusign,
         employeeEmail: newSignerEmail
      };
      
      const { data: docusignData, error: docusignError } = await supabase.functions.invoke('docusign-termo-responsabilidade', {
        body: payload
      });
      
      toast.dismiss();
      if (docusignError) {
        let errorMessage = "Falha ao enviar DocuSign.";
        try {
          const errorParsed = JSON.parse(docusignError.message || String(docusignError)) || {};
          if (errorParsed && errorParsed.error) errorMessage += \\\ Resumo: \\\\\\;
          else if (docusignError.message) errorMessage += \\\ Resumo: \\\\\\;
        } catch (e) {
          if (docusignError.message) errorMessage += \\\ Resumo: \\\\\\;
        }
        toast.error(errorMessage, { duration: 10000 });
      } else if (docusignData?.error) {
        toast.error(\\\DocuSign: \\\\\\, { duration: 10000 });
      } else {
        toast.success("Termo enviado para o e-mail com sucesso!");
      }
    } catch (err) {
      toast.dismiss();
      toast.error(\\\Erro ao integrar com DocuSign: \\\\\\, { duration: 10000 });
    }
  };\);

// 2. Replace handleITSubmit logic
const submitLogicOld = \          // DOCUSIGN AUTOMATION: Generate HTML PDF and send to Email
          try {
            toast.loading("Enviando Termo de Responsabilidade via DocuSign...");
            const selectedAssets = assets.filter(a => assignedAssetIds.includes(a.id));

            // Assume the candidate's email is stored somewhere, e.g., in \\\employee_email\\\ or we can use a dummy for now.
            // If the process has no email, DocuSign needs one. Checking if we have an email in process.
            const candidateEmail = (process as any).email || (process as any).personal_email || itForm.email_created || "reginaldo.mazaro@skinstore.com.br";

            const { data: docusignData, error: docusignError } = await supabase.functions.invoke('docusign-termo-responsabilidade', {
              body: {
                processId: process.id,
                employeeName: process.employee_name,
                employeeCpf: process.cpf,
                employeeEmail: candidateEmail,
                departmentName: process.target_department,
                managerName: process.manager || process.requester_name || "Gestor",
                startDate: process.start_date,
                assetsList: selectedAssets
              }
            });

            toast.dismiss();
            if (docusignError) {
              console.error("DocuSign call error:", docusignError);
              let errorMessage = "Ativos salvos, mas falha ao enviar DocuSign.";
              try {
                const errorParsed = JSON.parse(docusignError.message || docusignError as unknown as string) || {};
                if (errorParsed && errorParsed.error) errorMessage += \\\ Resumo: \\\\\\;
                else if (docusignError.message) errorMessage += \\\ Resumo: \\\\\\;
              } catch (e) {
                if (docusignError.message) errorMessage += \\\ Resumo: \\\\\\;
              }
              toast.error(errorMessage, { duration: 10000 });
            } else if (docusignData?.error) {
              console.error("DocuSign function returned error:", docusignData);
              toast.error(\\\DocuSign: \\\\\\, { duration: 10000 });
            } else {
              toast.success("Termo de Responsabilidade enviado para o e-mail do colaborador!");
            }
          } catch (err: any) {
            toast.dismiss();
            console.error("DocuSign Exception:", err);
            toast.error(\\\Erro ao integrar com DocuSign: \\\\\\, { duration: 10000 });
          }\;

const submitLogicNew = \          // DOCUSIGN MODAL PROMPT
          const candidateEmail = (process as any).email || (process as any).personal_email || itForm.email_created || "";
          const selectedAssets = assets.filter(a => assignedAssetIds.includes(a.id));
          
          setNewSignerEmail(candidateEmail);
          setActiveProcessForDocusign({
            processId: process.id,
            employeeName: process.employee_name,
            employeeCpf: process.cpf,
            departmentName: process.target_department,
            managerName: process.manager || process.requester_name || "Gestor",
            startDate: process.start_date,
            assetsList: selectedAssets
          });
          setIsSigningDialogOpen(true);\;

if(txt.includes('Enviando Termo de Responsabilidade via DocuSign')) {
   txt = txt.replace(submitLogicOld, submitLogicNew);
} else {
   console.log("Could not find old logic");
}

// 3. Add Dialog at the end (before last </div>)
const dialogJSX = \
      {/* Modal de E-mail para DocuSign */}
      <Dialog open={isSigningDialogOpen} onOpenChange={setIsSigningDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Preparar Termo de Responsabilidade</DialogTitle>
            <DialogDescription>
              Os equipamentos foram vinculados. Confirme o e-mail para envio do termo via DocuSign.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>E-mail do Colaborador (Destinatário)</Label>
              <Input
                placeholder="Ex: joao@ecomedbeauty.com.br"
                value={newSignerEmail}
                onChange={(e) => setNewSignerEmail(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSigningDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={sendToDocuSign} className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Send className="h-4 w-4" />
              Enviar para Assinatura
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}\;

txt = txt.replace(/    <\/div>\s*  \);\s*\}\s*$/, dialogJSX);

if (!txt.includes('DialogFooter, DialogDescription')) {
    txt = txt.replace('DialogFooter, DialogDescription } from "@/components/ui/dialog";', 'DialogFooter, DialogDescription } from "@/components/ui/dialog";');     
}

fs.writeFileSync(file, txt);
console.log("File updated via Node!");
