import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)

async function addCelinaAsConsultor() {
    console.log('Adding Celina as a consultant...')

    const { data, error } = await supabase
        .from('consultores')
        .insert([
            {
                nome: 'Celina Ribeiro',
                email: 'celina.ribeiro@medbeauty.com.br',
                ativo: true
            }
        ])
        .select()

    if (error) {
        console.error('Error adding Celina:', error.message)
    } else {
        console.log('Celina added successfully:', JSON.stringify(data, null, 2))
    }
}

addCelinaAsConsultor()
