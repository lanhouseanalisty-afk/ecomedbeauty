import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'

dotenv.config()

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)

async function findProperId() {
    const { data: roles, error } = await supabase.from('user_roles').select('*')
    if (error) {
        console.error('Error:', error.message)
        return
    }

    fs.writeFileSync('all_roles_debug.txt', JSON.stringify(roles, null, 2))
    console.log('All roles written to all_roles_debug.txt')
}

findProperId()
