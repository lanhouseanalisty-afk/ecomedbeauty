import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)

async function getRealColumns() {
    const { data, error } = await supabase.from('profiles').select().limit(1)
    if (error) console.error('Error:', error.message)
    else if (data && data.length > 0) console.log('Actual columns:', Object.keys(data[0]).join(', '))
}

getRealColumns()
