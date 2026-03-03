import { createSign } from "node:crypto";
import { Buffer } from "node:buffer";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper to base64url encode
function base64url(str: string) {
    return btoa(str)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

console.log("Docusign Termo Function Loaded");

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const body = await req.json();
        const { processId, employeeName, employeeCpf, employeeEmail, departmentName, managerName, startDate, assetsList } = body;

        if (!processId || !employeeName || !employeeEmail) {
            return new Response(
                JSON.stringify({ error: "Missing required fields: processId, employeeName, employeeEmail" }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
            );
        }

        // Configuration
        const IK = '05193209-8360-4847-93ce-d614a5880a13';
        const USER_ID = 'ba9ccf8e-cb45-4256-93cb-a06e8ca05261';
        const ACCOUNT_ID = 'd81aebfd-4629-4239-a926-8bfc97c7a22a';
        const BASE_URL = 'https://demo.docusign.net/restapi';
        const AUTH_SERVER = 'account-d.docusign.com';

        // Use the Supabase Project URL for the Webhook
        const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
        const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';

        // DocuSign Connect (Webhook) requires a public HTTPS URL. It will reject 127.0.0.1 or localhost.
        const isLocal = SUPABASE_URL.includes('localhost') || SUPABASE_URL.includes('127.0.0.1') || !SUPABASE_URL;
        const WEBHOOK_URL = isLocal
            ? 'https://example.com/webhook-placeholder'
            : `${SUPABASE_URL}/functions/v1/docusign-webhook`;

        // RSA PRIVATE KEY
        const RSA_KEY = `-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEAgOGyDomOS8g7O9PBiilrI5ui1Kqb6Ne40WaAlOoyJ1NFUxhL
fjDuMc+l4ULnVHf213FIcFudd17nxR7L88As0UU48iahEIuRtBZgIo249szh8eM8
G0PBAcQVGx67dTdfIds96qpTLa2jEAZOSCsupF608nEpIsFVVNJWrCCChbmhz+Yu
kZPEFcR+/NJfuSGJP35QdJWZNg7o7TeviLZy74nPcIXzzzg+gzxvpf9UxfE4fbq/
x1lZPUD+A7pAeT1BZHadfpdWTlEfSWegVKuu0CEjtorS/JkpvKSVQwp8Ukkko9Qf
s/r8W6zTYfGeRtkg+K087bW/KUyq/iLgK43LFQIDAQABAoIBABTocweFtuvCBiNS
BTNMkyt50QQkJgUzkzGGqfRpO+Ks+8bxCYo6wOGcI00fGpfVmwS0xYDTdAEMs0KD
blMoSX0CTayG/25yM0ceXCaENviey0bU9jLMHpBn8YPuoTrw/9dmZwMzR37WYj40
Glioh2QLUy/Y6MimdEPoQumgn9wL7ZNAoDa5tQpzdvA3lMsIqu//pnVX/1CNzy7e
6ou6XzY66Zysw1ywHoW196sSw3f6N2fhM0o4TvdzGWvp203ir0P8xGAXlQttNp38
GkgENRLbcu8gf1VYnrU++/2BtP34evXHy2Y4yFgUPkNBO4CalGVNXkbLa00RQr2+
se0ihA8CgYEAupTrEOxplgSSDXic7RE1tRSKtwypPGuXDHS3Pes2cc0aGEcGtgnC
q3icAVKc3JPy2RXNTDgW7iMf81Yl6/LZBHhuyE+WYDoU5oaOUziibBoCTpHlVTzo
DdB5qXaJwYgBfANCmxDr7XWytBqwrofxbA4+PCutKEOWeCBb6sh5j28CgYEAsNUZ
cZMn5epvMD4wCbfvN26UC1J1UFtoE3MuliSfjYrnDY/pFQDcmQd16TfTBBs9KBEj
OAsMoVdLlGhSlAbKh0TGjxL0Av0uiC8Jb56N/vLVi9iRUXrgUF1w4kalHdNHKKKO
i0lJCLB7+FK7M5x8mt6Zwr1QPbr+puKTCnfLy7sCgYEAmPNS74Cd3ZjJkbl6Cuy8
tkCspfn/EcSxAkj7ngqfixKzfYtb+QZvStmIKZ1rcXbm8QZqUTz5ryWkH3pTg+SD
+qIvTo3Pm/qA/6j2K0qV+0Am+/mlogZXxFtOIJlHvBqd/Oc/RpbMkNCXOgVXKPvP
8OCMLA8x13vwcXE1aHYHEIkCgYBQrzsnzlxDFN/c5FMo7AszgLn+HIa4vqxTS5fz
HAzNGZbpYkOYuMbu8C+F1VnsIr2Z3Y/zT19Y8qrisWMUdbDNXb03pQ8/meQ0cTnd
+zuRG54CbDOKOQXGxYvvQwqt/CwYx2tA9JRlaZl3KdCO8RUN2QnRiG3nbL4qyXEM
MrMDZwKBgEqgRXtzqF5XoY9/RrC2i/Rjyu55g+YoX6AKRQ40GyftmUQxVd84GAaZ
emYqy2YlNy5cq/CFPbcOuJEyVr4705li3C1yx89xuOl6DkKsDuf/T/8d7gn+f0J/
FILA4xy/X69dY0QaacRtU/bGdRpeJQq7TCo1C60fKp19+Yus0+Tf
-----END RSA PRIVATE KEY-----`;

        // 1. JWT Construction
        const header = { alg: "RS256", typ: "JWT" };
        const iat = Math.floor(Date.now() / 1000);
        const exp = iat + 3600;
        const payload = {
            iss: IK,
            sub: USER_ID,
            aud: AUTH_SERVER,
            iat: iat,
            exp: exp,
            scope: "signature impersonation"
        };

        const encodedHeader = base64url(JSON.stringify(header));
        const encodedPayload = base64url(JSON.stringify(payload));
        const dataToSign = `${encodedHeader}.${encodedPayload}`;

        const sign = createSign("RSA-SHA256");
        sign.update(dataToSign);
        const signature = sign.sign(RSA_KEY, "base64")
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');

        const jwt = `${dataToSign}.${signature}`;

        // 2. Token Exchange
        const params = new URLSearchParams();
        params.append('grant_type', 'urn:ietf:params:oauth:grant-type:jwt-bearer');
        params.append('assertion', jwt);

        const tokenReq = await fetch(`https://${AUTH_SERVER}/oauth/token`, {
            method: 'POST',
            body: params
        });

        const tokenData = await tokenReq.json();
        if (!tokenReq.ok) {
            console.error("Auth Error:", JSON.stringify(tokenData));
            throw new Error(`Auth Error: ${tokenData.error_description || tokenData.error}`);
        }

        const accessToken = tokenData.access_token;

        // 3. Construct HTML Document dynamically
        let assetsHtml = "<p>Nenhum equipamento vinculado.</p>";
        if (assetsList && assetsList.length > 0) {
            assetsHtml = `
            <table border="1" cellpadding="8" cellspacing="0" style="width: 100%; border-collapse: collapse; font-family: sans-serif; text-align: left;">
                <tr style="background-color: #f2f2f2;">
                    <th>Patrimônio / TAG</th>
                    <th>Tipo</th>
                    <th>Marca/Modelo</th>
                    <th>Nº Série</th>
                </tr>
                ${assetsList.map((a: any) => `
                <tr>
                    <td>${a.asset_tag || "N/A"}</td>
                    <td>${a.device_type || "Equipamento"}</td>
                    <td>${a.brand || ""} ${a.model || ""}</td>
                    <td>${a.serial_number || "N/A"}</td>
                </tr>
                `).join('')}
            </table>`;
        }

        const hoje = new Date().toLocaleDateString('pt-BR');

        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Termo de Responsabilidade</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; color: #333; }
                p { margin-bottom: 20px; text-align: justify; }
                h1 { text-align: center; margin-bottom: 40px; font-size: 20px; text-transform: uppercase; }
                .bold { font-weight: bold; }
                .signature-box { margin-top: 80px; text-align: center; }
            </style>
        </head>
        <body>
            <h1>TERMO DE RESPONSABILIDADE E ENTREGA DE EQUIPAMENTOS</h1>
            <p>Pelo presente instrumento, declaro que estou recebendo da <strong>EcomedBeauty</strong>, os equipamentos/materiais abaixo especificados para serem utilizados estritamente no desempenho das minhas atividades profissionais.</p>
            
            <p>
                <strong>Nome do Colaborador:</strong> ${employeeName}<br>
                <strong>CPF:</strong> ${employeeCpf || 'Não informado'}<br>
                <strong>Setor:</strong> ${departmentName || 'Não informado'}<br>
                <strong>Gestor:</strong> ${managerName || 'Não informado'}<br>
                <strong>Data de Início:</strong> ${startDate || 'Não informada'}<br>
            </p>

            <p><strong>RELAÇÃO DE EQUIPAMENTOS ENTREGUES:</strong></p>
            ${assetsHtml}

            <p style="margin-top: 30px;">
                <strong>TERMOS E CONDIÇÕES:</strong><br><br>
                1. Assumo total responsabilidade pela guarda, conservação e uso adequado do(s) equipamento(s) acima descrito(s).<br>
                2. Comprometo-me a não realizar alterações de hardware ou software não autorizadas pela área de Tecnologia da Informação (TI).<br>
                3. Estou ciente de que deverei devolver os equipamentos de imediato e em perfeitas condições de funcionamento ao ser desligado da empresa ou sempre que me for solicitado.<br>
                4. Em caso de dano ou extravio por dolo ou culpa (negligência, imprudência ou imperícia), autorizo desde já o desconto em folha de pagamento do valor correspondente ao reparo ou reposição, nos termos da legislação trabalhista vigente.
            </p>
            <p>São Paulo, ${hoje}.</p>
            
            <div class="signature-box">
                <!-- Anchor text for DocuSign -->
                <p>Assinado digitalmente por ${employeeName}:</p>
                <div style="color:white; font-size:1px;">[SIGNATURE_ANCHOR_HERE]</div>
            </div>
        </body>
        </html>
        `;

        const documentBase64 = Buffer.from(htmlContent, 'utf-8').toString('base64');

        // 4. Create Envelope (Remote Email Signing)
        const envelopeReq = await fetch(`${BASE_URL}/v2.1/accounts/${ACCOUNT_ID}/envelopes`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                emailSubject: `MedBeauty - Termo de Responsabilidade (${employeeName})`,
                emailBlurb: `Olá ${employeeName}, por favor, acesse o link para assinar digitalmente seu Termo de Responsabilidade pelos equipamentos cedidos para o início das suas atividades.`,
                documents: [
                    {
                        documentBase64: documentBase64,
                        name: `Termo_de_Responsabilidade_${employeeName.replace(/ /g, '_')}.html`,
                        fileExtension: "html",
                        documentId: "1"
                    }
                ],
                recipients: {
                    signers: [
                        {
                            email: employeeEmail,
                            name: employeeName,
                            recipientId: "1",
                            routingOrder: "1",
                            tabs: {
                                signHereTabs: [
                                    {
                                        anchorString: "[SIGNATURE_ANCHOR_HERE]",
                                        anchorYOffset: "0",
                                        anchorUnits: "pixels",
                                        anchorXOffset: "0"
                                    }
                                ]
                            }
                        }
                    ]
                },
                status: "sent",
                eventNotification: {
                    url: WEBHOOK_URL,
                    requireAcknowledgment: "true",
                    loggingEnabled: "true",
                    envelopeEvents: [
                        { envelopeEventStatusCode: "completed" },
                        { envelopeEventStatusCode: "declined" },
                        { envelopeEventStatusCode: "voided" }
                    ]
                }
            })
        });

        // ADDED LOGGING
        const responseText = await envelopeReq.text();
        console.log("DocuSign Envelope Response:", envelopeReq.status, responseText);

        if (!envelopeReq.ok) {
            throw new Error(`DocuSign API ERRO: ${responseText}`);
        }

        const envelopeData = JSON.parse(responseText);

        const envelopeId = envelopeData.envelopeId;

        // 5. Save Docusign status to our DB
        const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

        const { error: dbError } = await supabase
            .from('admissions_processes')
            .update({
                docusign_envelope_id: envelopeId,
                docusign_status: "sent"
            })
            .eq('id', processId);

        if (dbError) {
            console.error("Failed to update database with envelope ID:", dbError);
        }

        return new Response(
            JSON.stringify({
                success: true,
                envelopeId: envelopeId,
                status: "sent to email"
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );

    } catch (error: any) {
        console.error("Catch Block Error:", error.message, error.stack);
        return new Response(
            JSON.stringify({
                error: error.message || "Unknown error occurred",
                details: error.stack || error.toString()
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
    }
});
