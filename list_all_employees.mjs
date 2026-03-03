import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'

dotenv.config()

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)

async function listAllEmployees() {
    const { data, error } = await supabase.from('employees').select('id, email, user_id, full_name')
    if (error) {
        console.error('Error:', error.message)
    } else {
        fs.writeFileSync('all_employees_mapping.txt', JSON.stringify(data, null, 2))
        console.log(`Found ${data.length} employees. Mapping saved to all_employees_mapping.txt`)
    }
}

listAllEmployees()
