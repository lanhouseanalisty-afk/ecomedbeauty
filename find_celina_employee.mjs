import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'

dotenv.config()

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)

async function findCelinaEmployee() {
    const emails = ['celina@ecomedbeauty.com.br', 'celina.ribeiro@medbeauty.com.br']
    let output = ''

    output += 'Searching for employees with emails: ' + JSON.stringify(emails) + '\n'

    const { data: byEmail, error: emailError } = await supabase
        .from('employees')
        .select('*')
        .in('email', emails)

    if (emailError) output += 'Error searching by email: ' + emailError.message + '\n'
    else output += 'Found by email: ' + JSON.stringify(byEmail, null, 2) + '\n'

    const { data: byName, error: nameError } = await supabase
        .from('employees')
        .select('*')
        .ilike('nome', '%Celina%')

    if (nameError) output += 'Error searching by name: ' + nameError.message + '\n'
    else output += 'Found by name: ' + JSON.stringify(byName, null, 2) + '\n'

    fs.writeFileSync('celina_employee_output.txt', output)
    console.log('Output written to celina_employee_output.txt')
}

findCelinaEmployee()
