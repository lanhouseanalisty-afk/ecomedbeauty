import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hxdfbwptgtthaqddneyr.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4ZGZid3B0Z3R0aGFxZGRuZXlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxOTk5ODksImV4cCI6MjA4NDc3NTk4OX0.rXq8BNh1vARTYhD8VZLF4yWrFkE4XW2r5gRrr8Jnc6c'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testInsert() {
    console.log('Testing minimal insert into employees...')
    const { data, error } = await supabase.from('employees').insert({
        full_name: 'Test Constraint',
        email: 'test@example.com'
    }).select()

    if (error) {
        console.log('ERROR_MSG: ' + error.message)
        console.log('ERROR_HINT: ' + error.hint)
        console.log('ERROR_CODE: ' + error.code)
    } else {
        console.log('SUCCESS: ', data)
    }
}

testInsert()
