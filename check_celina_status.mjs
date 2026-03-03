import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hxdfbwptgtthaqddneyr.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4ZGZid3B0Z3R0aGFxZGRuZXlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxOTk5ODksImV4cCI6MjA4NDc3NTk4OX0.rXq8BNh1vARTYhD8VZLF4yWrFkE4XW2r5gRrr8Jnc6c'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkCelina() {
    console.log('--- Checking User Roles ---')
    const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', 'db2a7924-f726-4475-8bd3-009941328080')

    if (rolesError) console.error('Roles Error:', rolesError.message)
    else console.log('Current Roles for ID db2a7924...:', roles)

    console.log('\n--- Searching for Celina in employees ---')
    const { data: employees, error: employeesError } = await supabase
        .from('employees')
        .select('*')
        .ilike('name', '%celina%')

    if (employeesError) console.error('Employees Error:', employeesError.message)
    else console.log('Employees found with name Celina:', employees)

    console.log('\n--- Searching for Celina in profiles ---')
    try {
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('*')
            .ilike('full_name', '%celina%')

        if (profilesError) console.error('Profiles Error (if table exists):', profilesError.message)
        else console.log('Profiles found with name Celina:', profiles)
    } catch (e) {
        console.log('Profiles table probably does not exist or access denied.')
    }
}

checkCelina()
