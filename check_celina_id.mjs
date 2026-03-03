import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'

dotenv.config()

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)

async function findUserIdByEmail() {
    const email = 'celina.ribeiro@medbeauty.com.br'

    // Check in user_roles (it usually has email if I added it or if it's there)
    // Actually, user_roles usually doesn't have email in this schema, it has user_id.

    // Let's check profiles for the email
    const { data: profile } = await supabase.from('profiles').select('id, email, full_name').eq('email', email).maybeSingle()

    console.log('Profile for Celina:', profile)

    fs.writeFileSync('celina_id_check.txt', JSON.stringify({ profile }, null, 2))
}

findUserIdByEmail()
