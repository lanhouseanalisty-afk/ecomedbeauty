import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { corsHeaders } from "../_shared/cors.ts"

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const authHeader = req.headers.get('Authorization')
        const body = await req.json().catch(() => ({}))
        const { userId } = body

        if (!userId) {
            return new Response(JSON.stringify({ error: 'Missing userId' }), {
                status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        // Decode JWT to get requesting user
        let requestingUserId = null
        if (authHeader && authHeader.startsWith('Bearer ')) {
            try {
                const token = authHeader.split(' ')[1]
                const segments = token.split('.')
                if (segments.length === 3) {
                    let b64 = segments[1].replace(/-/g, '+').replace(/_/g, '/')
                    while (b64.length % 4 !== 0) b64 += '='
                    const payload = JSON.parse(atob(b64))
                    requestingUserId = payload.sub
                }
            } catch (e) {
                console.error('JWT Decode Error:', e)
            }
        }

        if (!requestingUserId) {
            return new Response(JSON.stringify({ error: 'Unauthorized: Missing requestingUserId' }), {
                status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        // Admin client with Service Role Key
        const adminClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // Check if requesting user is admin
        const { data: roles, error: rolesError } = await adminClient
            .from('user_roles')
            .select('role')
            .eq('user_id', requestingUserId)
            .eq('role', 'admin')

        if (rolesError || !roles || roles.length === 0) {
            return new Response(JSON.stringify({ error: 'Forbidden: Admin role required.' }), {
                status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        // Prevent admin from deleting themselves
        if (requestingUserId === userId) {
            return new Response(JSON.stringify({ error: 'Forbidden: You cannot delete your own account.' }), {
                status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        // Delete the user from Supabase Auth (cascades to removes sessions)
        const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId)

        if (deleteError) throw deleteError

        return new Response(
            JSON.stringify({ status: 'success', message: `User ${userId} deleted successfully.` }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )
    } catch (error: any) {
        console.error(`[admin-delete-user] Error: ${error.message}`)
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
})
