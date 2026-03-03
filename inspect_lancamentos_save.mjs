import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'

dotenv.config()

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)

async function inspectTable() {
    const { data, error } = await supabase
        .from('lancamentos_diarios')
        .select('*')
        .limit(1)

    if (error) {
        fs.writeFileSync('lancamentos_error.txt', error.message)
    } else {
        fs.writeFileSync('lancamentos_sample.json', JSON.stringify(data, null, 2))
    }
}

inspectTable()
