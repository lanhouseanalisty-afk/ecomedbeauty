import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)

import fs from 'fs'

async function inspectData() {
    let output = '--- Consultores ---\n'
    const { data: consultores } = await supabase.from('consultores').select('*')
    output += JSON.stringify(consultores, null, 2)

    output += '\n\n--- Lancamentos Diarios (Fev 2026) ---\n'
    const { data: lancamentos } = await supabase
        .from('lancamentos_diarios')
        .select('*')
        .gte('data', '2026-02-01')
        .lte('data', '2026-02-28')
    output += JSON.stringify(lancamentos, null, 2)

    fs.writeFileSync('forecast_data_output.txt', output)
    console.log('Data written to forecast_data_output.txt')
}

inspectData()
