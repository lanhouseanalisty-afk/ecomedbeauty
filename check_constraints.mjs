import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hxdfbwptgtthaqddneyr.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4ZGZid3B0Z3R0aGFxZGRuZXlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxOTk5ODksImV4cCI6MjA4NDc3NTk4OX0.rXq8BNh1vARTYhD8VZLF4yWrFkE4XW2r5gRrr8Jnc6c'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkConstraints() {
    console.log('Fetching constraints for user_roles...')

    // Try to query information_schema.table_constraints
    // Note: RPC would be better but if not available we can try various select patterns
    // Since we don't have direct SQL access, we might have to guess or use errors

    // Let's try to fetch a row and check the data type of 'role'
    const { data, error } = await supabase.from('user_roles').select('*').limit(1)
    if (error) {
        console.error('Error fetching row:', error.message)
    } else {
        console.log('Sample Row:', data)
    }

    // Check roles enum by trying to insert invalid role and seeing detailed error
    console.log('Testing roles by trying various inserts...')
    const testRoles = ['admin', 'user', 'viewer', 'invalid_role_123']
    for (const role of testRoles) {
        const { error: insertError } = await supabase.from('user_roles').insert({
            user_id: 'db2a7924-f726-4475-8bd3-009941328080',
            role: role
        })
        if (insertError) {
            console.log(`Role [${role}] failed: ${insertError.message}`)
        } else {
            console.log(`Role [${role}] succeeded!`)
            // Clean up if it succeeded
            await supabase.from('user_roles').delete().eq('user_id', 'db2a7924-f726-4475-8bd3-009941328080').eq('role', role)
        }
    }
}

checkConstraints()
