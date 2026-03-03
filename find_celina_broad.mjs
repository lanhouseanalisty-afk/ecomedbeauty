import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hxdfbwptgtthaqddneyr.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4ZGZid3B0Z3R0aGFxZGRuZXlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxOTk5ODksImV4cCI6MjA4NDc3NTk4OX0.rXq8BNh1vARTYhD8VZLF4yWrFkE4XW2r5gRrr8Jnc6c'

const supabase = createClient(supabaseUrl, supabaseKey)

async function findCelina() {
    console.log('Searching for "Celina" in ALL tables...')

    const { data: ps } = await supabase.from('profiles').select('*').ilike('full_name', '%Celina%')
    console.log('Profiles with name Celina:', ps)

    const { data: es } = await supabase.from('employees').select('id, user_id, email, full_name').ilike('full_name', '%Celina%')
    console.log('Employees with name Celina:', es)

    const { data: rs } = await supabase.from('user_roles').select('*')
    console.log('Total user_roles count:', rs?.length)
}

findCelina()
