
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // Parse Body
        // Expected format from Power Automate:
        // { "email": "user@email.com", "title": "...", "description": "...", "priority": "high", "department": "..." }
        const { email, title, description, priority, department } = await req.json()

        if (!email || !title || !description) {
            return new Response(JSON.stringify({ error: 'Missing required fields (email, title, description)' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            })
        }

        // 1. Find User ID by Email
        const { data: user, error: userError } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', email)
            .single()

        if (userError || !user) {
            console.error('User not found:', email, userError)
            return new Response(JSON.stringify({ error: `User with email ${email} not found in CRM` }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 404,
            })
        }

        // 2. Create Ticket
        const { data: ticket, error: ticketError } = await supabase
            .from('tickets')
            .insert({
                title,
                description,
                requester_id: user.id,
                status: 'open',
                priority: priority || 'medium',
                metadata: {
                    source: 'teams',
                    department: department || 'General'
                }
            })
            .select()
            .single()

        if (ticketError) {
            throw ticketError
        }

        // 3. (Optional) Create initial message from System
        await supabase.from('ticket_messages').insert({
            ticket_id: ticket.id,
            user_id: user.id, // Or a system bot ID
            content: `Ticket criado via Microsoft Teams.`,
            is_internal: true
        })

        return new Response(JSON.stringify({ message: 'Ticket created successfully', ticket_id: ticket.id }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 201,
        })

    } catch (error) {
        console.error('Error:', error)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        })
    }
})
