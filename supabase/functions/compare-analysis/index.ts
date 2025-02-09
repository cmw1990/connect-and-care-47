
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
  careNeeds?: string[];
  budget?: { min: number; max: number };
  location?: { lat: number; lng: number };
  priorities?: string[];
}

interface QualityMetrics {
  overall: number;
  safety: number;
  staffing: number;
  care: number;
  activities: number;
  value: number;
}

function calculateQualityMetrics(item: any): QualityMetrics {
  const metrics = {
    overall: 0,
    safety: 0,
    staffing: 0,
    care: 0,
    activities: 0,
    value: 0
  };

  if (item.ratings) {
    metrics.overall = Object.values(item.ratings).reduce((a: any, b: any) => a + b, 0) / Object.keys(item.ratings).length;
  }

  if (item.quality_metrics) {
    metrics.safety = item.quality_metrics.safety_measures || 0;
    metrics.staffing = item.quality_metrics.staff_training || 0;
    metrics.care = item.quality_metrics.medical_care || 0;
    metrics.activities = item.quality_metrics.activities || 0;
  }

  if (item.cost_range && metrics.overall > 0) {
    const avgCost = (item.cost_range.min + item.cost_range.max) / 2;
    metrics.value = metrics.overall / (avgCost / 1000); // Normalize by cost in thousands
  }

  return metrics;
}

function generateCompetitiveAnalysis(items: any[], type: string) {
  const analysis = items.map(item => {
    const strengths = [];
    const weaknesses = [];
    const opportunities = [];
    const threats = [];

    // Analyze ratings and metrics
    if (item.ratings && Object.values(item.ratings).some((r: any) => r > 4.5)) {
      strengths.push('High customer satisfaction');
    }
    if (item.response_rate && item.response_rate > 0.9) {
      strengths.push('Excellent response rate');
    }
    if (item.verified) {
      strengths.push('Verified provider');
    }

    // Analyze costs
    if (item.cost_range) {
      const avgCost = (item.cost_range.min + item.cost_range.max) / 2;
      const value = item.ratings ? 
        Object.values(item.ratings).reduce((a: any, b: any) => a + b, 0) / Object.keys(item.ratings).length / avgCost : 
        null;
      
      if (value && value > 0.8) {
        strengths.push('Good value for money');
      } else if (value && value < 0.5) {
        weaknesses.push('High cost relative to ratings');
      }
    }

    // Analyze specialized features
    if (type === 'facilities') {
      if (item.specialized_care && item.specialized_care.length > 0) {
        strengths.push('Specialized care options');
      }
      if (item.staff_ratio && item.staff_ratio < 5) {
        strengths.push('High staff-to-resident ratio');
      }
      if (!item.emergency_response_time) {
        weaknesses.push('No emergency response time data');
      }
    } else {
      if (item.safety_certifications && item.safety_certifications.length > 0) {
        strengths.push('Safety certified');
      }
      if (item.training_materials && Object.keys(item.training_materials).length > 0) {
        strengths.push('Comprehensive training materials');
      }
    }

    return {
      id: item.id,
      strengths,
      weaknesses,
      opportunities,
      threats
    };
  });

  return analysis;
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

    const { items, type, userType = 'family_caregiver', careNeeds = [], priorities = [] }: ComparisonRequest = await req.json()

    console.log('Processing comparison analysis:', { type, userType, itemCount: items.length })

    // Get OpenAI API Key
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('Missing OpenAI API key')
    }

    // Calculate quality metrics for each item
    const itemsWithMetrics = items.map(item => ({
      ...item,
      metrics: calculateQualityMetrics(item)
    }));

    // Generate competitive analysis
    const competitiveAnalysis = generateCompetitiveAnalysis(items, type);

    // Prepare the analysis prompt based on type and user role
    const basePrompt = type === 'facilities' 
      ? 'Analyze these care facilities for comparison:'
      : 'Compare these healthcare products:';

    const roleContext = {
      family_caregiver: 'Focus on accessibility, comfort, safety metrics, and value for money. Consider emotional and practical aspects of care.',
      professional_caregiver: 'Emphasize clinical capabilities, staff qualifications, care protocols, and operational efficiency.',
      facility_staff: 'Focus on operational metrics, resource management, and care coordination capabilities.',
    }[userType] || '';

    const needsContext = careNeeds.length > 0 
      ? `Specific care needs to consider: ${careNeeds.join(', ')}`
      : '';

    const prioritiesContext = priorities.length > 0
      ? `Key priorities: ${priorities.join(', ')}`
      : '';

    const itemsDescription = itemsWithMetrics.map(item => `
      Name: ${item.name}
      Description: ${item.description || 'No description available'}
      Quality Metrics: ${JSON.stringify(item.metrics)}
      ${type === 'facilities' ? `Location: ${JSON.stringify(item.location)}` : ''}
      ${type === 'products' ? `Price Range: ${JSON.stringify(item.price_range)}` : ''}
      Competitive Analysis: ${JSON.stringify(competitiveAnalysis.find(a => a.id === item.id))}
    `).join('\n');

    const prompt = `${basePrompt}\n\n${itemsDescription}\n\n${roleContext}\n\n${needsContext}\n\n${prioritiesContext}\n\nProvide a detailed comparison analysis including:
    1. Overall quality and value assessment
    2. Strengths and weaknesses of each option
    3. Cost-benefit analysis
    4. Safety and risk assessment
    5. Recommendations based on user type (${userType}) and specific needs
    6. Key differentiating factors
    7. Potential red flags or concerns
    8. Long-term considerations`;

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
          careNeeds,
          priorities,
          competitiveAnalysis
        },
      });

    if (dbError) {
      console.error('Error storing analysis:', dbError);
    }

    return new Response(
      JSON.stringify({
        analysis: analysisText,
        qualityMetrics: itemsWithMetrics.map(i => ({
          id: i.id,
          metrics: i.metrics
        })),
        competitiveAnalysis,
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
