import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'

dotenv.config()

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)

async function inspectProfiles() {
    // 1. Get first row to see keys
    const { data: firstRow } = await supabase.from('profiles').select('*').limit(1)

    // 2. Search for Celina
    const { data: celinaRows } = await supabase
        .from('profiles')
        .select('*')
        .or('full_name.ilike.%Celina%,email.ilike.%celina%')

    const result = {
        columns: firstRow ? Object.keys(firstRow[0]) : [],
        celinaRows
    }

    fs.writeFileSync('profiles_inspection.txt', JSON.stringify(result, null, 2))
}

inspectProfiles()
