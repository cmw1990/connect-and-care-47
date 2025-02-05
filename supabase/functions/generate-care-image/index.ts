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
    const { disease, description } = await req.json();
    const openaiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openaiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: `Create a professional medical illustration for ${disease}. ${description}. Style: Clear, informative medical illustration.`,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        response_format: "url"
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      
      // Check if it's a billing error
      if (error.error?.message?.includes('billing')) {
        return new Response(
          JSON.stringify({ 
            error: "Image generation temporarily unavailable",
            details: "Service is currently unavailable. Please try again later."
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 503
          }
        );
      }
      
      throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    console.log('Successfully generated image');

    return new Response(
      JSON.stringify({ 
        imageUrl: data.data[0].url,
        prompt: `Create a professional medical illustration for ${disease}. ${description}`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in generate-care-image function:', error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to generate image",
        details: error.message
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});