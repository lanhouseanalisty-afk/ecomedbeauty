import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'

dotenv.config()

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)

async function listDepartments() {
    const { data, error } = await supabase
        .from('departments')
        .select('*')

    if (error) {
        console.error('Error:', error.message)
    } else {
        fs.writeFileSync('departments_list.txt', JSON.stringify(data, null, 2))
        console.log('Departments written to departments_list.txt')
    }
}

listDepartments()
