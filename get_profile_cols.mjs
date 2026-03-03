import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)

async function getColumns() {
    const { data, error } = await supabase.from('profiles').select('*').limit(1)
    if (error) {
        console.error('Error:', error.message)
    } else if (data && data.length > 0) {
        console.log('Columns:', Object.keys(data[0]).join(', '))
    } else {
        console.log('No data found in profiles table.')
    }
}

getColumns()
