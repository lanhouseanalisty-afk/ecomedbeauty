import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)

async function checkCelinaStatus() {
    const emails = ['celina@ecomedbeauty.com.br', 'celina.ribeiro@medbeauty.com.br']

    for (const email of emails) {
        console.log(`--- Status for ${email} ---`)
        const { data: users, error: userError } = await supabase.auth.admin.listUsers()
        const user = users?.users?.find(u => u.email === email)

        if (user) {
            console.log('User ID:', user.id)
            const { data: roles } = await supabase.from('user_roles').select('role').eq('user_id', user.id)
            console.log('Roles:', JSON.stringify(roles))

            const { data: employee } = await supabase.from('employees').select('*').eq('user_id', user.id).maybeSingle()
            console.log('Employee Profile:', JSON.stringify(employee))
        } else {
            console.log('User not found in Auth')
        }
    }
}

checkCelinaStatus()
