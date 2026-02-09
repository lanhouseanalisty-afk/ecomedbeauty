
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        console.log("Recebendo nova solicitação de webhook de e-mail...");

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const bodyRaw = await req.text();
        console.log("Payload recebido:", bodyRaw);

        let payload;
        try {
            payload = JSON.parse(bodyRaw);
        } catch (e) {
            console.error("Erro ao converter payload para JSON:", e);
            return new Response(JSON.stringify({ error: 'Invalid JSON payload' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            });
        }

        const { from, subject, body, priority } = payload;

        if (!from || !subject || !body) {
            console.error("Campos obrigatórios ausentes:", { from, subject, body });
            return new Response(JSON.stringify({ error: 'Missing required fields (from, subject, body)' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            })
        }

        // Extrai o e-mail se vier no formato "Nome <email@dominio.com>"
        const emailMatch = from.match(/<([^>]+)>/) || [null, from];
        const cleanEmail = (emailMatch[1] || from).trim().toLowerCase();

        console.log(`Buscando usuário com e-mail: ${cleanEmail}`);

        // 1. Tentar encontrar no PROFILES (usuários com login)
        let { data: user, error: userError } = await supabase
            .from('profiles')
            .select('id, full_name')
            .eq('email', cleanEmail)
            .single()

        let requesterId = user?.id;
        let requesterName = user?.full_name;

        // 2. Se não encontrar no profiles, tentar no EMPLOYEES (colaboradores cadastrados pelo RH)
        if (!requesterId) {
            console.log("Usuário não encontrado em profiles. Tentando em employees...");
            const { data: employee, error: empError } = await supabase
                .from('employees')
                .select('user_id, full_name')
                .eq('email', cleanEmail)
                .single()

            if (employee) {
                requesterId = employee.user_id;
                requesterName = employee.full_name;
            }
        }

        // Se ainda não tiver um requesterId (user_id), não podemos criar o ticket corretamente devido à FK
        if (!requesterId) {
            console.error('E-mail não vinculado a nenhum usuário ativo no CRM:', cleanEmail);
            return new Response(JSON.stringify({ error: `E-mail ${cleanEmail} não encontrado ou não possui conta ativa no CRM.` }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 404,
            })
        }

        console.log(`Usuário identificado: ${requesterName} (ID: ${requesterId}). Gerando ticket...`);

        // 3. Gerar ticket_number (TKT-YYYYMMDD-XXXX)
        const date = new Date();
        const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
        const randomStr = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        const ticketNumber = `TKT-${dateStr}-${randomStr}`;

        // 4. Create Ticket
        const { data: ticket, error: ticketError } = await supabase
            .from('tickets')
            .insert({
                ticket_number: ticketNumber,
                title: subject,
                description: body,
                requester_id: requesterId,
                status: 'open',
                priority: priority || 'medium',
                metadata: {
                    source: 'email',
                    original_sender: from,
                    processed_at: new Date().toISOString()
                }
            })
            .select()
            .single()

        if (ticketError) {
            console.error("Erro ao inserir ticket no banco:", ticketError);
            throw ticketError;
        }

        console.log(`Ticket criado com sucesso! ID: ${ticket.id} (${ticketNumber})`);

        // 5. Create initial message (na tabela ticket_comments, que é a correta no schema)
        await supabase.from('ticket_comments').insert({
            ticket_id: ticket.id,
            author_id: requesterId,
            content: `Ticket criado automaticamente via E-mail (${from}).`,
            is_internal: true
        })

        return new Response(JSON.stringify({ message: 'Ticket created successfully', ticket_id: ticket.id, ticket_number: ticketNumber }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 201,
        })

    } catch (error) {
        console.error('Erro crítico no webhook de e-mail:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        })
    }
})
