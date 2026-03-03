import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

console.log("Docusign Webhook Function Loaded");

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // Docusign sends event notifications as XML by default if not strictly configured to JSON.
        // Or JSON if using DocuSign Connect modern webhooks. We will try both.
        const contentType = req.headers.get("content-type") || "";
        let envelopeId = "";
        let status = "unknown";

        if (contentType.includes("application/json")) {
            const body = await req.json();
            // DocuSign Connect (JSON)
            const eventData = body?.data?.envelopeSummary || body;
            envelopeId = eventData?.envelopeId || body?.envelopeId;
            status = eventData?.status || body?.status;
        } else {
            // Fallback for XML from traditional eventNotification
            const textBody = await req.text();

            // Very naive XML extraction for Edge Function where DOMParser isn't available
            const envMatches = textBody.match(/<EnvelopeID>([^<]*)<\/EnvelopeID>/i);
            const statusMatches = textBody.match(/<Status>([^<]*)<\/Status>/i);

            if (envMatches && envMatches[1]) envelopeId = envMatches[1];
            if (statusMatches && statusMatches[1]) status = statusMatches[1];
        }

        if (!envelopeId) {
            console.warn("Webhook triggered but no envelope ID found. Ignored.");
            return new Response("OK", { status: 200 }); // Always 200 so Docusign stops retrying
        }

        console.log(`Webhook Received: Envelope ${envelopeId} is now ${status}`);

        // Only act on final states
        if (status === "Completed" || status === "completed" || status === "Declined" || status === "declined" || status === "Voided" || status === "voided") {
            const finalStatus = status.toLowerCase() === "completed" ? "signed" : "voided";

            const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
            const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
            // We use service_role here because webhooks don't have user tokens
            const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

            const { error: dbError } = await supabase
                .from('admissions_processes')
                .update({
                    docusign_status: finalStatus
                })
                .eq('docusign_envelope_id', envelopeId);

            if (dbError) {
                console.error("Failed to update process on web hook:", dbError);
                throw dbError;
            }
        }

        // Webhooks must return 200
        return new Response("OK", { status: 200 });

    } catch (error: any) {
        console.error("Webhook Catch Block Error:", error.message, error.stack);
        // Even on error, it's sometimes best to return 200 to clear the queue, 
        // but 500 triggers retries which might be desired if DB was temporarily down.
        return new Response("Error processed", { status: 500 });
    }
});
