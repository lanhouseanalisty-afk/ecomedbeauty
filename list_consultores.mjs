import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)

async function listConsultores() {
    const { data, error } = await supabase
        .from('consultores')
        .select('*')

    if (error) {
        console.error('Error fetching consultores:', error.message)
        return
    }

    console.log('ConsultoresDataBegin')
    console.log(JSON.stringify(data, null, 2))
    console.log('ConsultoresDataEnd')
}

listConsultores()
