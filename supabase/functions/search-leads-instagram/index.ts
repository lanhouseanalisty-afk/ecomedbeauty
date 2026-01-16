import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { hashtag, username } = await req.json();
    const accessToken = Deno.env.get('INSTAGRAM_ACCESS_TOKEN');

    if (!accessToken) {
      console.error('INSTAGRAM_ACCESS_TOKEN not configured');
      throw new Error('Instagram access token not configured');
    }

    console.log('Searching Instagram for:', { hashtag, username });

    let leads: any[] = [];

    // Search by hashtag using Instagram Graph API
    if (hashtag) {
      // First, get the hashtag ID
      const hashtagSearchUrl = `https://graph.facebook.com/v18.0/ig_hashtag_search?user_id=me&q=${encodeURIComponent(hashtag)}&access_token=${accessToken}`;
      
      console.log('Searching hashtag...');
      const hashtagResponse = await fetch(hashtagSearchUrl);
      const hashtagData = await hashtagResponse.json();

      if (hashtagData.error) {
        console.error('Instagram API error:', hashtagData.error);
        throw new Error(`Instagram API error: ${hashtagData.error.message}`);
      }

      if (hashtagData.data && hashtagData.data.length > 0) {
        const hashtagId = hashtagData.data[0].id;
        
        // Get recent media for the hashtag
        const mediaUrl = `https://graph.facebook.com/v18.0/${hashtagId}/recent_media?user_id=me&fields=id,caption,permalink,username,timestamp&access_token=${accessToken}`;
        const mediaResponse = await fetch(mediaUrl);
        const mediaData = await mediaResponse.json();

        if (mediaData.data) {
          // Extract unique usernames from posts
          const usernames = new Set<string>();
          mediaData.data.forEach((post: any) => {
            if (post.username) {
              usernames.add(post.username);
            }
          });

          leads = Array.from(usernames).slice(0, 20).map(username => ({
            username,
            source: 'instagram_hashtag',
            hashtag: hashtag,
          }));
        }
      }
    }

    // Search by username (business account lookup)
    if (username) {
      const userSearchUrl = `https://graph.facebook.com/v18.0/ig_username_search?username=${encodeURIComponent(username)}&access_token=${accessToken}`;
      
      console.log('Searching username...');
      const userResponse = await fetch(userSearchUrl);
      const userData = await userResponse.json();

      if (userData.error) {
        // If the endpoint doesn't exist, try alternative method
        console.log('Username search not available, trying business discovery...');
        
        // Business discovery requires a connected Instagram Business account
        const discoveryUrl = `https://graph.facebook.com/v18.0/me?fields=business_discovery.username(${encodeURIComponent(username)}){username,name,biography,website,followers_count,follows_count,media_count}&access_token=${accessToken}`;
        
        const discoveryResponse = await fetch(discoveryUrl);
        const discoveryData = await discoveryResponse.json();

        if (discoveryData.business_discovery) {
          const business = discoveryData.business_discovery;
          leads.push({
            username: business.username,
            name: business.name,
            bio: business.biography,
            website: business.website,
            followers_count: business.followers_count,
            follows_count: business.follows_count,
            media_count: business.media_count,
            source: 'instagram_business',
          });
        }
      } else if (userData.data) {
        leads = userData.data.map((user: any) => ({
          username: user.username,
          id: user.id,
          source: 'instagram_search',
        }));
      }
    }

    console.log(`Found ${leads.length} leads from Instagram`);

    return new Response(JSON.stringify({ leads, total: leads.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in search-leads-instagram function:', error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
