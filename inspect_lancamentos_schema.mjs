import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)

async function inspectTable() {
    console.log('Inspecting lancamentos_diarios table...')

    // We can't easily get schema info via JS client without RPC or specialized queries.
    // Let's try to fetch one record to see the keys.
    const { data, error } = await supabase
        .from('lancamentos_diarios')
        .select('*')
        .limit(1)

    if (error) {
        console.error('Error fetching data:', error.message)
    } else {
        console.log('Sample record:', JSON.stringify(data, null, 2))
    }

    // Also check if there's any UNIQUE constraint info we can find.
    // Usually onConflict 'consultor_id,data' implies those two form a unique key.
}

inspectTable()
