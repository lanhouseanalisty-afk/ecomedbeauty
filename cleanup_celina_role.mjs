import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hxdfbwptgtthaqddneyr.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4ZGZid3B0Z3R0aGFxZGRuZXlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxOTk5ODksImV4cCI6MjA4NDc3NTk4OX0.rXq8BNh1vARTYhD8VZLF4yWrFkE4XW2r5gRrr8Jnc6c'

const supabase = createClient(supabaseUrl, supabaseKey)

async function cleanupCelina() {
    const emails = ['celina@ecomedbeauty.com.br', 'celina.ribeiro@medbeauty.com.br']

    console.log('Finding user IDs for Celina...')
    const { data: users, error: userErr } = await supabase.from('employees').select('user_id, email').in('email', emails)

    if (userErr) {
        console.error('Error finding users:', userErr.message)
        return
    }

    if (!users || users.length === 0) {
        console.log('No users found with those emails.')
        return
    }

    for (const user of users) {
        if (!user.user_id) continue;

        console.log(`Cleaning up roles for user ${user.email} (${user.user_id})...`)

        // Delete all existing roles for this user
        const { error: delErr } = await supabase
            .from('user_roles')
            .delete()
            .eq('user_id', user.user_id)

        if (delErr) {
            console.error(`Error deleting roles for ${user.email}:`, delErr.message)
        } else {
            // Insert standard user role
            const { error: insErr } = await supabase
                .from('user_roles')
                .insert({
                    user_id: user.user_id,
                    role: 'user',
                    permissions: []
                })

            if (insErr) console.error(`Error inserting role for ${user.email}:`, insErr.message)
            else console.log(`Successfully set ${user.email} as user!`)
        }
    }
}

cleanupCelina()
