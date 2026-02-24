
import { createSign } from "node:crypto";
import { Buffer } from "node:buffer";

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

console.log("Docusign Function Loaded");

Deno.serve(async (req) => {
    console.log("Request received:", req.method);

    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const body = await req.json();
        console.log("Received body:", JSON.stringify(body));

        const { signerName, signerEmail, contractTitle, contractContent } = body;

        if (!signerName || !signerEmail) {
            console.error("Validation failed. Body keys:", body ? Object.keys(body) : "no body");
            return new Response(
                JSON.stringify({
                    error: "Missing signerName or signerEmail",
                    received: body
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
            );
        }

        // Configuration
        const IK = '05193209-8360-4847-93ce-d614a5880a13';
        const USER_ID = 'ba9ccf8e-cb45-4256-93cb-a06e8ca05261';
        const ACCOUNT_ID = 'd81aebfd-4629-4239-a926-8bfc97c7a22a';
        const BASE_URL = 'https://demo.docusign.net/restapi';
        const AUTH_SERVER = 'account-d.docusign.com';

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

        const origin = req.headers.get('origin') || "http://localhost:5173";
        const returnUrl = `${origin}/crm/juridico?docusign=success`;

        // 3. Create Envelope
        const contractBody = contractContent || "Contrato sem conteúdo.";
        const documentBase64 = Buffer.from(contractBody, 'utf-8').toString('base64');

        const envelopeReq = await fetch(`${BASE_URL}/v2.1/accounts/${ACCOUNT_ID}/envelopes`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                emailSubject: `MedBeauty - ${contractTitle || "Contrato Jurídico"}`,
                documents: [
                    {
                        documentBase64: documentBase64,
                        name: `${contractTitle || "Contrato"}.txt`,
                        fileExtension: "txt",
                        documentId: "1"
                    }
                ],
                recipients: {
                    signers: [
                        {
                            email: signerEmail,
                            name: signerName,
                            recipientId: "1",
                            clientUserId: "1001",
                            tabs: {
                                signHereTabs: [
                                    {
                                        anchorString: "Assinado digitalmente",
                                        anchorYOffset: "20",
                                        anchorUnits: "pixels"
                                    }
                                ]
                            }
                        }
                    ]
                },
                status: "sent"
            })
        });

        const envelopeData = await envelopeReq.json();
        if (!envelopeReq.ok) {
            console.error("Envelope Error Response:", JSON.stringify(envelopeData));
            throw new Error(`Envelope Error: ${envelopeData.errorCode} - ${envelopeData.message}`);
        }

        const envelopeId = envelopeData.envelopeId;

        // 4. Create View
        const viewReq = await fetch(`${BASE_URL}/v2.1/accounts/${ACCOUNT_ID}/envelopes/${envelopeId}/views/recipient`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                returnUrl: returnUrl,
                authenticationMethod: "none",
                email: signerEmail,
                userName: signerName,
                clientUserId: "1001"
            })
        });

        const viewData = await viewReq.json();
        if (!viewReq.ok) {
            console.error("View Error Response:", JSON.stringify(viewData));
            throw new Error(`View Error: ${viewData.errorCode} - ${viewData.message}`);
        }

        return new Response(
            JSON.stringify({
                url: viewData.url,
                envelopeId: envelopeId
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );

    } catch (error: any) {
        console.error("Catch Block Error:", error.message, error.stack);
        return new Response(
            JSON.stringify({
                error: error.message,
                details: error.toString()
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
    }
});
