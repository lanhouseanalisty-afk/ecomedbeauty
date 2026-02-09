import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const SERVICE_ID = Deno.env.get("VITE_EMAILJS_SERVICE_ID");
const TEMPLATE_ID = Deno.env.get("VITE_EMAILJS_TEMPLATE_ID");
const PUBLIC_KEY = Deno.env.get("VITE_EMAILJS_PUBLIC_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReminderRequest {
    contract_id?: string;
    is_cron?: boolean;
}

const handler = async (req: Request): Promise<Response> => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
            const missing = [];
            if (!SERVICE_ID) missing.push("VITE_EMAILJS_SERVICE_ID");
            if (!TEMPLATE_ID) missing.push("VITE_EMAILJS_TEMPLATE_ID");
            if (!PUBLIC_KEY) missing.push("VITE_EMAILJS_PUBLIC_KEY");
            if (!SUPABASE_URL) missing.push("SUPABASE_URL");
            if (!SUPABASE_SERVICE_ROLE_KEY) missing.push("SUPABASE_SERVICE_ROLE_KEY");
            throw new Error(`Configuração ausente: ${missing.join(", ")}`);
        }

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        const { contract_id, is_cron }: ReminderRequest = await req.json().catch(() => ({}));

        console.log(`Checking reminders: contract_id=${contract_id}, is_cron=${is_cron}`);

        let contracts = [];

        if (contract_id) {
            // Manual test for a specific contract
            const { data, error } = await supabase
                .from("legal_contracts")
                .select("*")
                .eq("id", contract_id)
                .single();

            if (error || !data) throw new Error(`Contrato não encontrado: ${error?.message || ''}`);
            contracts = [data];
        } else {
            // CRON: Find contracts that need a reminder today
            const { data, error } = await supabase
                .from("legal_contracts")
                .select("*")
                .eq("reminder_enabled", true)
                .eq("status", "active");

            if (error) throw error;

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            contracts = data.filter((contract) => {
                if (!contract.end_date || !contract.renewal_notice_days) return false;

                const expiryDate = new Date(contract.end_date);
                const noticeDate = new Date(expiryDate);
                noticeDate.setDate(expiryDate.getDate() - contract.renewal_notice_days);

                noticeDate.setHours(0, 0, 0, 0);
                return noticeDate.getTime() === today.getTime();
            });
        }

        const results = [];

        for (const contract of contracts) {
            if (!contract.reminder_email) {
                console.warn(`No email defined for contract ${contract.title}`);
                continue;
            }

            console.log(`Sending reminder for ${contract.title} via EmailJS REST API`);

            const emailjsRes = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    service_id: SERVICE_ID,
                    template_id: TEMPLATE_ID,
                    user_id: PUBLIC_KEY, // user_id is the public key in REST API
                    template_params: {
                        to_email: contract.reminder_email,
                        to_name: contract.party_name,
                        contract_title: contract.title,
                        contract_number: contract.contract_number,
                        expiry_date: new Date(contract.end_date).toLocaleDateString('pt-BR'),
                        notice_days: contract.renewal_notice_days,
                        link_dashboard: "https://ecomedbeauty.com.br/crm/juridico" // Fallback link
                    },
                }),
            });

            const emailjsText = await emailjsRes.text();
            results.push({
                contract: contract.title,
                success: emailjsRes.ok,
                response: emailjsText
            });
        }

        return new Response(JSON.stringify({ success: true, results }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (error: any) {
        console.error("Error in checker:", error);
        return new Response(JSON.stringify({
            success: false,
            error: error.message,
            details: "Verifique se as secrets VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID e VITE_EMAILJS_PUBLIC_KEY estão configuradas no Supabase."
        }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
};

serve(handler);
