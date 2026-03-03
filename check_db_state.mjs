import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)

async function listTables() {
    const { data, error } = await supabase.from('profiles').select('*').limit(1)
    if (error) {
        console.error('Error connecting to profiles:', error.message)
    } else {
        console.log('Successfully connected to profiles.')
    }

    // List some common tables to see if they exist and have data
    const tables = ['user_roles', 'employees', 'departments', 'consultores']
    for (const table of tables) {
        const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true })
        if (error) console.log(`Table ${table} error: ${error.message}`)
        else console.log(`Table ${table} count: ${count}`)
    }
}

listTables()
