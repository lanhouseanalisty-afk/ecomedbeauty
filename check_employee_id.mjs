import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)

async function checkEmployeeId() {
    const userId = 'db2a7924-d250-4ffc-a320-9556d10c85c0'
    const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

    if (error) console.error('Error:', error.message)
    else console.log('Employee for ID db2a7924:', data)
}

checkEmployeeId()
