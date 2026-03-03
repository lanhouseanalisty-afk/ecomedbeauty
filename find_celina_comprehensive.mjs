import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'

dotenv.config()

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)

async function findCelinaAllOver() {
    const email = 'celina.ribeiro@medbeauty.com.br'

    // Search in employees
    const { data: employees } = await supabase.from('employees').select('id, user_id, email, full_name').eq('email', email)

    // Search in profiles (it might not have email, let's try searching by ID if we find any in employees)
    // But wait, user says she is logged in as celina.ribeiro@medbeauty.com.br

    // Let's check user_roles for this email too
    const { data: roles } = await supabase.from('user_roles').select('*')
    // Filter in JS since we don't know columns
    const celinaRoles = roles ? roles.filter(r => JSON.stringify(r).includes(email)) : []

    const result = {
        email,
        employees,
        celinaRoles
    }

    fs.writeFileSync('celina_comprehensive_search.txt', JSON.stringify(result, null, 2))
    console.log('Search complete.')
}

findCelinaAllOver()
