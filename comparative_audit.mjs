import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hxdfbwptgtthaqddneyr.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4ZGZid3B0Z3R0aGFxZGRuZXlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxOTk5ODksImV4cCI6MjA4NDc3NTk4OX0.rXq8BNh1vARTYhD8VZLF4yWrFkE4XW2r5gRrr8Jnc6c'

const supabase = createClient(supabaseUrl, supabaseKey)

async function comparativeAudit() {
    console.log('Auditing Reginaldo...')
    const { data: regEmps } = await supabase.from('employees').select('*').ilike('email', 'reginaldo.mazaro@ext.medbeauty.com.br')
    console.log('Reginaldo Employee:', regEmps)

    if (regEmps && regEmps.length > 0) {
        const { data: regRoles } = await supabase.from('user_roles').select('*').eq('user_id', regEmps[0].user_id)
        console.log('Reginaldo Roles:', regRoles)
    }

    console.log('Auditing Celina again...')
    const { data: celEmps } = await supabase.from('employees').select('*').ilike('email', 'celina.ribeiro@medbeauty.com.br')
    console.log('Celina Employee:', celEmps)

    if (celEmps && celEmps.length > 0) {
        const { data: celRoles } = await supabase.from('user_roles').select('*').eq('user_id', celEmps[0].user_id)
        console.log('Celina Roles:', celRoles)
    }
}

comparativeAudit()
