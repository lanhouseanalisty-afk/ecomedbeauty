import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hxdfbwptgtthaqddneyr.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4ZGZid3B0Z3R0aGFxZGRuZXlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxOTk5ODksImV4cCI6MjA4NDc3NTk4OX0.rXq8BNh1vARTYhD8VZLF4yWrFkE4XW2r5gRrr8Jnc6c'

const supabase = createClient(supabaseUrl, supabaseKey)

async function forceUpdateRole() {
    const emails = ['celina@ecomedbeauty.com.br', 'celina.ribeiro@medbeauty.com.br']

    for (const email of emails) {
        console.log(`Calling Edge Function for ${email}...`)
        const { data, error } = await supabase.functions.invoke('update-user-password', {
            body: {
                email: email,
                employeeName: 'Celina',
                role: 'user'
            },
            headers: {
                'x-diagnostic-secret': 'medbeauty-debug-2026'
            }
        })

        if (error) {
            console.error(`Error for ${email}:`, error.message)
        } else {
            console.log(`Success for ${email}:`, data)
        }
    }
}

forceUpdateRole()
