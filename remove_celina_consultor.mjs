import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)

async function removeCelinaAsConsultor() {
    console.log('Removing Celina from consultants table...')

    const { data, error } = await supabase
        .from('consultores')
        .delete()
        .ilike('email', 'celina.ribeiro@medbeauty.com.br')

    if (error) {
        console.error('Error removing Celina:', error.message)
    } else {
        console.log('Celina removed (or already gone).')
    }
}

removeCelinaAsConsultor()
