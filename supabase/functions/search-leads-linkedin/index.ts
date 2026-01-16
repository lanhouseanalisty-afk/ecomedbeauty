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
    const { keywords, location, company, title } = await req.json();
    const accessToken = Deno.env.get('LINKEDIN_ACCESS_TOKEN');

    if (!accessToken) {
      console.error('LINKEDIN_ACCESS_TOKEN not configured');
      throw new Error('LinkedIn access token not configured');
    }

    console.log('Searching LinkedIn for:', { keywords, location, company, title });

    // LinkedIn's API has very limited free access
    // For full functionality, you would need LinkedIn Sales Navigator or Marketing API access
    // This implementation uses the basic People Search API (requires Marketing Developer Platform access)

    let leads: any[] = [];

    // Search for companies
    if (company || keywords) {
      const searchQuery = company || keywords;
      
      // Organization lookup
      const orgSearchUrl = `https://api.linkedin.com/v2/organizationLookup?q=vanityName&vanityName=${encodeURIComponent(searchQuery)}`;
      
      console.log('Searching LinkedIn organizations...');
      const orgResponse = await fetch(orgSearchUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0',
        },
      });

      if (orgResponse.ok) {
        const orgData = await orgResponse.json();
        
        if (orgData.elements && orgData.elements.length > 0) {
          leads = orgData.elements.map((org: any) => ({
            company_name: org.localizedName,
            vanity_name: org.vanityName,
            description: org.localizedDescription,
            website: org.localizedWebsite,
            industry: org.industry,
            staff_count_range: org.staffCountRange,
            headquarters: org.headquarters,
            source: 'linkedin_company',
          }));
        }
      } else {
        // Fallback: Try Sales Navigator API if available
        const snSearchUrl = `https://api.linkedin.com/v2/salesNavigatorProfileLookup?q=criteria`;
        
        console.log('Trying Sales Navigator API...');
        const snResponse = await fetch(snSearchUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0',
          },
          body: JSON.stringify({
            keywords: keywords,
            locations: location ? [location] : undefined,
            companies: company ? [company] : undefined,
            titles: title ? [title] : undefined,
          }),
        });

        if (snResponse.ok) {
          const snData = await snResponse.json();
          
          if (snData.elements) {
            leads = snData.elements.map((profile: any) => ({
              first_name: profile.firstName,
              last_name: profile.lastName,
              headline: profile.headline,
              location: profile.location?.name,
              company: profile.currentCompany?.name,
              title: profile.title,
              profile_url: profile.publicProfileUrl,
              source: 'linkedin_sales_navigator',
            }));
          }
        } else {
          const errorText = await snResponse.text();
          console.error('LinkedIn API error:', snResponse.status, errorText);
          
          // Return a helpful message about API access
          return new Response(JSON.stringify({ 
            leads: [],
            total: 0,
            message: 'LinkedIn API access requires Sales Navigator or Marketing Developer Platform access. Please ensure your access token has the necessary permissions.',
            api_status: snResponse.status,
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }
    }

    // People search (requires specific permissions)
    if (title || (location && !company && !keywords)) {
      const peopleSearchUrl = `https://api.linkedin.com/v2/people?q=people&keywords=${encodeURIComponent(title || location || '')}`;
      
      console.log('Searching LinkedIn people...');
      const peopleResponse = await fetch(peopleSearchUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0',
        },
      });

      if (peopleResponse.ok) {
        const peopleData = await peopleResponse.json();
        
        if (peopleData.elements) {
          const peopleLeads = peopleData.elements.map((person: any) => ({
            first_name: person.firstName?.localized?.en_US || person.firstName,
            last_name: person.lastName?.localized?.en_US || person.lastName,
            headline: person.headline?.localized?.en_US || person.headline,
            location: person.location?.name,
            source: 'linkedin_people',
          }));
          
          leads = [...leads, ...peopleLeads];
        }
      }
    }

    console.log(`Found ${leads.length} leads from LinkedIn`);

    return new Response(JSON.stringify({ leads, total: leads.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in search-leads-linkedin function:', error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
