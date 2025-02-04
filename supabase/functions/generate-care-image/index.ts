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
    const { disease, description, userType } = await req.json();
    const openaiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openaiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Customize the prompt based on the user type and context
    let basePrompt = `Create a professional medical illustration for ${disease}.`;
    
    switch (userType) {
      case 'professional_caregiver':
        basePrompt += ` Include detailed clinical care instructions and medical monitoring points. ${description}. Style: Clean, professional medical illustration with anatomical accuracy.`;
        break;
      case 'care_facility_staff':
        basePrompt += ` Show facility-based care procedures and equipment setup. ${description}. Style: Institutional healthcare setting with clear procedural steps.`;
        break;
      case 'family_caregiver':
        basePrompt += ` Focus on home care techniques and daily management. ${description}. Style: Warm, approachable illustrations with simple, clear instructions.`;
        break;
      default:
        basePrompt += ` ${description}. Style: Clear, informative medical illustration.`;
    }

    console.log('Generating image with prompt:', basePrompt);

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: basePrompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        response_format: "url"
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    console.log('Successfully generated image');

    return new Response(
      JSON.stringify({ 
        imageUrl: data.data[0].url,
        prompt: basePrompt // Include the prompt for reference
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Error in generate-care-image function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});