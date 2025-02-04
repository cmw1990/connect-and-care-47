import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ComparisonRequest {
  items: any[];
  type: 'facilities' | 'products';
  userType?: string;
}

serve(async (req) => {
  try {
    // Handle CORS
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders })
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { items, type, userType = 'family_caregiver' }: ComparisonRequest = await req.json()

    console.log('Processing comparison analysis:', { type, userType, itemCount: items.length })

    // Get OpenAI API Key
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('Missing OpenAI API key')
    }

    // Prepare the analysis prompt based on type and user role
    const basePrompt = type === 'facilities' 
      ? 'Analyze these care facilities for comparison:'
      : 'Compare these healthcare products:';

    const roleContext = {
      family_caregiver: 'Focus on accessibility, comfort, and family-friendly aspects.',
      professional_caregiver: 'Emphasize medical facilities, staff qualifications, and care protocols.',
      facility_staff: 'Consider operational efficiency, resource management, and care coordination.',
    }[userType] || '';

    const itemsDescription = items.map(item => `
      Name: ${item.name}
      Description: ${item.description || 'No description available'}
      ${type === 'facilities' ? `Location: ${JSON.stringify(item.location)}` : ''}
      ${type === 'products' ? `Price Range: ${JSON.stringify(item.price_range)}` : ''}
    `).join('\n');

    const prompt = `${basePrompt}\n\n${itemsDescription}\n\n${roleContext}\n\nProvide a detailed comparison analysis including:\n1. Strengths and weaknesses\n2. Cost-benefit analysis\n3. Recommendations based on user type (${userType})\n4. Key differentiating factors`;

    // Call OpenAI API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{
          role: 'user',
          content: prompt,
        }],
        temperature: 0.7,
      }),
    });

    if (!openAIResponse.ok) {
      throw new Error('Failed to get analysis from OpenAI');
    }

    const analysis = await openAIResponse.json();
    const analysisText = analysis.choices[0].message.content;

    console.log('Analysis generated successfully');

    // Store the analysis in the care_analytics table
    const { error: dbError } = await supabaseClient
      .from('care_analytics')
      .insert({
        metric_type: `${type}_comparison`,
        metric_value: {
          items: items.map(i => i.id),
          analysis: analysisText,
          userType,
        },
      });

    if (dbError) {
      console.error('Error storing analysis:', dbError);
    }

    return new Response(
      JSON.stringify({
        analysis: analysisText,
        timestamp: new Date().toISOString(),
      }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      },
    );
  } catch (error) {
    console.error('Error in compare-analysis function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      },
    );
  }
});