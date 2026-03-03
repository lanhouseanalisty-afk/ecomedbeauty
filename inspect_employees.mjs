import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hxdfbwptgtthaqddneyr.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4ZGZid3B0Z3R0aGFxZGRuZXlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxOTk5ODksImV4cCI6MjA4NDc3NTk4OX0.rXq8BNh1vARTYhD8VZLF4yWrFkE4XW2r5gRrr8Jnc6c'

const supabase = createClient(supabaseUrl, supabaseKey)

async function inspectEmployees() {
    const { data, error } = await supabase.from('employees').select('id, user_id, email, full_name, role').limit(5)
    if (error) {
        console.error('Error:', error.message)
    } else if (data && data.length > 0) {
        console.log('Columns in employees:', Object.keys(data[0]))
        console.log('Sample data:', data[0])
    } else {
        console.log('No data found in employees.')
    }
}

inspectEmployees()
