import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AdmissionNotificationRequest {
  email: string;
  employeeName: string;
  department: string;
  targetStep: string;
  linkToken: string;
  baseUrl: string;
  managerName?: string;
  position?: string;
}

const stepLabels: Record<string, string> = {
  gestor: "Gestor",
  ti: "TI",
  rh_review: "Revisão RH",
  colaborador: "Colaborador",
};

const stepDescriptions: Record<string, string> = {
  gestor: "definir os equipamentos, softwares e acessos necessários para o novo colaborador",
  ti: "configurar os acessos, e-mail e sistemas do novo colaborador",
  rh_review: "revisar as informações e enviar o checklist para o colaborador",
  colaborador: "confirmar o recebimento dos equipamentos e orientações",
};

const handler = async (req: Request): Promise<Response> => {
  console.log("send-admission-notification function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not configured");
    return new Response(
      JSON.stringify({ success: false, error: "Email service not configured" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  try {
    const { 
      email, 
      employeeName, 
      department, 
      targetStep, 
      linkToken, 
      baseUrl,
      managerName,
      position 
    }: AdmissionNotificationRequest = await req.json();

    console.log("Processing admission notification for:", email, "Step:", targetStep);

    const stepLabel = stepLabels[targetStep] || targetStep;
    const stepDescription = stepDescriptions[targetStep] || "preencher sua parte do checklist";
    
    // Build the admission link based on the step
    let admissionLink = baseUrl;
    if (targetStep === 'gestor') {
      admissionLink = `${baseUrl}/crm/${department}/admissao?token=${linkToken}`;
    } else if (targetStep === 'ti') {
      admissionLink = `${baseUrl}/crm/tech/admissao?token=${linkToken}`;
    } else if (targetStep === 'rh_review') {
      admissionLink = `${baseUrl}/crm/rh/admissao?token=${linkToken}`;
    } else if (targetStep === 'colaborador') {
      admissionLink = `${baseUrl}/crm/admissao/colaborador?token=${linkToken}`;
    }

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 40px 20px;">
              <table role="presentation" style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #c5a47e 0%, #d4b896 100%); padding: 40px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 300;">MedBeauty</h1>
                    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 14px;">Checklist de Admissão</p>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="color: #333; margin: 0 0 20px; font-size: 22px; font-weight: 600;">
                      📋 Nova Etapa de Admissão Pendente
                    </h2>
                    
                    <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                      Olá,
                    </p>
                    
                    <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                      O processo de admissão de <strong style="color: #333;">${employeeName}</strong> 
                      ${position ? `para o cargo de <strong style="color: #333;">${position}</strong>` : ''} 
                      chegou à etapa de <strong style="color: #c5a47e;">${stepLabel}</strong>.
                    </p>
                    
                    <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
                      Sua tarefa é <strong>${stepDescription}</strong>.
                    </p>
                    
                    <!-- Info Box -->
                    <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin: 0 0 30px;">
                      <table role="presentation" style="width: 100%;">
                        <tr>
                          <td style="padding: 5px 0;">
                            <span style="color: #888; font-size: 14px;">Colaborador:</span>
                            <strong style="color: #333; float: right;">${employeeName}</strong>
                          </td>
                        </tr>
                        ${position ? `
                        <tr>
                          <td style="padding: 5px 0; border-top: 1px solid #eee;">
                            <span style="color: #888; font-size: 14px;">Cargo:</span>
                            <strong style="color: #333; float: right;">${position}</strong>
                          </td>
                        </tr>
                        ` : ''}
                        <tr>
                          <td style="padding: 5px 0; border-top: 1px solid #eee;">
                            <span style="color: #888; font-size: 14px;">Departamento:</span>
                            <strong style="color: #333; float: right;">${department}</strong>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 5px 0; border-top: 1px solid #eee;">
                            <span style="color: #888; font-size: 14px;">Etapa Atual:</span>
                            <strong style="color: #c5a47e; float: right;">${stepLabel}</strong>
                          </td>
                        </tr>
                      </table>
                    </div>
                    
                    <!-- CTA Button -->
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="${admissionLink}" style="display: inline-block; background: linear-gradient(135deg, #c5a47e 0%, #d4b896 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 15px rgba(197, 164, 126, 0.4);">
                        Preencher Checklist
                      </a>
                    </div>
                    
                    <p style="color: #888; font-size: 14px; text-align: center; margin: 20px 0 0;">
                      Ou copie e cole este link no navegador:<br>
                      <a href="${admissionLink}" style="color: #c5a47e; word-break: break-all;">${admissionLink}</a>
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #eee;">
                    <p style="color: #888; font-size: 12px; margin: 0;">
                      Este é um email automático do sistema de admissão MedBeauty.
                    </p>
                    <p style="color: #888; font-size: 12px; margin: 10px 0 0;">
                      © ${new Date().getFullYear()} MedBeauty. Todos os direitos reservados.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "MedBeauty Admissão <onboarding@resend.dev>",
        to: [email],
        subject: `📋 Checklist de Admissão - ${employeeName} - Etapa ${stepLabel}`,
        html: emailHtml,
      }),
    });

    const emailResult = await emailResponse.json();
    console.log("Email send result:", emailResult);

    if (!emailResponse.ok) {
      throw new Error(emailResult.message || "Failed to send email");
    }

    return new Response(
      JSON.stringify({ success: true, messageId: emailResult.id }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error sending admission notification:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
