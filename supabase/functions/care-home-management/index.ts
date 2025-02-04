import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CareHomeRequest {
  facilityId: string;
  action: 'analyze' | 'optimize' | 'forecast';
  data: {
    occupancy: number;
    staffing: Record<string, number>;
    resources: Record<string, number>;
    metrics: Record<string, number>;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { facilityId, action, data }: CareHomeRequest = await req.json();

    // Get facility details
    const { data: facility, error: facilityError } = await supabase
      .from('care_home_facilities')
      .select('*')
      .eq('facility_id', facilityId)
      .single();

    if (facilityError) throw facilityError;

    // Prepare analysis prompt based on action type
    const prompt = `As a care home management expert, ${action} the following facility data:

Facility Metrics:
- Occupancy Rate: ${data.occupancy}%
- Staff-to-Patient Ratio: ${data.staffing.ratio}
- Resource Utilization: ${data.resources.utilization}%
- Quality Metrics: ${data.metrics.quality}

Current Status:
${JSON.stringify(facility, null, 2)}

Please provide:
1. ${action === 'analyze' ? 'Detailed analysis of current operations' : 
     action === 'optimize' ? 'Optimization recommendations' : 
     'Future resource and staffing needs forecast'}
2. Key areas of concern
3. Specific recommendations
4. Implementation timeline
5. Expected outcomes
6. Risk mitigation strategies`;

    // Get AI analysis
    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: 'You are an experienced care home management consultant providing detailed analysis and recommendations.'
          },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      throw new Error('Failed to get AI analysis');
    }

    const analysis = await aiResponse.json();
    const managementAnalysis = analysis.choices[0].message.content;

    // Store the analysis in care_analytics
    const { data: analyticsRecord, error: analyticsError } = await supabase
      .from('care_analytics')
      .insert({
        group_id: facilityId,
        metric_type: `care_home_${action}`,
        metric_value: {
          analysis: managementAnalysis,
          timestamp: new Date().toISOString(),
          metrics: data
        }
      })
      .select()
      .single();

    if (analyticsError) throw analyticsError;

    console.log('Successfully processed care home analysis:', analyticsRecord.id);

    return new Response(
      JSON.stringify({
        analysis: managementAnalysis,
        metrics: data,
        recommendations: managementAnalysis.split('\n').filter((line: string) => 
          line.startsWith('- ') || line.startsWith('* ')
        )
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  } catch (error) {
    console.error('Error in care-home-management function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  }
});