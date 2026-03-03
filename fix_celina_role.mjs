import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hxdfbwptgtthaqddneyr.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4ZGZid3B0Z3R0aGFxZGRuZXlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxOTk5ODksImV4cCI6MjA4NDc3NTk4OX0.rXq8BNh1vARTYhD8VZLF4yWrFkE4XW2r5gRrr8Jnc6c'

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixCelina() {
    console.log('Finding Celina user_id...')
    const { data: emps } = await supabase.from('employees').select('user_id').ilike('full_name', '%Celina%')

    if (emps && emps.length > 0 && emps[0].user_id) {
        const userId = emps[0].user_id
        console.log(`Assigning 'admin' role to user_id: ${userId}`)

        // Using service role to insert into user_roles
        const { error } = await supabase.from('user_roles').insert({
            user_id: userId,
            role: 'admin',
            permissions: ['*']
        })

        if (error) {
            console.log('Insert failed, trying update...')
            const { error: updError } = await supabase.from('user_roles').update({ role: 'admin' }).eq('user_id', userId)
            if (updError) console.error('Fix failed:', updError.message)
            else console.log('Successfully updated Celina to admin!')
        } else {
            console.log('Successfully assigned Celina to admin!')
        }
    } else {
        console.log('Celina not found or has no user_id.')
    }
}

fixCelina()
