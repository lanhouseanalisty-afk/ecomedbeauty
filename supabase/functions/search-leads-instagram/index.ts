import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { hashtag, username } = await req.json()

    if (!hashtag && !username) {
      return new Response(
        JSON.stringify({ error: 'Hashtag ou username são obrigatórios' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      )
    }

    // Instagram Basic Display API configuration
    const INSTAGRAM_ACCESS_TOKEN = Deno.env.get('INSTAGRAM_ACCESS_TOKEN')

    if (!INSTAGRAM_ACCESS_TOKEN) {
      return new Response(
        JSON.stringify({
          error: 'Instagram API não configurada',
          message: 'Para usar a busca do Instagram, configure o INSTAGRAM_ACCESS_TOKEN nas variáveis de ambiente do Supabase.'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      )
    }

    // Note: Instagram Graph API has limitations for searching by hashtag
    // This is a simplified implementation
    const leads: any[] = []

    if (username) {
      // Search for user by username
      const userUrl = `https://graph.instagram.com/v18.0/me?fields=id,username,name,account_type&access_token=${INSTAGRAM_ACCESS_TOKEN}`

      try {
        const userResponse = await fetch(userUrl)
        const userData = await userResponse.json()

        if (userData.id) {
          leads.push({
            username: userData.username,
            name: userData.name,
            account_type: userData.account_type,
          })
        }
      } catch (error) {
        console.error('Instagram API error:', error)
      }
    }

    return new Response(
      JSON.stringify({
        leads,
        message: leads.length === 0
          ? 'Nenhum resultado encontrado. A busca no Instagram requer configuração adicional da API.'
          : undefined
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
