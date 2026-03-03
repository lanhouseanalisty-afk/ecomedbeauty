import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)

async function checkCelinaEmployeeLink() {
    const email = 'celina.ribeiro@medbeauty.com.br'
    const { data, error } = await supabase
        .from('employees')
        .select('id, email, user_id, department_id')
        .eq('email', email)
        .maybeSingle()

    if (error) console.error('Error:', error.message)
    else console.log('Celina Employee Data:', JSON.stringify(data, null, 2))
}

checkCelinaEmployeeLink()
