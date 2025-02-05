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

    if (!disease || !description) {
      throw new Error('Both disease and description are required');
    }

    const prompt = `Create a caring and supportive medical illustration for ${disease}. The image should be: ${description}. Style: Professional medical illustration with a warm and comforting feel. Make it suitable for healthcare applications.`;

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openAIApiKey) {
      console.error('OpenAI API key not configured');
      return new Response(
        JSON.stringify({ 
          error: "Configuration error", 
          details: "OpenAI API key not configured",
          fallbackImage: `https://placehold.co/600x400/e2e8f0/64748b?text=${encodeURIComponent(disease)}+Care+Guide`
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Generating image for:', disease);

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
      console.error('OpenAI API error:', error);
      
      // Handle billing errors specifically
      if (error.error?.message?.includes('billing')) {
        return new Response(
          JSON.stringify({ 
            error: "Service temporarily unavailable",
            details: "Image generation service is currently unavailable",
            fallbackImage: `https://placehold.co/600x400/e2e8f0/64748b?text=${encodeURIComponent(disease)}+Care+Guide`
          }),
          { 
            status: 503,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return new Response(
      JSON.stringify({ imageUrl: data.data[0].url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-care-image function:', error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to generate image",
        details: error.message,
        fallbackImage: `https://placehold.co/600x400/e2e8f0/64748b?text=Care+Guide`
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});