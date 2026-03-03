import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'

dotenv.config()

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)

async function debugCelinaMapping() {
    const email = 'celina.ribeiro@medbeauty.com.br'

    // 1. Get employee data by email
    const { data: employeeData, error: empError } = await supabase
        .from('employees')
        .select('*')
        .eq('email', email)
        .maybeSingle()

    // 2. Try to find user in profiles (since we can't easily query auth.users with anon key, but profiles usually syncs)
    const { data: profileData, error: profError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .maybeSingle()

    const result = {
        employee: employeeData,
        profile: profileData,
        errors: {
            emp: empError?.message,
            prof: profError?.message
        }
    }

    fs.writeFileSync('celina_debug_mapping.txt', JSON.stringify(result, null, 2))
    console.log('Debug info written to celina_debug_mapping.txt')
}

debugCelinaMapping()
