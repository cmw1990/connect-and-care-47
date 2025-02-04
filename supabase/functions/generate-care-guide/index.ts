import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
    const { disease, description } = await req.json();

    // Generate a detailed care guide using OpenAI
    const prompt = `Create a comprehensive care guide for ${disease}. 
    Include the following sections:
    1. Overview of the condition
    2. Common symptoms and their management
    3. Daily care routine
    4. Warning signs to watch for
    5. Tips for caregivers
    
    Additional context: ${description}
    
    Format the response as a detailed, step-by-step guide that could be used to create an educational video.`;

    console.log('Generating care guide for:', disease);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert healthcare educator creating detailed care guides for caregivers.' 
          },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate care guide content');
    }

    const data = await response.json();
    const guideContent = data.choices[0].message.content;

    // For now, we'll return a placeholder video URL
    // In a real implementation, you would:
    // 1. Use the generated content to create an animated video
    // 2. Upload the video to storage
    // 3. Return the video URL
    const mockVideoUrl = "https://example.com/placeholder-video.mp4";

    console.log('Successfully generated care guide');

    return new Response(
      JSON.stringify({ 
        videoUrl: mockVideoUrl,
        content: guideContent 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error in generate-care-guide function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});