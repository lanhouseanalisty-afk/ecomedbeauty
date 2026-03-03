import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hxdfbwptgtthaqddneyr.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4ZGZid3B0Z3R0aGFxZGRuZXlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxOTk5ODksImV4cCI6MjA4NDc3NTk4OX0.rXq8BNh1vARTYhD8VZLF4yWrFkE4XW2r5gRrr8Jnc6c'

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugTables() {
    console.log('--- Sample Employees ---')
    const { data: employees, error: empErr } = await supabase.from('employees').select('*').limit(5)
    if (empErr) console.error('Emp Error:', empErr.message)
    else console.log('Employees Sample:', employees)

    console.log('\n--- user_roles Columns ---')
    const { data: roles, error: rolesErr } = await supabase.from('user_roles').select('*').limit(1)
    if (rolesErr) console.error('Roles Error:', rolesErr.message)
    else {
        if (roles && roles.length > 0) console.log('Roles Columns:', Object.keys(roles[0]))
        else console.log('Roles table is empty or permission denied.')
    }

    console.log('\n--- Checking all user_roles entries ---')
    const { data: allRoles, error: allRolesErr } = await supabase.from('user_roles').select('*')
    if (allRolesErr) console.error('All Roles Error:', allRolesErr.message)
    else console.log('Total Roles Count:', allRoles.length)
}

debugTables()
