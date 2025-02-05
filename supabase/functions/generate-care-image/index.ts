import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024"
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      if (error.error?.message?.includes('billing')) {
        return new Response(
          JSON.stringify({ 
            error: "Image generation temporarily unavailable",
            details: "Service is currently unavailable. Please try again later.",
            fallbackImage: "/placeholder.svg"
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 503
          }
        );
      }
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return new Response(
      JSON.stringify({ url: data.data[0].url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-care-image function:', error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to generate image",
        details: error.message,
        fallbackImage: "/placeholder.svg"
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});