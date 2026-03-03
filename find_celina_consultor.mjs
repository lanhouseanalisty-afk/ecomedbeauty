import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)

async function findCelinaConsultor() {
    const emails = ['celina@ecomedbeauty.com.br', 'celina.ribeiro@medbeauty.com.br']

    console.log('Searching for consultants with emails:', emails)

    const { data: byEmail, error: emailError } = await supabase
        .from('consultores')
        .select('*')
        .in('email', emails)

    if (emailError) console.error('Error searching by email:', emailError.message)
    else console.log('Found by email:', JSON.stringify(byEmail, null, 2))

    const { data: byName, error: nameError } = await supabase
        .from('consultores')
        .select('*')
        .ilike('nome', '%Celina%')

    if (nameError) console.error('Error searching by name:', nameError.message)
    else console.log('Found by name:', JSON.stringify(byName, null, 2))
}

findCelinaConsultor()
