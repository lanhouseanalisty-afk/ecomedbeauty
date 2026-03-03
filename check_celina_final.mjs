import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'

dotenv.config()

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)

async function checkFinalStatus() {
    const userId = '6816c70c-40d8-41ed-b4b8-5627015fbf77'
    let output = `--- Checking Roles for User ID: ${userId} ---\n`

    const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)

    if (rolesError) output += 'Error: ' + rolesError.message + '\n'
    else output += 'Roles: ' + JSON.stringify(roles, null, 2) + '\n'

    // Also check permissions in employees table if any
    const { data: employee } = await supabase.from('employees').select('permissions').eq('user_id', userId).maybeSingle()
    output += '\nEmployee Permissions: ' + JSON.stringify(employee?.permissions || []) + '\n'

    fs.writeFileSync('celina_final_check.txt', output)
    console.log('Output written to celina_final_check.txt')
}

checkFinalStatus()
