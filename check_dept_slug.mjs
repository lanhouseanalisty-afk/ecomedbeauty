import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)

async function checkDepartment() {
    const deptId = '3b1395df-21a7-42ed-b735-665ef393dd2b'
    const { data, error } = await supabase
        .from('departments')
        .select('*')
        .eq('id', deptId)
        .single()

    if (error) console.error('Error:', error.message)
    else console.log('Department:', JSON.stringify(data, null, 2))
}

checkDepartment()
