import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hxdfbwptgtthaqddneyr.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4ZGZid3B0Z3R0aGFxZGRuZXlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxOTk5ODksImV4cCI6MjA4NDc3NTk4OX0.rXq8BNh1vARTYhD8VZLF4yWrFkE4XW2r5gRrr8Jnc6c'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkCelinaRole() {
    console.log('Finding Celina user_id...')
    const { data: emps } = await supabase.from('employees').select('user_id, full_name, email').ilike('full_name', '%Celina%')
    console.log('Employees:', emps)

    if (emps && emps.length > 0) {
        const userId = emps[0].user_id
        if (userId) {
            console.log(`Checking user_roles for user_id: ${userId}`)
            const { data: roles } = await supabase.from('user_roles').select('*').eq('user_id', userId)
            console.log('Roles:', roles)
        } else {
            console.log('Celina employee has no user_id linked yet.')
        }
    }
}

checkCelinaRole()
