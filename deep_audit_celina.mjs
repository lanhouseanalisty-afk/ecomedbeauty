import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hxdfbwptgtthaqddneyr.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4ZGZid3B0Z3R0aGFxZGRuZXlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxOTk5ODksImV4cCI6MjA4NDc3NTk4OX0.rXq8BNh1vARTYhD8VZLF4yWrFkE4XW2r5gRrr8Jnc6c'

const supabase = createClient(supabaseUrl, supabaseKey)

async function deepAudit() {
    console.log('Finding ALL employees named Celina...')
    const { data: emps } = await supabase.from('employees').select('*').ilike('full_name', '%Celina%')
    console.log('Employees found:', emps)

    if (emps && emps.length > 0) {
        for (const emp of emps) {
            console.log(`Checking user_roles for user_id: ${emp.user_id} (${emp.email})`)
            const { data: roles } = await supabase.from('user_roles').select('*').eq('user_id', emp.user_id)
            console.log('Roles:', roles)
        }
    }

    // Check profiles with this email
    console.log('Checking profiles for celina.ribeiro@medbeauty.com.br...')
    const { data: profs } = await supabase.from('profiles').select('*').ilike('email', 'celina.ribeiro@medbeauty.com.br')
    console.log('Profiles found:', profs)
}

deepAudit()
