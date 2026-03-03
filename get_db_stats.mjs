import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'

dotenv.config()

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)

async function getStats() {
    const tables = ['user_roles', 'employees', 'departments', 'consultores', 'profiles']
    const stats = {}

    for (const table of tables) {
        const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true })
        stats[table] = error ? { error: error.message } : { count }

        if (table === 'user_roles') {
            const { data } = await supabase.from(table).select('*').limit(5)
            stats['user_roles_sample'] = data
        }
    }

    fs.writeFileSync('db_state_report.txt', JSON.stringify(stats, null, 2))
    console.log('Stats written to db_state_report.txt')
}

getStats()
