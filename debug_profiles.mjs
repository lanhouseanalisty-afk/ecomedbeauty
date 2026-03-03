import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'

dotenv.config()

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)

async function debugProfiles() {
    const { data, error } = await supabase.from('profiles').select('*').limit(5)
    if (error) {
        fs.writeFileSync('profiles_debug.txt', 'Error: ' + error.message)
    } else {
        const result = {
            columns: data.length > 0 ? Object.keys(data[0]) : [],
            sample: data
        }
        fs.writeFileSync('profiles_debug.txt', JSON.stringify(result, null, 2))
    }
}

debugProfiles()
