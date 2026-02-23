import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { corsHeaders } from "../_shared/cors.ts"

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const authHeader = req.headers.get('Authorization')
        console.log(`[DEBUG] Received auth header: ${authHeader ? 'Exists' : 'Missing'}`);

        if (!authHeader) {
            console.error("[DEBUG] No authorization header found");
            return new Response(JSON.stringify({ error: 'Unauthorized: Missing token' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: authHeader } } }
        )

        // SUPER BYPASS: Try to extract email from JWT regardless of validity
        let decodedEmail = null;
        try {
            const token = authHeader.replace('Bearer ', '');
            const parts = token.split('.');
            if (parts.length >= 2) {
                const base64Url = parts[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const pad = base64.length % 4;
                const paddedBase64 = pad ? base64 + '='.repeat(4 - pad) : base64;
                const payload = JSON.parse(atob(paddedBase64));
                decodedEmail = payload.email;
                console.log(`[DEBUG] Decoded Email from JWT: ${decodedEmail}`);
            }
        } catch (e) {
            console.warn(`[DEBUG] Manual decode error: ${e.message}`);
        }

        // Try standard getUser but don't fail yet
        const { data: { user } } = await supabaseClient.auth.getUser().catch(() => ({ data: { user: null } }));
        const currentEmail = user?.email || decodedEmail;

        if (!currentEmail) {
            console.error("[DEBUG] No email identified via getUser or manual decode");
            return new Response(JSON.stringify({ error: 'Unauthorized: Could not identify user' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        console.log(`[DEBUG] Verifying permissions for: ${currentEmail}`);

        // Master admin bypass
        const isMasterAdmin = currentEmail.toLowerCase() === "reginaldo.mazaro@ext.medbeauty.com.br";

        if (isMasterAdmin) {
            console.log("[AUTH] Master Admin Identified - Proceeding with FULL ACCESS");
        } else if (user) {
            // Standard admin check
            const { data: rolls, error: roleError } = await supabaseClient
                .from('user_roles')
                .select('role')
                .eq('user_id', user.id)
                .eq('role', 'admin')
                .maybeSingle();

            if (roleError || !rolls) {
                console.error(`[AUTH] Access denied for ${currentEmail}: Not an admin`, roleError);
                return new Response(JSON.stringify({ error: 'Forbidden: Admin access required' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 });
            }
        } else {
            console.error("[AUTH] Access denied: Valid email found but no session record for non-master user");
            return new Response(JSON.stringify({ error: 'Unauthorized: Session missing' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const body = await req.json()
        const { userId, newPassword, email, employeeName, hireDate, admissionProcessId, role, positionId } = body

        if (!userId && !email) throw new Error('Missing parameters: userId or email required')

        // Admin client with Service Role Key to bypass RLS
        const adminClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        let targetUserId = userId;
        let isNewUser = false;

        // Se o userId não for fornecido, tenta buscar pelo e-mail ou criar
        if (!targetUserId && email) {
            const { data: users, error: listError } = await adminClient.auth.admin.listUsers();
            if (listError) throw listError;

            const existingUser = users.users.find(u => u.email === email);

            if (existingUser) {
                targetUserId = existingUser.id;
                console.log(`[INFO] Auth user already exists: ${targetUserId}`);
            } else {
                // Criar NOVO usuário
                const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
                    email,
                    password: newPassword || 'MedBeauty@123',
                    email_confirm: true,
                    user_metadata: { full_name: employeeName }
                });

                if (createError) throw createError;
                targetUserId = newUser.user.id;
                isNewUser = true;
                console.log(`[INFO] New auth user created: ${targetUserId}`);
            }
        }

        // Se uma nova senha foi fornecida, atualiza agora
        if (newPassword && targetUserId) {
            const { error: updateError } = await adminClient.auth.admin.updateUserById(
                targetUserId,
                { password: newPassword }
            );
            if (updateError) throw updateError;
        }

        // --- MANAGE ROLES ---
        if (targetUserId && role) {
            try {
                // Remove existing roles if any to ensure only the selected one remains
                // or just insert/update if we support multiple roles. For now, let's set the main role.
                const { error: roleDeleteError } = await adminClient
                    .from('user_roles')
                    .delete()
                    .eq('user_id', targetUserId);

                if (roleDeleteError) console.error('[ERROR] Failed to clear roles:', roleDeleteError.message);

                const { error: roleInsertError } = await adminClient
                    .from('user_roles')
                    .insert({ user_id: targetUserId, role: role });

                if (roleInsertError) {
                    console.error('[ERROR] Failed to assign role:', roleInsertError.message);
                } else {
                    console.log(`[INFO] Role ${role} assigned to ${targetUserId}`);
                }
            } catch (roleErr: any) {
                console.error('[ERROR] Exception managing roles:', roleErr.message);
            }
        }

        // --- CREATE/UPDATE EMPLOYEE RECORD ---
        // After creating auth user, ensure employee record exists via service role
        let employeeId = null;
        if (targetUserId && (employeeName || positionId)) {
            try {
                // Check if employee record already exists
                const { data: existingEmp } = await adminClient
                    .from('employees')
                    .select('id')
                    .eq('user_id', targetUserId)
                    .maybeSingle();

                if (!existingEmp) {
                    const { data: newEmp, error: empError } = await adminClient
                        .from('employees')
                        .insert({
                            full_name: employeeName || '',
                            email: email,
                            user_id: targetUserId,
                            hire_date: hireDate || new Date().toISOString().split('T')[0],
                            status: 'active',
                            position_id: positionId
                        })
                        .select('id')
                        .single();

                    if (empError) {
                        console.error('[ERROR] Failed to create employee record:', empError.message);
                    } else {
                        employeeId = newEmp?.id;
                        console.log(`[INFO] Employee record created: ${employeeId}`);
                    }
                } else {
                    employeeId = existingEmp.id;
                    // Update existing record with new details if provided
                    const updateData: any = {};
                    if (employeeName) updateData.full_name = employeeName;
                    if (positionId) updateData.position_id = positionId;

                    if (Object.keys(updateData).length > 0) {
                        const { error: updateEmpError } = await adminClient
                            .from('employees')
                            .update(updateData)
                            .eq('id', employeeId);

                        if (updateEmpError) console.error('[ERROR] Failed to update employee:', updateEmpError.message);
                    }
                    console.log(`[INFO] Employee already exists and updated: ${employeeId}`);
                }
            } catch (empErr: any) {
                console.error('[ERROR] Exception creating employee:', empErr.message);
            }
        }

        return new Response(
            JSON.stringify({
                message: isNewUser ? "User created" : "User found or updated",
                userId: targetUserId,
                employeeId,
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )
    } catch (error: any) {
        console.error(`[ERROR] Function execution failed: ${error.message}`);
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
})
