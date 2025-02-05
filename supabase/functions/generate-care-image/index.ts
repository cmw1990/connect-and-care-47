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

    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');

    if (!perplexityApiKey) {
      console.error('Perplexity API key not configured');
      return new Response(
        JSON.stringify({ 
          error: "Configuration error", 
          details: "Perplexity API key not configured",
          fallbackImage: `https://placehold.co/600x400/e2e8f0/64748b?text=${encodeURIComponent(disease)}+Care+Guide`
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Generating image for:', disease);

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "pplx-12b-online",
        messages: [
          {
            role: "system",
            content: "You are an AI that generates image descriptions that can be used to create medical illustrations."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Perplexity API error:', error);
      
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

    const data = await response.json();
    const imageDescription = data.choices[0].message.content;

    // For now, return a placeholder image with the AI-generated description
    return new Response(
      JSON.stringify({ 
        imageUrl: `https://placehold.co/600x400/e2e8f0/64748b?text=${encodeURIComponent(disease)}`,
        description: imageDescription 
      }),
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