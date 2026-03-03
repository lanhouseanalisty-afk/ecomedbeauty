import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hxdfbwptgtthaqddneyr.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4ZGZid3B0Z3R0aGFxZGRuZXlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxOTk5ODksImV4cCI6MjA4NDc3NTk4OX0.rXq8BNh1vARTYhD8VZLF4yWrFkE4XW2r5gRrr8Jnc6c'

const supabase = createClient(supabaseUrl, supabaseKey)

async function applyRole() {
    const userId = 'db2a7924-f726-4475-8bd3-009941328080'
    console.log(`Applying admin role to user_id: ${userId}`)

    // 1. Delete existing roles (if any hidden ones exist)
    await supabase.from('user_roles').delete().eq('user_id', userId)

    // 2. Insert admin role
    const { data, error } = await supabase.from('user_roles').insert({
        user_id: userId,
        role: 'admin',
        permissions: ['*']
    }).select()

    if (error) {
        console.error('Error applying role:', error.message)
    } else {
        console.log('Role applied successfully:', data)
    }
}

applyRole()
