import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hxdfbwptgtthaqddneyr.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4ZGZid3B0Z3R0aGFxZGRuZXlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxOTk5ODksImV4cCI6MjA4NDc3NTk4OX0.rXq8BNh1vARTYhD8VZLF4yWrFkE4XW2r5gRrr8Jnc6c'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkEnum() {
    const { data, error } = await supabase.rpc('get_enum_values', { enum_name: 'app_role' })
    if (error) {
        // If RPC doesn't exist, try a standard query to pg_enum
        console.log('RPC failed, trying raw query...')
        const { data: enumData, error: rawError } = await supabase.from('pg_type').select('typname, pg_enum(enumlabel)').eq('typname', 'app_role')
        // Wait, anon key can't query pg_catalog usually.
        // I'll just try to insert a fake user with role 'user' and see the error.

        console.log('Testing insert of role "user"...')
        const { error: insError } = await supabase.from('user_roles').insert({ user_id: 'db2a7924-f726-4475-8bd3-009941328080', role: 'user' })
        if (insError) {
            console.log('Insert failed as expected:', insError.message)
        } else {
            console.log('Insert succeeded! "user" IS valid.')
        }
    } else {
        console.log('Enum values:', data)
    }
}

checkEnum()
