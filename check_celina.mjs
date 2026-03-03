import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing env vars')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkCelina() {
    console.log('Searching for Celina in employees table...')
    const { data: emps, error: empError } = await supabase
        .from('employees')
        .select('*')
        .ilike('full_name', '%Celina%')

    if (empError) console.error('Error fetching employees:', empError)
    else console.log('Employees found:', JSON.stringify(emps, null, 2))

    const { data: users, error: userError } = await supabase.auth.admin.listUsers()
    if (userError) console.error('Error fetching auth users:', userError)
    else {
        const celina = users.users.find(u => u.email?.toLowerCase().includes('celina'))
        console.log('Auth user found:', JSON.stringify(celina, null, 2))
    }
}

checkCelina()
