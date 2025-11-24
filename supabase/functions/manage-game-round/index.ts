import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { action, roundId, query } = await req.json()

        // Create Supabase client with Service Role Key for admin access
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        if (action === 'regenerate_image') {
            if (!query) throw new Error('Query is required')
            if (!roundId) throw new Error('Round ID is required')

            const apiKey = Deno.env.get('VALUESERP_API_KEY')
            if (!apiKey) throw new Error('VALUESERP_API_KEY not set')

            // Search for images
            console.log(`Searching for image: ${query}`)
            const searchUrl = `https://api.valueserp.com/search?api_key=${apiKey}&q=${encodeURIComponent(query)}&tbm=isch&num=20`
            const resp = await fetch(searchUrl)
            const data = await resp.json()

            if (!data.images_results || data.images_results.length === 0) {
                throw new Error('No images found for this query')
            }

            // Pick a random image from the results to allow "trying again"
            const randomIndex = Math.floor(Math.random() * Math.min(data.images_results.length, 20));
            const imageUrl = data.images_results[randomIndex].original;

            console.log(`Selected image: ${imageUrl}`)

            // Update the round in the database
            const { error: updateError } = await supabaseClient
                .from('prepared_game_rounds')
                .update({ image_url: imageUrl })
                .eq('id', roundId)

            if (updateError) throw updateError

            return new Response(
                JSON.stringify({ success: true, image_url: imageUrl }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        throw new Error(`Invalid action: ${action}`)

    } catch (error) {
        console.error('Error:', error.message)
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
})
