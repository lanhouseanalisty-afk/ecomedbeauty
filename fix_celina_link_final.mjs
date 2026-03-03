import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)

async function fixCelinaEmployeeLink() {
    const activeUserId = 'db2a7924-d250-4ffc-a320-9556d10c85c0'
    const email = 'celina.ribeiro@medbeauty.com.br'

    console.log(`Updating employees table for email ${email} with user_id ${activeUserId}...`)

    const { data, error } = await supabase
        .from('employees')
        .update({ user_id: activeUserId })
        .eq('email', email)
        .select()

    if (error) {
        console.error('Error:', error.message)
    } else {
        console.log('Update successful:', JSON.stringify(data, null, 2))
    }
}

fixCelinaEmployeeLink()
